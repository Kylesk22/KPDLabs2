"""Durable outbound label purchases. Never automatically repeat an uncertain purchase."""
import json
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

import requests
from flask import current_app
from sqlalchemy import inspect, text
from api.models import db, User, Case
from api.kpd_reporting import held, case_logs, money_cents, FLORIDA


class KPDShipment(db.Model):
    __tablename__ = 'kpd_shipment'
    id = db.Column(db.String(36), primary_key=True)
    state = db.Column(db.String(24), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    snapshot = db.Column(db.JSON, nullable=False)
    rates = db.Column(db.JSON, nullable=False)
    selected_rate = db.Column(db.JSON)
    transaction_id = db.Column(db.String(80))
    tracking_number = db.Column(db.String(120))
    label_url = db.Column(db.Text)
    shipped_at = db.Column(db.DateTime)


class KPDShipmentCase(db.Model):
    __tablename__ = 'kpd_shipment_case'
    # One active purchase reservation per case, enforced even across workers.
    case_id = db.Column(db.Integer, db.ForeignKey('case.id'), primary_key=True)
    shipment_id = db.Column(db.String(36), db.ForeignKey('kpd_shipment.id'), nullable=False, index=True)


class ShippingError(ValueError):
    pass


def now_utc():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def adw_case_ids():
    # This is a shared repository. ADW keeps its own verified fulfillment flow.
    if inspect(db.engine).has_table('adw_kpd_case_link'):
        return {row[0] for row in db.session.execute(text('SELECT case_id FROM adw_kpd_case_link'))}
    return set()


def address_for(user, doctor):
    parts = [part.strip() for part in (user.address or '').split(',')]
    if len(parts) < 4:
        raise ShippingError('Update this customer’s saved shipping address before creating a label.')
    street, city, state, zipcode = ', '.join(parts[:-3]), parts[-3], parts[-2], parts[-1]
    if not street or not city or not re.fullmatch(r'[A-Za-z]{2}', state) or not re.fullmatch(r'\d{5}(?:-\d{4})?', zipcode):
        raise ShippingError('The saved address needs a street, city, two-letter state, and ZIP code.')
    return dict(name=doctor, company=user.practice or '', street1=street, city=city, state=state.upper(), zip=zipcode, country='US')


def doctor_for(case, user):
    return (case.doctor_name or f'{user.fname} {user.lname}').strip()


def package_values(value):
    if not isinstance(value, dict):
        raise ShippingError('Enter the package size and weight.')
    result = {}
    for key in ('length', 'width', 'height', 'weight'):
        cents = money_cents(value.get(key))
        if cents is None or cents <= 0 or cents > 15000:
            raise ShippingError('Package measurements must be greater than zero and no more than 150.')
        result[key] = f'{cents / 100:.2f}'
    return dict(result, distance_unit='in', mass_unit='lb')


def selected_cases(ids, lock=False):
    if not isinstance(ids, list) or not ids or len(ids) > 100 or any(type(i) is not int or i <= 0 for i in ids) or len(set(ids)) != len(ids):
        raise ShippingError('Select between 1 and 100 distinct cases.')
    query = Case.query.filter(Case.id.in_(ids)).order_by(Case.id)
    if lock:
        query = query.populate_existing().with_for_update()
    cases = query.all()
    if len(cases) != len(ids):
        raise ShippingError('A selected case no longer exists. Refresh the queue.')
    if set(ids) & adw_case_ids():
        raise ShippingError('ADW cases must use the ADW shipping panel.')
    user = db.session.get(User, cases[0].user_id)
    if not user or any(c.user_id != user.id or doctor_for(c, user) != doctor_for(cases[0], user) for c in cases):
        raise ShippingError('Ship cases for one dentist and customer account together.')
    for case in cases:
        if case.status != 'Ready to Ship' or held(case.hold):
            raise ShippingError('A case is no longer ready to ship or is on hold. Refresh the queue.')
        try:
            logs = json.loads(case.log) if case.log else []
            if not isinstance(logs, list) or any(not isinstance(entry, str) for entry in logs):
                raise ValueError()
        except (ValueError, TypeError):
            raise ShippingError(f'Case #{case.id} has an unreadable history. Review it before purchasing postage.') from None
        if len(json.dumps(logs + ['Tracking Number: ' + 'X' * 120, 'Shipped: 11/18/2026 23:59:59'])) > 2000:
            raise ShippingError(f'Case #{case.id} has reached its history limit. Review it before purchasing postage.')
        if any(entry.startswith('Tracking Number:') for entry in logs):
            raise ShippingError('A selected case already has tracking. Review its existing label before buying another.')
    return cases, user


def snapshot_for(cases, user, parcel):
    doctor = doctor_for(cases[0], user)
    return dict(cases=[c.id for c in cases], doctor=doctor,
                address=address_for(user, doctor), parcel=parcel)


class ShippoProvider:
    def request(self, path, payload=None):
        token = os.getenv('SHIPPO_TOKEN')
        if not token:
            raise ShippingError('Shipping is not configured on this server.')
        headers = {'Authorization': 'ShippoToken ' + token, 'Content-Type': 'application/json', 'SHIPPO-API-VERSION': '2018-02-08'}
        response = requests.request('POST' if payload is not None else 'GET', 'https://api.goshippo.com' + path,
                                    headers=headers, json=payload, timeout=(5, 30))
        response.raise_for_status()
        return response.json()

    def quote(self, snapshot):
        origin = dict(name='KPD Labs', street1='3393 Us Highway 17 92 W', city='Haines City', state='FL', zip='33844',
                      country='US', email='kpdlabs@kpdlabs.com', phone='8634382109')
        return self.request('/shipments/', dict(address_from=origin, address_to=snapshot['address'], parcels=[snapshot['parcel']], **{'async': False}))

    def buy(self, rate_id, shipment_id):
        return self.request('/transactions/', dict(rate=rate_id, metadata='kpd:' + shipment_id, label_file_type='PDF_4x6', **{'async': False}))

    def retrieve(self, transaction_id):
        if not isinstance(transaction_id, str) or not re.fullmatch(r'[A-Za-z0-9]{1,80}', transaction_id):
            raise ShippingError('Enter the Shippo transaction ID.')
        return self.request('/transactions/' + transaction_id + '/')


def provider():
    return current_app.extensions.get('kpd_shipping_provider') or ShippoProvider()


def serialize_shipment(shipment):
    return dict(id=shipment.id, state=shipment.state, created_at=shipment.created_at.isoformat() + 'Z',
                customer_id=shipment.customer_id, **shipment.snapshot, rates=shipment.rates,
                selected_rate=shipment.selected_rate, transaction_id=shipment.transaction_id,
                tracking_number=shipment.tracking_number, label_url=shipment.label_url,
                shipped_at=shipment.shipped_at.isoformat() + 'Z' if shipment.shipped_at else None)


def create_quote(ids, parcel, staff_id):
    cases, user = selected_cases(ids)
    if KPDShipmentCase.query.filter(KPDShipmentCase.case_id.in_(ids)).first():
        raise ShippingError('A label already exists or a purchase is pending for one of these cases. Open shipment history.')
    snapshot = snapshot_for(cases, user, package_values(parcel))
    raw = provider().quote(snapshot)
    rates = []
    for rate in raw.get('rates', []):
        cents = money_cents(rate.get('amount'))
        if cents is None or rate.get('currency') != 'USD' or not rate.get('object_id'):
            continue
        service = rate.get('servicelevel') or {}
        rates.append(dict(id=rate['object_id'], provider=rate.get('provider') or '', service=service.get('name') or '',
                          token=service.get('token') or '', amount_cents=cents, currency='USD'))
    if not rates:
        raise ShippingError('No shipping rates are available for this address and package. Check the saved address and try again.')
    rates.sort(key=lambda rate: (not (rate['provider'].upper() == 'UPS' and rate['token'] == 'ups_ground'), rate['amount_cents']))
    shipment = KPDShipment(id=str(uuid.uuid4()), state='quoted', created_at=now_utc(), created_by=staff_id,
                           customer_id=user.id, snapshot=snapshot, rates=rates)
    db.session.add(shipment)
    db.session.commit()
    return serialize_shipment(shipment)


def complete(shipment, raw):
    rate = raw.get('rate')
    if isinstance(rate, dict):
        rate = rate.get('object_id')
    url = raw.get('label_url') or ''
    parsed = urlparse(url)
    if (raw.get('status') != 'SUCCESS' or rate != shipment.selected_rate['id'] or
            raw.get('metadata') != 'kpd:' + shipment.id or not raw.get('object_id') or
            not raw.get('tracking_number') or parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password):
        raise ShippingError('The label result could not be verified. Reconcile the Shippo transaction before retrying.')
    shipment.state = 'purchased'
    shipment.transaction_id = raw['object_id']
    shipment.tracking_number = raw['tracking_number']
    shipment.label_url = url
    for case in Case.query.filter(Case.id.in_(shipment.snapshot['cases'])).order_by(Case.id).with_for_update().all():
        message = f'Tracking Number: {shipment.tracking_number}'
        if message not in case_logs(case.log):
            case.add_log(message)
    db.session.commit()


def buy_label(shipment_id, rate_id, amount_cents):
    shipment = KPDShipment.query.filter_by(id=shipment_id).with_for_update().first()
    if not shipment:
        raise ShippingError('Shipment not found.')
    if shipment.state in {'purchased', 'shipped'}:
        return serialize_shipment(shipment)
    if shipment.state != 'quoted':
        raise ShippingError('This purchase needs reconciliation. Do not purchase another label; check shipment history.')
    if now_utc() - shipment.created_at > timedelta(minutes=15):
        raise ShippingError('This quote has expired. Prepare the shipment again to refresh the price.')
    selected = next((r for r in shipment.rates if r['id'] == rate_id), None)
    if not selected or type(amount_cents) is not int or selected['amount_cents'] != amount_cents:
        raise ShippingError('The selected rate or price changed. Refresh the quote.')
    cases, user = selected_cases(shipment.snapshot['cases'], lock=True)
    if snapshot_for(cases, user, shipment.snapshot['parcel']) != shipment.snapshot:
        raise ShippingError('The recipient or address changed. Prepare a new shipment.')
    if KPDShipmentCase.query.filter(KPDShipmentCase.case_id.in_(shipment.snapshot['cases'])).first():
        raise ShippingError('Another label purchase already includes one of these cases. Open shipment history.')
    shipment.selected_rate = selected
    shipment.state = 'purchasing'
    for case in cases:
        db.session.add(KPDShipmentCase(case_id=case.id, shipment_id=shipment.id))
    # Persist the reservation BEFORE contacting the provider. A timeout/crash is
    # never permission to charge again. A unique case PK also fences SQLite tests.
    db.session.commit()
    try:
        raw = provider().buy(selected['id'], shipment.id)
        if raw.get('status') == 'ERROR':
            shipment.state = 'failed'
            shipment.transaction_id = raw.get('object_id')
            KPDShipmentCase.query.filter_by(shipment_id=shipment.id).delete()
            db.session.commit()
            raise ShippingError('Shippo could not create this label. Review the address and package, then get a new quote.')
        complete(shipment, raw)
    except ShippingError:
        if shipment.state != 'failed':
            db.session.rollback()
            shipment = db.session.get(KPDShipment, shipment_id)
            shipment.state = 'uncertain'
            db.session.commit()
        raise
    except Exception:
        db.session.rollback()
        shipment = db.session.get(KPDShipment, shipment_id)
        shipment.state = 'uncertain'
        db.session.commit()
        raise ShippingError('The purchase outcome is uncertain. Check Shippo and reconcile this shipment; do not buy another label.') from None
    return serialize_shipment(shipment)


def reconcile(shipment_id, transaction_id):
    shipment = KPDShipment.query.filter_by(id=shipment_id).with_for_update().first()
    if not shipment or shipment.state not in {'purchasing', 'uncertain', 'purchased'}:
        raise ShippingError('No purchase is awaiting reconciliation.')
    if shipment.state == 'purchased':
        return serialize_shipment(shipment)
    raw = provider().retrieve(transaction_id)
    raw_rate = raw.get('rate')
    if isinstance(raw_rate, dict):
        raw_rate = raw_rate.get('object_id')
    if (raw.get('status') == 'ERROR' and raw.get('object_id') == transaction_id and
            raw.get('metadata') == 'kpd:' + shipment.id and raw_rate == shipment.selected_rate['id']):
        shipment.state = 'failed'
        shipment.transaction_id = transaction_id
        KPDShipmentCase.query.filter_by(shipment_id=shipment.id).delete()
        db.session.commit()
        return serialize_shipment(shipment)
    complete(shipment, raw)
    return serialize_shipment(shipment)


def mark_shipped(shipment_id):
    shipment = KPDShipment.query.filter_by(id=shipment_id).with_for_update().first()
    if not shipment or shipment.state not in {'purchased', 'shipped'}:
        raise ShippingError('Purchase or reconcile the label before confirming shipment.')
    if shipment.state == 'shipped':
        return serialize_shipment(shipment)
    cases = Case.query.filter(Case.id.in_(shipment.snapshot['cases'])).order_by(Case.id).with_for_update().all()
    if any(held(c.hold) or c.status not in {'Ready to Ship', 'Shipped'} for c in cases):
        raise ShippingError('A case is on hold or its status changed. Review the cases before confirming shipment.')
    day = datetime.now(FLORIDA).strftime('%m/%d/%Y %H:%M:%S')
    for case in cases:
        if case.status != 'Shipped':
            case.status = 'Shipped'
            case.add_log('Shipped: ' + day)
    shipment.state = 'shipped'
    shipment.shipped_at = now_utc()
    db.session.commit()
    return serialize_shipment(shipment)

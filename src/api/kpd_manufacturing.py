"""Manufacturing label receipts; printing itself remains a user/browser action."""
import hashlib
import json
import uuid

from flask import current_app
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from api.models import db, Case, User
from api.kpd_reporting import held
from api.kpd_shipments import adw_case_ids, now_utc


class KPDManufacturingLabel(db.Model):
    __tablename__ = 'kpd_manufacturing_label'
    case_id = db.Column(db.Integer, db.ForeignKey('case.id'), primary_key=True)
    fingerprint = db.Column(db.String(64), nullable=False)
    printed_at = db.Column(db.DateTime, nullable=False)
    printed_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    batch_id = db.Column(db.String(36), nullable=False)


def label_payload(case, user):
    parts = [s.strip() for s in (user.address or '').split(',')]
    address = dict(street=', '.join(parts[:-3]), city=parts[-3], state=parts[-2], zip=parts[-1]) if len(parts) >= 4 else dict(street=user.address or '', city='', state='', zip='')
    return dict(caseNumber=case.id, patientName=case.name or '',
                doctorFirst=(case.doctor_name or f'{user.fname} {user.lname}').strip(), doctorLast='',
                license=user.license_number or '', submittedDate=case.update_date or '', dueDate=case.due_date or '',
                type=case.type or '', product=case.product or '', crownTooth=case.teeth or '',
                shade=case.shade or '', gumShade=case.gum_shade or '', finish=case.finish or '',
                model3D=case.model3D or '', production=case.production or '', shipping=case.shipping or '',
                note=case.notes or '', price=case.price or '', **address)


def fingerprint(payload):
    return hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def signer():
    secret = current_app.config.get('JWT_SECRET_KEY') or current_app.config.get('SECRET_KEY')
    if not secret:
        raise ValueError('Label confirmation is not configured on this server.')
    return URLSafeTimedSerializer(secret, salt='kpd-manufacturing-label-v1')


def validate_ids(ids):
    if not isinstance(ids, list) or not 1 <= len(ids) <= 100 or any(type(i) is not int or i <= 0 for i in ids) or len(set(ids)) != len(ids):
        raise ValueError('Select between 1 and 100 distinct cases.')
    return ids


def eligible_cases(ids, lock=False):
    validate_ids(ids)
    query = Case.query.filter(Case.id.in_(ids)).order_by(Case.id)
    if lock:
        query = query.populate_existing().with_for_update()
    cases = query.all()
    if len(cases) != len(ids) or any(c.status != 'Manufacturing' or held(c.hold) for c in cases):
        raise ValueError('A selected case is no longer in Manufacturing or is on hold. Refresh the label list.')
    if set(ids) & adw_case_ids():
        raise ValueError('ADW cases use their separate workflow.')
    return cases


def manufacturing_queue():
    excluded = adw_case_ids()
    records = {r.case_id: r for r in KPDManufacturingLabel.query.all()}
    result = []
    for case, user in db.session.query(Case, User).join(User, Case.user_id == User.id).filter(Case.status == 'Manufacturing').order_by(Case.id):
        if held(case.hold) or case.id in excluded:
            continue
        payload = label_payload(case, user)
        receipt = records.get(case.id)
        reason = 'new' if not receipt else 'changed' if receipt.fingerprint != fingerprint(payload) else 'printed'
        result.append(dict(id=case.id, patient=case.name or '', doctor=payload['doctorFirst'], type=case.type or '',
                           product=case.product or '', due_date=case.due_date or '', reason=reason,
                           printed_at=receipt.printed_at.isoformat() + 'Z' if receipt else None))
    return dict(cases=result, pending=sum(c['reason'] != 'printed' for c in result))


def prepare_labels(ids, mode):
    if mode not in {'new', 'reprint', 'existing'}:
        raise ValueError('Choose new labels, reprints, or labels already printed.')
    cases = eligible_cases(ids)
    labels, versions = [], {}
    for case in cases:
        user = db.session.get(User, case.user_id)
        if not user:
            raise ValueError('A case has no customer account. Review the case before printing.')
        payload = label_payload(case, user)
        version = fingerprint(payload)
        previous = db.session.get(KPDManufacturingLabel, case.id)
        if mode == 'new' and previous and previous.fingerprint == version:
            raise ValueError('Another user already confirmed one of these labels. Refresh the list, or choose Reprint.')
        labels.append(payload)
        versions[str(case.id)] = version
    batch = dict(id=str(uuid.uuid4()), versions=versions)
    # Signed receipts bind confirmation to the exact reviewed case contents.
    # They contain hashes and IDs only, not patient details or credentials.
    return dict(id=batch['id'], token=signer().dumps(batch), labels=labels, mode=mode)


def confirm_labels(token, ids, staff_id):
    validate_ids(ids)
    if not isinstance(token, str) or len(token) > 20000:
        raise ValueError('Prepare the labels again before confirming.')
    try:
        batch = signer().loads(token, max_age=8 * 60 * 60)
    except (BadSignature, SignatureExpired):
        raise ValueError('This label review expired or is invalid. Refresh and review the cases again.') from None
    if any(str(i) not in batch['versions'] for i in ids):
        raise ValueError('Confirm only cases included in this print job.')
    cases = eligible_cases(ids, lock=True)
    for case in cases:
        user = db.session.get(User, case.user_id)
        if not user or fingerprint(label_payload(case, user)) != batch['versions'][str(case.id)]:
            raise ValueError(f'Case #{case.id} changed after label preparation. Review its current details before confirming.')
    confirmed = now_utc()
    for case in cases:
        receipt = db.session.get(KPDManufacturingLabel, case.id)
        if receipt and receipt.batch_id == batch['id']:
            continue
        if not receipt:
            receipt = KPDManufacturingLabel(case_id=case.id)
            db.session.add(receipt)
        receipt.fingerprint = batch['versions'][str(case.id)]
        receipt.printed_at = confirmed
        receipt.printed_by = staff_id
        receipt.batch_id = batch['id']
    db.session.commit()
    return dict(confirmed=ids)

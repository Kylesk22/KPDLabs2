"""Admin-only reports and outbound shipping endpoints."""
from functools import wraps
from datetime import datetime
from flask import jsonify, request, Response, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from api.models import db, User, Case
from api.kpd_reporting import build_report, report_csv, held, case_logs, FLORIDA
from api.kpd_shipments import (KPDShipment, KPDShipmentCase, ShippingError, adw_case_ids,
                               doctor_for, address_for, serialize_shipment, create_quote,
                               buy_label, reconcile, mark_shipped)


def admin_only(function):
    @wraps(function)
    @jwt_required()
    def wrapped(*args, **kwargs):
        user = User.query.filter_by(email=get_jwt_identity()).first()
        if not user or user.role != 'Admin':
            return jsonify(message='Administrator access required.'), 403
        try:
            result = function(user, *args, **kwargs)
            return result
        except (ShippingError, ValueError) as error:
            db.session.rollback()
            return jsonify(message=str(error)), 409
        except SQLAlchemyError:
            db.session.rollback()
            current_app.logger.exception('KPD operations database operation failed')
            return jsonify(message='The operation could not be saved. Refresh shipment history before attempting a label purchase again.'), 503
        except Exception:
            db.session.rollback()
            current_app.logger.exception('KPD operations request failed')
            return jsonify(message='The service is temporarily unavailable. Refresh shipment history before retrying a purchase.'), 502
    return wrapped


def body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ValueError('A JSON object is required.')
    return data


def register_operations(api):
    @api.route('/admin/operations/reports', methods=['GET'])
    @admin_only
    def reports(staff):
        today = datetime.now(FLORIDA).date().isoformat()
        excluded = adw_case_ids()
        # Only fields needed by reporting: no scans, addresses, passwords, or security questions.
        query = db.session.query(Case, User).outerjoin(User, Case.user_id == User.id)
        rows = []
        for case, user in query:
            if case.id in excluded:
                continue
            row = {key: getattr(case, key) for key in ('id', 'name', 'doctor_name', 'user_id', 'type', 'product', 'teeth', 'status', 'log', 'update_date', 'price', 'hold')}
            row['customer'] = f'{user.fname} {user.lname}'.strip() if user else 'Unknown customer'
            rows.append(row)
        result = build_report(rows, request.args.get('start', today), request.args.get('end', today),
                              request.args.get('view', 'received'), request.args.get('customer'),
                              request.args.get('product'), request.args.get('doctor'))
        if request.args.get('format') == 'csv':
            filename = f"kpd-{result['view']}-{result['start']}-{result['end']}.csv"
            return Response(report_csv(result), mimetype='text/csv', headers={'Content-Disposition': f'attachment; filename="{filename}"', 'Cache-Control': 'no-store'})
        response = jsonify(result)
        response.headers['Cache-Control'] = 'no-store'
        return response

    @api.route('/admin/operations/shipping', methods=['GET'])
    @admin_only
    def queue(staff):
        excluded = adw_case_ids()
        reserved = {row.case_id for row in KPDShipmentCase.query.all()}
        groups = {}
        legacy = []
        for case, user in db.session.query(Case, User).join(User, Case.user_id == User.id).filter(Case.status == 'Ready to Ship').order_by(Case.id):
            if case.id in excluded or held(case.hold) or case.id in reserved:
                continue
            if any(entry.startswith('Tracking Number:') for entry in case_logs(case.log)):
                legacy.append(dict(id=case.id, doctor=doctor_for(case, user)))
                continue
            doctor = doctor_for(case, user)
            key = (user.id, doctor)
            if key not in groups:
                try:
                    address, error = address_for(user, doctor), None
                except ShippingError as exc:
                    address, error = None, str(exc)
                groups[key] = dict(key=f'{user.id}:{doctor}', customer_id=user.id, doctor=doctor,
                                   address=address, address_error=error, cases=[])
            groups[key]['cases'].append(dict(id=case.id, patient=case.name or '', product=case.product or '', type=case.type or ''))
        history = KPDShipment.query.filter(KPDShipment.state != 'quoted').order_by(KPDShipment.created_at.desc()).limit(100).all()
        response = jsonify(groups=list(groups.values()), history=[serialize_shipment(s) for s in history], legacy=legacy,
                           default_parcel=dict(length='6', width='4', height='4', weight='1'))
        response.headers['Cache-Control'] = 'no-store'
        return response

    @api.route('/admin/operations/shipping/quotes', methods=['POST'])
    @admin_only
    def quote(staff):
        data = body()
        return jsonify(create_quote(data.get('cases'), data.get('parcel'), staff.id))

    @api.route('/admin/operations/shipping/<shipment_id>/buy', methods=['POST'])
    @admin_only
    def purchase(staff, shipment_id):
        data = body()
        return jsonify(buy_label(shipment_id, data.get('rate_id'), data.get('amount_cents')))

    @api.route('/admin/operations/shipping/<shipment_id>/reconcile', methods=['POST'])
    @admin_only
    def recover(staff, shipment_id):
        return jsonify(reconcile(shipment_id, body().get('transaction_id')))

    @api.route('/admin/operations/shipping/<shipment_id>/shipped', methods=['POST'])
    @admin_only
    def handoff(staff, shipment_id):
        return jsonify(mark_shipped(shipment_id))

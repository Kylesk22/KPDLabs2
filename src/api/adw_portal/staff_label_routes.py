"""Staff-only label actions; host supplies authentication, CSRF and enablement."""
import time
from flask import Blueprint, request, jsonify
from .label_purchase import PurchaseUncertain
from .shopify_orders import ShopifyUnavailable

def public_result(row):
    return {key: row[key] for key in ('id', 'state', 'amount_cents', 'tracking_number', 'label_url')}

def blueprint(service, authenticate, csrf, *, clock=time.time, shipment_service=None):
    routes = Blueprint('adw_staff_labels', __name__)

    @routes.post('/adw/staff/shipping/labels/<label_id>/<action>')
    def label_action(label_id, action):
        try:
            staff = authenticate()
            if not csrf():
                raise PermissionError()
            body = request.get_json(silent=True)
            if action == 'confirm-shipment':
                if shipment_service is None:
                    return (jsonify(error='Shipment confirmation is not enabled yet'), 503)
                if not isinstance(body, dict) or set(body) != {'tracking_number', 'confirmed'}:
                    raise ValueError('Tracking number and carrier handoff confirmation required')
                result = shipment_service.confirm(label_id, staff=staff, tracking_number=body['tracking_number'], confirmed=body['confirmed'], now=clock())
                return jsonify(result)
            elif action == 'purchase':
                if not isinstance(body, dict) or set(body) != {'amount_cents', 'confirmed'} or body['confirmed'] is not True:
                    raise ValueError('Explicit confirmation of the quoted amount is required')
                result = service.buy(label_id, staff=staff, amount_cents=body['amount_cents'], now=clock())
            elif action == 'reconcile':
                if not isinstance(body, dict) or set(body) != {'transaction_id'}:
                    raise ValueError('Provider transaction ID required')
                result = service.reconcile(label_id, body['transaction_id'], staff=staff)
            elif action == 'status':
                if body != {}:
                    raise ValueError('No additional fields accepted')
                result = service.ledger.get(label_id, staff=staff)
            else:
                return (jsonify(error='Unknown label action'), 404)
            return jsonify(dict(public_result(result), shipment_confirmation_enabled=shipment_service is not None))
        except PermissionError:
            return (jsonify(error='Staff access required'), 403)
        except ValueError as error:
            return (jsonify(error=str(error)), 400)
        except PurchaseUncertain:
            return (jsonify(error='Purchase outcome needs reconciliation. Do not buy another label.', label_id=label_id, state='needs_reconciliation'), 409)
        except ShopifyUnavailable:
            return (jsonify(error='Payment verification unavailable. No label purchased.'), 503)
        except Exception:
            return (jsonify(error='Unable to confirm label status. Check this request before continuing.', label_id=label_id), 503)

    @routes.after_request
    def private(response):
        response.headers['Cache-Control'] = 'private, no-store'
        response.headers['Referrer-Policy'] = 'no-referrer'
        return response
    return routes

"""KPD staff adapter. Explicit enablement; no customer or production release routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from .lab_review import LabReview
from .staff_files import StaffFiles
from .staff_review_routes import blueprint as review_blueprint
from .staff_file_routes import blueprint as file_blueprint
from .staff_shipping import preview_shipment
from .staff_order_routes import blueprint as order_blueprint
from .shipping_rates import RatesUnavailable
from .shopify_orders import ShopifyUnavailable

def register_staff_runtime(app, *, enabled, engine, lookup_user, claims, receipts, storage, order_service=None, shipping_service=None):
    if enabled is not True:
        return False
    if not callable(lookup_user):
        raise ValueError('Current KPD user lookup required')
    if app.config.get('JWT_COOKIE_CSRF_PROTECT') is not True:
        raise ValueError('KPD cookie CSRF protection required')

    def authenticate():
        verify_jwt_in_request(locations=['cookies'])
        user = lookup_user(get_jwt_identity())
        if not isinstance(user, dict) or user.get('role') != 'Admin' or (not user.get('id')):
            raise PermissionError('Staff access required')
        return {'id': user['id'], 'role': user['role']}

    def csrf():
        return request.headers.get('Origin') == 'https://kpdlabs.com'
    review = review_blueprint(LabReview(engine), authenticate, csrf)
    files = file_blueprint(StaffFiles(claims, receipts, storage, bucket='adw-case-files', shop='0z8umb-uq.myshopify.com'), authenticate)
    shipping = Blueprint('adw_staff_shipping', __name__)

    @shipping.post('/adw/staff/shipping/rates')
    def shipping_rates():
        try:
            staff = authenticate()
            if shipping_service is None:
                return (jsonify(error='ADW shipping rates are not enabled yet'), 503)
            body = request.get_json(silent=True)
            if not isinstance(body, dict) or set(body) != {'case_ids', 'parcel'}:
                raise ValueError('Send only selected case IDs and package measurements')
            return jsonify(shipping_service.quote(body['case_ids'], body['parcel'], staff=staff))
        except PermissionError:
            return (jsonify(error='Staff access required'), 403)
        except ValueError as error:
            return (jsonify(error=str(error)), 400)
        except (RatesUnavailable, ShopifyUnavailable):
            return (jsonify(error='Shipping verification or rates unavailable. No label purchased.'), 503)

    @shipping.post('/adw/staff/shipping/preview')
    def shipping_preview():
        try:
            staff = authenticate()
            body = request.get_json(silent=True)
            if not isinstance(body, dict) or set(body) != {'case_ids'}:
                raise ValueError('Send only selected case IDs')
            return jsonify(preview_shipment(engine, body['case_ids'], staff=staff))
        except PermissionError:
            return (jsonify(error='Staff access required'), 403)
        except ValueError as error:
            return (jsonify(error=str(error)), 400)

    @shipping.after_request
    def private_shipping(response):
        response.headers['Cache-Control'] = 'private, no-store'
        response.headers['Referrer-Policy'] = 'no-referrer'
        return response

    def boundary():
        if request.host != 'kpdlabs.com' or not request.is_secure:
            return (jsonify(error='KPD staff site required'), 403)
        if request.method == 'POST' and request.headers.get('Origin') != 'https://kpdlabs.com':
            return (jsonify(error='Same-origin request required'), 403)
        if request.method == 'POST' and (request.content_length is None or request.content_length > 8192):
            return (jsonify(error='Invalid request size'), 413)
    blueprints = [review, files, shipping]
    if order_service is not None:
        blueprints.append(order_blueprint(order_service, authenticate, csrf))
    for routes in blueprints:
        routes.before_request(boundary)
        app.register_blueprint(routes, url_prefix='/api')
    return True

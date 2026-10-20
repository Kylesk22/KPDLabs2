"""Explicit staff review/acceptance adapter, registered only by the host."""
import re
from flask import Blueprint, jsonify, request
from .lab_review import require_staff
from .shopify_orders import ShopifyUnavailable

def blueprint(service, authenticate_staff, verify_csrf):
    routes = Blueprint('adw_staff_orders', __name__)

    @routes.get('/adw/staff/orders/waiting')
    def waiting():
        try:
            staff = authenticate_staff()
            require_staff(staff)
            return jsonify(service.waiting(staff=staff, after=request.args.get('after')))
        except PermissionError:
            return (jsonify(error='Staff access required'), 403)
        except ValueError:
            return (jsonify(error='Invalid order cursor'), 400)

    def identity(order_id):
        staff = authenticate_staff()
        require_staff(staff)
        if verify_csrf() is not True:
            raise PermissionError('Request verification required')
        if not re.fullmatch('[1-9][0-9]{0,31}', order_id):
            raise ValueError('Valid Shopify order ID required')
        return staff

    @routes.post('/adw/staff/orders/<order_id>/review')
    def review(order_id):
        try:
            staff = identity(order_id)
            if request.get_json(silent=True) != {}:
                raise ValueError('No customer-supplied order details are accepted')
            return jsonify(service.prepare(order_id, staff=staff))
        except PermissionError:
            return (jsonify(error='Staff access or request verification required'), 403)
        except ValueError as error:
            return (jsonify(error=str(error)), 409)
        except ShopifyUnavailable:
            return (jsonify(error='Shopify verification unavailable. Try again later.'), 503)

    @routes.post('/adw/staff/orders/<order_id>/accept')
    def accept(order_id):
        try:
            staff = identity(order_id)
            body = request.get_json(silent=True)
            if not isinstance(body, dict) or set(body) != {'review_fingerprint', 'files_reviewed'}:
                raise ValueError('Reviewed order confirmation required')
            cases = service.accept(order_id, staff=staff, fingerprint=body['review_fingerprint'], files_reviewed=body['files_reviewed'])
            return jsonify(case_ids=cases)
        except PermissionError:
            return (jsonify(error='Staff access, lab approval or request verification required'), 403)
        except ValueError as error:
            return (jsonify(error=str(error)), 409)
        except ShopifyUnavailable:
            return (jsonify(error='Shopify verification unavailable. No cases created.'), 503)

    @routes.after_request
    def private(response):
        response.headers['Cache-Control'] = 'private, no-store'
        response.headers['Referrer-Policy'] = 'no-referrer'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        return response
    return routes

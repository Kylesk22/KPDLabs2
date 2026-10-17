"""Staff review HTTP adapter; host authentication/CSRF callbacks are mandatory."""
import time
from flask import Blueprint, jsonify, request
from .lab_review import require_staff

def blueprint(service, authenticate_staff, verify_csrf, *, clock=time.time):
    routes = Blueprint('adw_staff_review', __name__)

    def identity():
        staff = authenticate_staff()
        require_staff(staff)
        return staff

    @routes.get('/adw/staff/labs/pending')
    def pending():
        try:
            return jsonify(labs=service.pending(staff=identity()))
        except PermissionError:
            return (jsonify(error='Staff access required'), 403)

    @routes.post('/adw/staff/labs/<lab_id>/review')
    def decide(lab_id):
        try:
            staff = identity()
            if verify_csrf() is not True:
                raise PermissionError('Request verification required')
            body = request.get_json(silent=True)
            if not isinstance(body, dict):
                return (jsonify(error='Review details required'), 400)
            result = service.decide(lab_id, staff=staff, decision=body.get('decision'), expected=body.get('expected'), reason=body.get('reason'), now=clock())
            return jsonify(result)
        except PermissionError:
            return (jsonify(error='Staff access or request verification required'), 403)
        except ValueError as exc:
            return (jsonify(error=str(exc)), 400)

    @routes.after_request
    def private(response):
        response.headers['Cache-Control'] = 'private, no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        return response
    return routes

"""Unregistered staff routes; host supplies its authenticated user lookup."""
from flask import Blueprint, jsonify, send_file

def blueprint(service, authenticate_staff):
    routes = Blueprint('adw_staff_files', __name__)

    @routes.get('/adw/staff/orders/<order_id>/lines/<line_id>/files/<int:index>')
    def download(order_id, line_id, index):
        try:
            staff = authenticate_staff()
        except PermissionError:
            return (jsonify(error='Staff access required'), 403)
        try:
            (stream, filename) = service.open(staff, order_id, line_id, index)
        except PermissionError:
            return (jsonify(error='Staff access required'), 403)
        except (ValueError, LookupError):
            return (jsonify(error='File unavailable'), 404)
        except Exception:
            return (jsonify(error='File temporarily unavailable'), 503)
        try:
            response = send_file(stream, mimetype='application/octet-stream', as_attachment=True, download_name=filename, conditional=False, etag=False, max_age=0)
            response.headers['Cache-Control'] = 'private, no-store, max-age=0'
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['Referrer-Policy'] = 'no-referrer'
            response.call_on_close(stream.close)
            return response
        except Exception:
            stream.close()
            raise
    return routes

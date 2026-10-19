"""Separate Flask application: no KPD routes, JWT handlers, or permissive CORS.

Assembly is explicit. The host supplies already-reviewed services and a shared
limiter. This module does not enable a feature or create schema on import.
"""
from flask import Flask, jsonify
from .guest_portal_routes import blueprint
from .intake import MAX_CASE_BYTES

def create_portal(verification, sessions, *, secret, allow_request, checkout=None, enabled=False, clock=None, request_limit_bytes=20 * 1024 * 1024, direct_upload=None):
    app = Flask('adw_portal', static_folder=None)
    app.config.update(MAX_CONTENT_LENGTH=request_limit_bytes, MAX_FORM_MEMORY_SIZE=64 * 1024, MAX_FORM_PARTS=20)
    options = {} if clock is None else {'clock': clock}
    app.register_blueprint(blueprint(verification, sessions, secret=secret, allow_request=allow_request, checkout=checkout, enabled=enabled, request_limit_bytes=request_limit_bytes, direct_upload=direct_upload, **options))

    @app.errorhandler(413)
    def too_large(error):
        return (jsonify(message='Upload exceeds the case size limit.'), 413)

    @app.errorhandler(500)
    def unavailable(error):
        return (jsonify(message='Unable to complete this request. Please try again.'), 503)

    @app.after_request
    def security(response):
        response.headers['Cache-Control'] = 'private, no-store'
        response.headers['Referrer-Policy'] = 'no-referrer'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers.pop('Access-Control-Allow-Origin', None)
        response.headers.pop('Access-Control-Allow-Credentials', None)
        return response
    return app

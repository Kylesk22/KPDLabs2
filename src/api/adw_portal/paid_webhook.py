"""Signed Shopify notification receiver; only queues identifiers for review."""
from flask import Blueprint, jsonify, request
from sqlalchemy import inspect
from .shared_queues import SharedInbox, notifications, jobs
PATH = '/adw/webhooks/orders-paid'

def register_paid_webhook(app, engine, *, secret, shop, enabled=False, inbox=None):
    if enabled is not True:
        return False
    if not isinstance(secret, str) or len(secret.encode()) < 16:
        raise ValueError('Shopify app secret required')
    inspector = inspect(engine)
    for table in (notifications, jobs):
        if not inspector.has_table(table.name) or not set(table.columns.keys()).issubset({entry['name'] for entry in inspector.get_columns(table.name)}):
            raise ValueError('Paid-order queue migration required')
    receiver = inbox if inbox is not None else SharedInbox(engine)
    bp = Blueprint('adw_paid_webhook', __name__)

    @bp.post(PATH)
    def receive():
        if request.host != 'kpdlabs.com' or not request.is_secure:
            return (jsonify(error='HTTPS endpoint required'), 403)
        if request.content_length is not None and request.content_length > 2000000:
            return (jsonify(error='Notification too large'), 413)
        raw = request.stream.read(2000001)
        if len(raw) > 2000000:
            return (jsonify(error='Notification too large'), 413)
        try:
            receiver.receive(raw, dict(request.headers), secret=secret.encode(), shop=shop, allow_test=False)
        except ValueError:
            return (jsonify(error='Notification rejected'), 401)
        except Exception:
            return (jsonify(error='Notification temporarily unavailable'), 503)
        return (jsonify(received=True), 200)

    @bp.after_request
    def private_response(response):
        response.headers['Cache-Control'] = 'no-store'
        return response
    app.register_blueprint(bp)
    return True

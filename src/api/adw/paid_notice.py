"""Verify Shopify notices for later reconciliation; never release production.

This independent component needs durable inbox storage, Shopify API reconciliation,
approved lab mapping and intake verification before it can create a KPD case.
"""
import base64
import hashlib
import hmac
import json


def verified_paid_notice(raw, headers, *, secret, shop, allow_test=False):
    if not isinstance(secret, bytes) or len(secret) < 16:
        raise ValueError('Webhook secret is not configured')
    if not isinstance(raw, bytes) or not 0 < len(raw) <= 2_000_000:
        raise ValueError('Invalid webhook body size')
    headers = {key.lower(): value for key, value in headers.items()}
    supplied = headers.get('x-shopify-hmac-sha256', '')
    expected = base64.b64encode(hmac.new(secret, raw, hashlib.sha256).digest()).decode('ascii')
    if not isinstance(supplied, str) or not supplied.isascii() or not hmac.compare_digest(expected, supplied):
        raise ValueError('Invalid webhook signature')
    if headers.get('x-shopify-shop-domain') != shop:
        raise ValueError('Unexpected store')
    if headers.get('x-shopify-topic') != 'orders/paid':
        raise ValueError('Unexpected webhook topic')
    delivery = headers.get('x-shopify-webhook-id')
    if not isinstance(delivery, str) or not 1 <= len(delivery) <= 128:
        raise ValueError('Missing delivery identity')
    try:
        payload = json.loads(raw)
    except (ValueError, UnicodeError):
        raise ValueError('Invalid webhook JSON') from None
    if not isinstance(payload, dict):
        raise ValueError('Invalid order payload')
    ident = payload.get('id')
    if type(ident) is not int or ident <= 0:
        raise ValueError('Invalid order identity')
    if payload.get('financial_status') != 'paid' or payload.get('cancelled_at'):
        raise ValueError('Order is not eligible for payment reconciliation')
    if payload.get('test') is not False and not (allow_test and payload.get('test') is True):
        raise ValueError('Test mode missing or disallowed')
    if payload.get('currency') != 'USD':
        raise ValueError('Unexpected order currency')
    # Only identifiers cross this boundary. Do not persist raw customer/clinical
    # fields, arbitrary cart properties, or trust their claimed lab/intake owner.
    return {'shop': shop, 'order_id': str(ident), 'delivery_id': delivery,
            'body_sha256': hashlib.sha256(raw).hexdigest(),
            'status': 'awaiting_reconciliation', 'production_release': False}

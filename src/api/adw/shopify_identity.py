"""Shopify-signed storefront identity only; not upload or payment authorization.

No routes are registered. Proxy signatures cover query parameters, not the body.
Mutating routes still need CSRF/replay protection and approved-lab membership.
https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies
"""
import hashlib
import hmac
import re
from urllib.parse import parse_qs


def verified_customer(query, *, secret, shop, path_prefix, now):
    if not isinstance(secret, bytes) or not secret:
        raise ValueError('Server app secret required')
    if not isinstance(query, str) or len(query) > 8192:
        raise PermissionError('Invalid proxy query')
    try:
        params = parse_qs(query, keep_blank_values=True, strict_parsing=True,
                          encoding='utf-8', errors='strict', max_num_fields=64)
    except (ValueError, UnicodeError):
        raise PermissionError('Invalid proxy query') from None
    required = ('signature', 'shop', 'logged_in_customer_id', 'path_prefix', 'timestamp')
    if any(len(params.get(key, [])) != 1 for key in required):
        raise PermissionError('Missing or duplicate identity fields')
    signature = params.pop('signature')[0]
    if not re.fullmatch(r'[0-9a-f]{64}', signature):
        raise PermissionError('Invalid proxy signature')
    message = ''.join(sorted(key+'='+','.join(values) for key, values in params.items()))
    expected = hmac.new(secret, message.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        raise PermissionError('Invalid proxy signature')
    customer = params['logged_in_customer_id'][0]
    timestamp = params['timestamp'][0]
    if (params['shop'][0] != shop or params['path_prefix'][0] != path_prefix
            or not re.fullmatch(r'[1-9][0-9]{0,19}', customer)
            or not re.fullmatch(r'[0-9]{1,12}', timestamp)):
        raise PermissionError('Signed-in ADW customer required')
    # Freshness is an added local policy, not a substitute for nonce/replay checks.
    if not -30 <= now-int(timestamp) <= 300:
        raise PermissionError('Expired proxy request')
    return {'shop': shop, 'customer_id': customer}

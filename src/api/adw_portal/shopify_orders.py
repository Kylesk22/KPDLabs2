"""Read-only Shopify Admin client. Credentials/tokens never leave server memory."""
import json
import re
import threading
import time
import urllib.parse
import urllib.request
import urllib.error
ORDER_QUERY = 'query ADWOrder($id: ID!) {\n order(id: $id) {\n  id customer { id } cancelledAt closed test currencyCode\n  displayFinancialStatus fullyPaid refunds { id }\n  shippingAddress { name company address1 address2 city provinceCode zip countryCodeV2 phone }\n  lineItems(first: 50) {\n   pageInfo { hasNextPage }\n   nodes { id sku quantity currentQuantity variant { id }\n    originalUnitPriceSet { shopMoney { amount currencyCode } }\n    customAttributes { key value }\n   }\n  }\n }\n}'

class ShopifyUnavailable(RuntimeError):
    pass

class AuthorizationExpired(ShopifyUnavailable):
    pass

class ShopifyOrders:

    def __init__(self, client_id, secret, *, opener=urllib.request.urlopen, clock=time.monotonic):
        if not client_id or not secret:
            raise ValueError('App credentials required')
        (self.client_id, self.secret) = (client_id, secret)
        self.origin = 'https://0z8umb-uq.myshopify.com'
        (self.opener, self.clock) = (opener, clock)
        self._token = None
        self._expires = 0
        self._lock = threading.Lock()

    def _json(self, request):
        try:
            with self.opener(request, timeout=15) as response:
                payload = response.read(2000001)
            if len(payload) > 2000000:
                raise ValueError('Response too large')
            result = json.loads(payload)
            if not isinstance(result, dict):
                raise ValueError('Unexpected response')
            return result
        except urllib.error.HTTPError as error:
            if error.code == 401:
                raise AuthorizationExpired('Shopify authorization expired') from None
            raise ShopifyUnavailable('Shopify verification unavailable; retry later') from None
        except Exception:
            raise ShopifyUnavailable('Shopify verification unavailable; retry later') from None

    def _access_token(self):
        with self._lock:
            if self._token and self.clock() < self._expires:
                return self._token
            body = urllib.parse.urlencode(dict(grant_type='client_credentials', client_id=self.client_id, client_secret=self.secret)).encode()
            value = self._json(urllib.request.Request(self.origin + '/admin/oauth/access_token', data=body))
            token = value.get('access_token')
            expiry = value.get('expires_in')
            if not isinstance(token, str) or not token or type(expiry) is not int or (expiry <= 60):
                raise ShopifyUnavailable('Shopify authorization unavailable')
            self._token = token
            self._expires = self.clock() + expiry - 60
            return token

    def fetch_order(self, order_id):
        if not isinstance(order_id, str) or not re.fullmatch('[1-9][0-9]{0,31}', order_id):
            raise ValueError('Order ID required')
        data = json.dumps({'query': ORDER_QUERY, 'variables': {'id': 'gid://shopify/Order/' + order_id}}).encode()
        for attempt in range(2):
            token = self._access_token()
            try:
                response = self._json(urllib.request.Request(self.origin + '/admin/api/2026-10/graphql.json', data=data, headers={'Content-Type': 'application/json', 'X-Shopify-Access-Token': token}))
                break
            except AuthorizationExpired:
                with self._lock:
                    if self._token == token:
                        self._token = None
                        self._expires = 0
                if attempt:
                    raise ShopifyUnavailable('Shopify authorization unavailable') from None
        if response.get('errors'):
            raise ShopifyUnavailable('Shopify order verification unavailable')
        order = (response.get('data') or {}).get('order')
        if not isinstance(order, dict) or order.get('id') != 'gid://shopify/Order/' + order_id:
            raise ShopifyUnavailable('Requested order unavailable')
        return order

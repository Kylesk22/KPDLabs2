"""Bounded Shopify transport: only the two reviewed fulfillment operations."""
import json
from urllib.request import Request
from .shopify_fulfillment import READ, CREATE
from .shopify_orders import ShopifyUnavailable

class FulfillmentTransport:

    def __init__(self, orders_client, *, writes_enabled=False):
        self.client = orders_client
        self.writes_enabled = writes_enabled is True
        if self.client.origin != 'https://0z8umb-uq.myshopify.com':
            raise ValueError('ADW store required')

    def __call__(self, query, variables):
        if query not in (READ, CREATE):
            raise ValueError('Unsupported fulfillment operation')
        if query == CREATE and (not self.writes_enabled):
            raise ValueError('Tracking writes disabled')
        body = json.dumps({'query': query, 'variables': variables}).encode()
        if len(body) > 65536:
            raise ValueError('Oversized fulfillment request')
        token = self.client._access_token()
        result = self.client._json(Request(self.client.origin + '/admin/api/2026-10/graphql.json', data=body, headers={'Content-Type': 'application/json', 'X-Shopify-Access-Token': token}))
        if not isinstance(result, dict) or result.get('errors'):
            raise ShopifyUnavailable('Shopify fulfillment operation requires review')
        return result

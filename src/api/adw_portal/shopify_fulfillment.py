"""Explicit fulfillment adapter. Transport supplied by host; writes off by default."""
from .fulfillment_plan import gid, fulfillment_targets
FIELDS = 'id status order { id } trackingInfo { number }\n fulfillmentLineItems(first:100) {\n  pageInfo { hasNextPage } nodes { quantity lineItem { id } }\n }'
READ = 'query ADWShipping($id:ID!) { order(id:$id) {\n id fulfillmentOrders(first:100) { pageInfo { hasNextPage } nodes {\n id status lineItems(first:100) { pageInfo { hasNextPage }\n nodes { id remainingQuantity lineItem { id } } } } }\n fulfillments(first:100) { ' + FIELDS + ' } } }'
CREATE = 'mutation ADWShip($fulfillment:FulfillmentInput!) {\n fulfillmentCreate(fulfillment:$fulfillment) {\n userErrors { field message } fulfillment { ' + FIELDS + ' } } }'

def receipt(value, target):
    if not isinstance(value, dict) or value.get('status') != 'SUCCESS':
        raise ValueError('Fulfillment not confirmed')
    if (value.get('order') or {}).get('id') != 'gid://shopify/Order/' + target['order_id']:
        raise ValueError('Fulfillment order mismatch')
    tracking = value.get('trackingInfo')
    if tracking != [{'number': target['fulfillment']['trackingInfo']['number']}]:
        raise ValueError('Fulfillment tracking mismatch')
    connection = value.get('fulfillmentLineItems') or {}
    if connection.get('pageInfo', {}).get('hasNextPage') is not False:
        raise ValueError('Incomplete fulfillment result')
    actual = {}
    for row in connection.get('nodes', []):
        item = gid((row.get('lineItem') or {}).get('id'), 'LineItem')
        if item in actual or type(row.get('quantity')) is not int:
            raise ValueError('Ambiguous fulfillment items')
        actual[item] = row['quantity']
    if actual != target['expected_lines']:
        raise ValueError('Fulfillment items mismatch')
    return gid(value.get('id'), 'Fulfillment')

class ShopifyFulfillment:

    def __init__(self, rpc, *, shop, enabled=False, notifications_enabled=False):
        (self.rpc, self.shop, self.enabled) = (rpc, shop, enabled)
        self.notifications_enabled = notifications_enabled is True

    def read(self, order_id):
        identity = gid('gid://shopify/Order/' + order_id, 'Order')
        result = self.rpc(READ, {'id': identity})
        if result.get('errors'):
            raise ValueError('Shopify fulfillment lookup unavailable')
        order = (result.get('data') or {}).get('order')
        if not isinstance(order, dict) or order.get('id') != identity:
            raise ValueError('Requested fulfillment order unavailable')
        return order

    def create(self, target):
        if self.enabled is not True:
            raise ValueError('Tracking writes are disabled')
        notify = target['fulfillment'].get('notifyCustomer')
        if target['shop'] != self.shop or type(notify) is not bool or (notify and (not self.notifications_enabled)):
            raise ValueError('Unexpected store or notification setting')
        expected = dict(shop=target['shop'], order_id=target['order_id'], label_id=target['label_id'], tracking_number=target['fulfillment']['trackingInfo']['number'], lines=target['expected_lines'], notify_customer=notify)
        current = fulfillment_targets(expected, self.read(target['order_id']))
        if target not in current:
            raise ValueError('Fulfillment selection changed')
        result = self.rpc(CREATE, {'fulfillment': target['fulfillment']})
        payload = (result.get('data') or {}).get('fulfillmentCreate') or {}
        if result.get('errors') or payload.get('userErrors'):
            raise ValueError('Shopify fulfillment requires reconciliation')
        return receipt(payload.get('fulfillment'), target)

    def find_existing(self, target):
        if target['shop'] != self.shop:
            raise ValueError('Unexpected store')
        entries = self.read(target['order_id']).get('fulfillments')
        if not isinstance(entries, list) or len(entries) >= 100:
            raise ValueError('Complete fulfillment history required')
        matches = []
        for entry in entries:
            try:
                matches.append(receipt(entry, target))
            except ValueError:
                continue
        if len(matches) > 1:
            raise ValueError('Multiple matching fulfillments require staff review')
        return matches[0] if matches else None

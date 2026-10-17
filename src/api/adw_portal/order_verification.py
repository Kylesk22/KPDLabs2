"""Validate a freshly fetched Admin API order. Never accept browser order JSON.

Returns a review plan, not production authorization. Persistence must atomically
claim every receipt and order line before creating a KPD case.
"""
from decimal import Decimal, InvalidOperation
import re
PRICES = {'ADW-ZR-M': 2400, 'ADW-ZR-D': 3400, 'ADW-ZR-MF': 3600, 'ADW-ZR-DF': 4600, 'ADW-CAD-CB': 1000}

def money(value):
    if not isinstance(value, dict) or value.get('currencyCode') != 'USD':
        raise ValueError('USD amount required')
    try:
        amount = Decimal(value['amount']) * 100
        if not amount.is_finite() or amount < 0 or amount != amount.to_integral_value():
            raise ValueError('Invalid currency precision')
        return int(amount)
    except (KeyError, TypeError, InvalidOperation):
        raise ValueError('Invalid currency amount') from None

def identifier(value, kind):
    if not isinstance(value, str) or not re.fullmatch('gid://shopify/' + kind + '/[1-9][0-9]*', value):
        raise ValueError('Invalid Shopify identity')
    return value.rsplit('/', 1)[1]

def verify_order(order, *, shop, memberships, receipts, catalog, allow_test=False, guest_checkout=None, now=None):
    """catalog: staff-verified variant GID -> exact SKU; no SKU-only trust."""
    order_id = identifier(order.get('id'), 'Order')
    if order.get('cancelledAt') is not None or order.get('closed') is True or order.get('displayFinancialStatus') != 'PAID' or (order.get('fullyPaid') is not True) or (order.get('currencyCode') != 'USD') or (order.get('refunds') != []) or (order.get('test') is not False and (not (allow_test and order.get('test') is True))):
        raise ValueError('Order requires manual payment review')
    customer_gid = (order.get('customer') or {}).get('id')
    customer = identifier(customer_gid, 'Customer') if customer_gid else None
    if guest_checkout is None:
        if customer is None:
            raise ValueError('Customer identity required')
        principal = memberships.principal(shop, customer)
    else:
        if now is None:
            raise ValueError('Checkout verification time required')
        principal = None
    connection = order.get('lineItems') or {}
    if connection.get('pageInfo', {}).get('hasNextPage') is not False:
        raise ValueError('Complete order lines required')
    lines = connection.get('nodes')
    if not isinstance(lines, list) or not 1 <= len(lines) <= 50:
        raise ValueError('Invalid order lines')
    (seen_lines, seen_receipts, prepared) = (set(), set(), [])
    for line in lines:
        line_id = identifier(line.get('id'), 'LineItem')
        variant = (line.get('variant') or {}).get('id')
        sku = catalog.get(variant)
        if sku not in PRICES or line.get('sku') != sku:
            raise ValueError('Unverified product variant')
        qty = line.get('quantity')
        if type(qty) is not int or not 1 <= qty <= 3 or line.get('currentQuantity') != qty:
            raise ValueError('Changed or unsupported quantity')
        if money((line.get('originalUnitPriceSet') or {}).get('shopMoney')) != PRICES[sku]:
            raise ValueError('Unexpected unit price')
        attributes = line.get('customAttributes')
        if not isinstance(attributes, list):
            raise ValueError('Missing case details')
        props = {}
        for attribute in attributes:
            (key, value) = (attribute.get('key'), attribute.get('value'))
            if not isinstance(key, str) or not isinstance(value, str) or key in props:
                raise ValueError('Ambiguous case details')
            props[key] = value
        (reference, receipt) = (props.get('Case reference', ''), props.get('Intake receipt', ''))
        if not re.fullmatch('[A-Za-z0-9_-]{3,40}', reference) or not re.fullmatch('ADW-[0-9a-f]{32}', receipt):
            raise ValueError('Missing valid case reference or receipt')
        if guest_checkout is not None:
            resolved = guest_checkout.resolve(shop=shop, receipt=receipt, reference=reference, token=props.get('_ADW checkout proof'), now=now, order_id=order_id, line_id=line_id)
            if principal is not None and principal['lab_id'] != resolved['lab_id']:
                raise ValueError('Different labs cannot share one order')
            principal = resolved
        tokens = props.get('Tooth numbers', '').split(',')
        if len(tokens) != qty or any((not re.fullmatch('\\s*[0-9]{1,2}\\s*', t) for t in tokens)):
            raise ValueError('Tooth count must match quantity')
        teeth = [int(t) for t in tokens]
        if len(set(teeth)) != qty or any((not 1 <= t <= 32 for t in teeth)):
            raise ValueError('Invalid tooth numbers')
        shade = props.get('Shade requested', '').strip()
        if sku != 'ADW-CAD-CB' and (not re.fullmatch('[A-Za-z0-9 ._-]{1,20}', shade)):
            raise ValueError('Shade required')
        if props.get('Scope acknowledged') != 'Yes':
            raise ValueError('Scope acknowledgement missing')
        row = receipts.get(receipt)
        if not row or row.get('lab_id') != principal['lab_id'] or row.get('reference') != reference or (not row.get('files')) or (row.get('status') != 'awaiting_file_review'):
            raise ValueError('Receipt ownership or review state invalid')
        if receipt in seen_receipts or line_id in seen_lines:
            raise ValueError('Duplicate case in order')
        seen_receipts.add(receipt)
        seen_lines.add(line_id)
        prepared.append(dict(line_id=line_id, receipt=receipt, reference=reference, sku=sku, quantity=qty, teeth=teeth, shade=shade, unit_price_cents=PRICES[sku]))
    return dict(shop=shop, order_id=order_id, customer=customer, lab_id=principal['lab_id'], lines=prepared, status='awaiting_manufacturing_review', production_release=False)

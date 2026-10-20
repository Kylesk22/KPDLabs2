"""Build explicit Shopify fulfillment line selections; never fulfill all by default."""
import re
from sqlalchemy import select
from .label_ledger import labels, tracking_jobs
from .kpd_case_links import links

def gid(value, kind):
    if not isinstance(value, str) or not re.fullmatch('gid://shopify/' + kind + '/[1-9][0-9]*', value):
        raise ValueError('Invalid Shopify identifier')
    return value

def selected_orders(db, label_id):
    label = db.execute(select(labels).where(labels.c.id == label_id)).mappings().one()
    job = db.execute(select(tracking_jobs).where(tracking_jobs.c.label_id == label_id)).mappings().one()
    if label['state'] != 'purchased' or job['state'] != 'ready' or (not job['payload'].get('confirmed_by')):
        raise ValueError('Confirmed carrier handoff required')
    snapshot = label['snapshot']
    rows = db.execute(select(links).where(links.c.case_id.in_(snapshot['case_ids']))).mappings().all()
    if len(rows) != len(snapshot['case_ids']):
        raise ValueError('Case linkage changed')
    saved = {(entry['shop'], entry['order_id']): entry['plan'] for entry in snapshot['orders']}
    result = {}
    for row in rows:
        key = (row['shop'], row['order_id'])
        plan = saved.get(key)
        if not plan or plan['lab_id'] != row['lab_id']:
            raise ValueError('Order ownership changed')
        matches = [line for line in plan['lines'] if line['line_id'] == row['line_id'] and line['receipt'] == row['receipt']]
        if len(matches) != 1:
            raise ValueError('Case does not match the purchased label')
        line = matches[0]
        item = gid('gid://shopify/LineItem/' + line['line_id'], 'LineItem')
        selected = result.setdefault(key, {})
        if item in selected:
            raise ValueError('Duplicate case line')
        selected[item] = line['quantity']
    return [dict(shop=shop, order_id=order_id, lines=lines, tracking_number=label['tracking_number'], label_id=label_id, notify_customer=job['payload'].get('notify_customer') is True) for ((shop, order_id), lines) in sorted(result.items())]

def fulfillment_targets(expected, order):
    """Reject split, held, incomplete or already-partially-fulfilled selected lines."""
    order_gid = gid('gid://shopify/Order/' + expected['order_id'], 'Order')
    if order.get('id') != order_gid:
        raise ValueError('Unexpected Shopify order')
    wanted = expected['lines']
    if not wanted or any((type(qty) is not int or qty <= 0 for qty in wanted.values())):
        raise ValueError('Explicit item quantities required')
    connection = order.get('fulfillmentOrders') or {}
    if connection.get('pageInfo', {}).get('hasNextPage') is not False:
        raise ValueError('Complete fulfillment orders required')
    found = set()
    targets = []
    for fulfillment in connection.get('nodes', []):
        line_connection = fulfillment.get('lineItems') or {}
        if line_connection.get('pageInfo', {}).get('hasNextPage') is not False:
            raise ValueError('Complete fulfillment lines required')
        chosen = []
        for line in line_connection.get('nodes', []):
            item = (line.get('lineItem') or {}).get('id')
            if item not in wanted:
                continue
            if item in found:
                raise ValueError('Split or duplicate fulfillment requires staff review')
            found.add(item)
            if fulfillment.get('status') != 'OPEN' or line.get('remainingQuantity') != wanted[item]:
                raise ValueError('Fulfillment changed or is not ready')
            chosen.append(dict(id=gid(line.get('id'), 'FulfillmentOrderLineItem'), quantity=wanted[item]))
        if not chosen:
            continue
        fulfillment_id = gid(fulfillment.get('id'), 'FulfillmentOrder')
        targets.append(dict(key=fulfillment_id, shop=expected['shop'], order_id=expected['order_id'], label_id=expected['label_id'], expected_lines={line['lineItem']['id']: wanted[line['lineItem']['id']] for line in line_connection['nodes'] if line['lineItem']['id'] in wanted}, fulfillment=dict(notifyCustomer=False, trackingInfo={'number': expected['tracking_number']}, lineItemsByFulfillmentOrder=[dict(fulfillmentOrderId=fulfillment_id, fulfillmentOrderLineItems=sorted(chosen, key=lambda row: row['id']))])))
    if found != set(wanted):
        raise ValueError('Selected case items are missing from fulfillment')
    targets = sorted(targets, key=lambda target: target['key'])
    if expected.get('notify_customer') is True:
        targets[-1]['fulfillment']['notifyCustomer'] = True
    return targets

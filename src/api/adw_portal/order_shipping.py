"""Immutable order destinations; separate from a lab's editable default address."""
from sqlalchemy import Table, Column, String, JSON, select
from .order_claims import metadata
destinations = Table('adw_order_destination', metadata, Column('shop', String(255), primary_key=True), Column('order_id', String(32), primary_key=True), Column('address', JSON, nullable=False))

def normalize_address(address):
    if not isinstance(address, dict):
        raise ValueError('Shipping address required')
    result = {}
    for field in ['name', 'company', 'address1', 'address2', 'city', 'provinceCode', 'zip', 'countryCodeV2', 'phone']:
        value = address.get(field) or ''
        if not isinstance(value, str) or len(value) > 255 or any((ord(c) < 32 for c in value)):
            raise ValueError('Invalid shipping address')
        result[field] = value.strip()
    if any((not result[field] for field in ['name', 'address1', 'city', 'provinceCode', 'zip'])):
        raise ValueError('Incomplete shipping address')
    if result['countryCodeV2'] != 'US':
        raise ValueError('US shipping only at launch')
    return result

def save_destination(connection, shop, order_id, address):
    address = normalize_address(address)
    existing = connection.execute(select(destinations.c.address).where(destinations.c.shop == shop, destinations.c.order_id == order_id)).scalar_one_or_none()
    if existing is not None:
        if existing != address:
            raise ValueError('Changed destination requires staff review')
        return
    connection.execute(destinations.insert().values(shop=shop, order_id=order_id, address=address))

def shipment_destination(records):
    """Require same lab AND destination before buying a combined-case label."""
    if not records:
        raise ValueError('Select cases for shipment')
    lab = records[0]['lab_id']
    address = normalize_address(records[0]['address'])
    for record in records:
        if record['lab_id'] != lab or normalize_address(record['address']) != address:
            raise ValueError('Selected cases require separate shipments')
    return address

def destination_for_cases(connection, case_ids):
    """Resolve labels from stored case links, never browser-supplied addresses."""
    from .kpd_case_links import links
    if not isinstance(case_ids, list) or not case_ids or any((type(case_id) is not int or case_id <= 0 for case_id in case_ids)) or (len(case_ids) != len(set(case_ids))):
        raise ValueError('Select valid cases')
    rows = connection.execute(select(links.c.case_id, links.c.lab_id, destinations.c.address).select_from(links.join(destinations, (links.c.shop == destinations.c.shop) & (links.c.order_id == destinations.c.order_id))).where(links.c.case_id.in_(case_ids))).mappings().all()
    if len(rows) != len(case_ids):
        raise ValueError('Every case must have a verified ADW destination')
    return shipment_destination(rows)

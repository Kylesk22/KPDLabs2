"""Durable case provenance and atomic host-case creation, staging only.

Host writer must use the supplied transaction; never commit independently.
The caller must freshly reconcile payment and obtain staff review first.
"""
import hashlib
import json
from sqlalchemy import Column, Integer, String, UniqueConstraint, select
from sqlalchemy import Table
from .order_claims import metadata, orders, claims
from .lab_accounts import resolve_account
links = Table('adw_kpd_case_link', metadata, Column('case_id', Integer, primary_key=True), Column('shop', String(255), nullable=False), Column('order_id', String(32), nullable=False), Column('line_id', String(32), nullable=False), Column('lab_id', String(80), nullable=False), Column('receipt', String(36), nullable=False, unique=True), Column('reviewed_by', String(120), nullable=False), UniqueConstraint('shop', 'order_id', 'line_id', name='uq_adw_kpd_order_line'))

def create_reviewed_cases(connection, plan, *, staff, writer):
    if not staff or staff.get('role') != 'Admin' or (not staff.get('id')):
        raise PermissionError('Administrator review required')
    fingerprint = hashlib.sha256(json.dumps(plan, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    row = connection.execute(select(orders).where(orders.c.shop == plan['shop'], orders.c.order_id == plan['order_id']).with_for_update()).mappings().one_or_none()
    if not row or row['fingerprint'] != fingerprint:
        raise ValueError('Fresh verified order does not match reserved review')
    internal_account_id = resolve_account(connection, plan['lab_id'])
    result = []
    for line in plan['lines']:
        reserved = connection.execute(select(claims.c.receipt).where(claims.c.shop == plan['shop'], claims.c.order_id == plan['order_id'], claims.c.line_id == line['line_id'])).scalar_one_or_none()
        if reserved != line['receipt']:
            raise ValueError('Receipt reservation mismatch')
        existing = connection.execute(select(links.c.case_id).where(links.c.shop == plan['shop'], links.c.order_id == plan['order_id'], links.c.line_id == line['line_id'])).scalar_one_or_none()
        if existing is not None:
            result.append(existing)
            continue
        case_id = writer(connection, internal_account_id, line)
        if type(case_id) is not int or case_id <= 0:
            raise ValueError('Host writer did not return a case')
        connection.execute(links.insert().values(case_id=case_id, shop=plan['shop'], order_id=plan['order_id'], line_id=line['line_id'], lab_id=plan['lab_id'], receipt=line['receipt'], reviewed_by=str(staff['id'])))
        result.append(case_id)
    return result

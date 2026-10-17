"""Atomic order/receipt reservations for review; no KPD writes or release worker."""
import hashlib
import json
from sqlalchemy import MetaData, Table, Column, String, JSON, UniqueConstraint, select
from sqlalchemy.exc import IntegrityError
metadata = MetaData()
orders = Table('adw_verified_order', metadata, Column('shop', String(255), primary_key=True), Column('order_id', String(32), primary_key=True), Column('fingerprint', String(64), nullable=False), Column('plan', JSON, nullable=False))
claims = Table('adw_order_receipt_claim', metadata, Column('receipt', String(36), primary_key=True), Column('shop', String(255), nullable=False), Column('order_id', String(32), nullable=False), Column('line_id', String(32), nullable=False), UniqueConstraint('shop', 'order_id', 'line_id', name='uq_adw_order_line'))

class OrderClaims:

    def __init__(self, engine, *, allow_sqlite_for_tests=False):
        if engine.dialect.name != 'postgresql' and (not (allow_sqlite_for_tests and engine.dialect.name == 'sqlite')):
            raise ValueError('Shared PostgreSQL required')
        self.engine = engine

    def get_review(self, shop, order_id):
        with self.engine.connect() as db:
            return db.execute(select(orders.c.plan).where(orders.c.shop == shop, orders.c.order_id == order_id)).scalar_one_or_none()

    def reserve_for_review(self, plan):
        if plan.get('production_release') is not False or plan.get('status') != 'awaiting_manufacturing_review':
            raise ValueError('Verified review plan required')
        fingerprint = hashlib.sha256(json.dumps(plan, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        try:
            with self.engine.begin() as db:
                db.execute(orders.insert().values(shop=plan['shop'], order_id=plan['order_id'], fingerprint=fingerprint, plan=plan))
                for line in plan['lines']:
                    db.execute(claims.insert().values(receipt=line['receipt'], shop=plan['shop'], order_id=plan['order_id'], line_id=line['line_id']))
            return {'duplicate': False, 'order_id': plan['order_id']}
        except IntegrityError:
            with self.engine.connect() as db:
                existing = db.execute(select(orders.c.fingerprint).where(orders.c.shop == plan['shop'], orders.c.order_id == plan['order_id'])).scalar_one_or_none()
            if existing == fingerprint:
                return {'duplicate': True, 'order_id': plan['order_id']}
            raise ValueError('Receipt already used or order changed; staff review required') from None

"""Shared verified notification and cleanup queues; no production release worker."""
from sqlalchemy import Table, Column, String, Integer, DateTime, func, select
from .shared_receipts import metadata, SharedReceiptRepository
from .paid_notice import verified_paid_notice
from .private_storage import KEY
notifications = Table('adw_paid_notification', metadata, Column('shop', String(255), primary_key=True), Column('delivery', String(128), primary_key=True), Column('digest', String(64), nullable=False))
jobs = Table('adw_reconciliation_job', metadata, Column('shop', String(255), primary_key=True), Column('order_id', String(32), primary_key=True), Column('status', String(40), nullable=False), Column('version', Integer, nullable=False))
cleanup = Table('adw_object_cleanup', metadata, Column('bucket', String(255), primary_key=True), Column('object_key', String(255), primary_key=True), Column('status', String(40), nullable=False), Column('created_at', DateTime(timezone=True), nullable=False, server_default=func.now()))

class SharedInbox:

    def __init__(self, engine, *, allow_sqlite_for_tests=False):
        adapter = SharedReceiptRepository(engine, allow_sqlite_for_tests=allow_sqlite_for_tests)
        self.engine = engine
        self.insert_builder = adapter.insert_builder

    def receive(self, raw, headers, *, secret, shop, allow_test=False):
        notice = verified_paid_notice(raw, headers, secret=secret, shop=shop, allow_test=allow_test)
        with self.engine.begin() as db:
            inserted = db.execute(self.insert_builder(notifications).values(shop=shop, delivery=notice['delivery_id'], digest=notice['body_sha256']).on_conflict_do_nothing(index_elements=['shop', 'delivery'])).rowcount
            if not inserted:
                digest = db.execute(select(notifications.c.digest).where(notifications.c.shop == shop, notifications.c.delivery == notice['delivery_id'])).scalar_one()
                if digest != notice['body_sha256']:
                    raise ValueError('Delivery identity reused with different content')
                return {'duplicate': True, 'order_id': notice['order_id']}
            db.execute(self.insert_builder(jobs).values(shop=shop, order_id=notice['order_id'], status='awaiting_reconciliation', version=1).on_conflict_do_update(index_elements=['shop', 'order_id'], set_={'status': 'awaiting_reconciliation', 'version': jobs.c.version + 1}))
        return {'duplicate': False, 'order_id': notice['order_id']}

    def pending(self):
        with self.engine.connect() as db:
            return [dict(row) for row in db.execute(select(jobs).where(jobs.c.status == 'awaiting_reconciliation')).mappings()]

class SharedCleanup:
    """Durable deletion candidates only. Worker MUST recheck receipt ownership.

Do not delete merely because a row is queued: commit ambiguity or delayed work
can leave a candidate attached to a real receipt. No deletion worker here.
"""

    def __init__(self, engine, bucket, *, allow_sqlite_for_tests=False):
        adapter = SharedReceiptRepository(engine, allow_sqlite_for_tests=allow_sqlite_for_tests)
        if not bucket:
            raise ValueError('Dedicated bucket required')
        self.engine = engine
        self.bucket = bucket
        self.insert_builder = adapter.insert_builder

    def enqueue(self, bucket, key):
        if bucket != self.bucket or not isinstance(key, str) or (not KEY.fullmatch(key)):
            raise ValueError('Cleanup outside ADW storage denied')
        with self.engine.begin() as db:
            db.execute(self.insert_builder(cleanup).values(bucket=bucket, object_key=key, status='pending_review').on_conflict_do_nothing(index_elements=['bucket', 'object_key']))

    def pending(self):
        with self.engine.connect() as db:
            return [dict(row) for row in db.execute(select(cleanup).where(cleanup.c.status == 'pending_review')).mappings()]

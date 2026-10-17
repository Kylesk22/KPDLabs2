"""Shared receipt repository. Schema creation belongs to a reviewed migration.

Supports SQLAlchemy 1.4/2.x APIs. PostgreSQL is the deployment target; SQLite is
accepted only with an explicit test flag. No connection credentials are loaded.
"""
from sqlalchemy import MetaData, Table, Column, String, JSON, UniqueConstraint, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
metadata = MetaData()
receipts = Table('adw_intake_receipt', metadata, Column('receipt', String(36), primary_key=True), Column('lab_id', String(80), nullable=False), Column('request_key', String(80), nullable=False), Column('fingerprint', String(64), nullable=False), Column('body', JSON, nullable=False), UniqueConstraint('lab_id', 'request_key', name='uq_adw_intake_lab_request'))

class SharedReceiptRepository:

    def __init__(self, engine, *, allow_sqlite_for_tests=False):
        dialect = engine.dialect.name
        if dialect != 'postgresql' and (not (allow_sqlite_for_tests and dialect == 'sqlite')):
            raise ValueError('Shared PostgreSQL engine required')
        self.engine = engine
        self.insert_builder = pg_insert if dialect == 'postgresql' else sqlite_insert

    def get(self, receipt):
        with self.engine.connect() as db:
            return db.execute(select(receipts.c.body).where(receipts.c.receipt == receipt)).scalar_one_or_none()

    def get_request(self, lab_id, request_key):
        with self.engine.connect() as db:
            return db.execute(select(receipts.c.body).where(receipts.c.lab_id == lab_id, receipts.c.request_key == request_key)).scalar_one_or_none()

    def insert(self, row):
        raise ValueError('Shared receipt persistence requires an idempotency key')

    def insert_once(self, row):
        statement = self.insert_builder(receipts).values(receipt=row['receipt'], lab_id=row['lab_id'], request_key=row['request_key'], fingerprint=row['fingerprint'], body=row)
        statement = statement.on_conflict_do_nothing(index_elements=['lab_id', 'request_key'])
        with self.engine.begin() as db:
            db.execute(statement)
            winner = db.execute(select(receipts.c.body).where(receipts.c.lab_id == row['lab_id'], receipts.c.request_key == row['request_key'])).scalar_one()
        return winner

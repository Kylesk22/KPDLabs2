"""Durable single-attempt label ledger. Not registered in the live application.

Unknown outcomes retain their case reservations. A retry can read the result,
but cannot submit another purchase. Recovery requires provider reconciliation.
"""
import json
import secrets
from sqlalchemy import MetaData, Table, Column, String, Integer, BigInteger, JSON, select, update
from sqlalchemy.exc import IntegrityError
from .lab_review import require_staff
metadata = MetaData()
labels = Table('adw_shipping_label', metadata, Column('id', String(40), primary_key=True), Column('staff_id', String(80), nullable=False), Column('state', String(24), nullable=False), Column('snapshot', JSON, nullable=False), Column('rate_id', String(80), nullable=False), Column('amount_cents', Integer, nullable=False), Column('expires', BigInteger, nullable=False), Column('transaction_id', String(80), unique=True), Column('tracking_number', String(120)), Column('label_url', String(2048)), Column('created', BigInteger, nullable=False))
case_claims = Table('adw_shipping_case_claim', metadata, Column('case_id', Integer, primary_key=True), Column('label_id', String(40), nullable=False))
tracking_jobs = Table('adw_shipping_tracking_job', metadata, Column('label_id', String(40), primary_key=True), Column('payload', JSON, nullable=False), Column('state', String(24), nullable=False))

class LabelLedger:

    def __init__(self, engine, *, allow_sqlite_for_tests=False):
        if engine.dialect.name != 'postgresql' and (not (allow_sqlite_for_tests and engine.dialect.name == 'sqlite')):
            raise ValueError('Shared PostgreSQL required')
        self.engine = engine

    def prepare(self, *, staff, snapshot, rate_id, amount_cents, now):
        require_staff(staff)
        ids = snapshot.get('case_ids') if isinstance(snapshot, dict) else None
        if not isinstance(ids, list) or not 1 <= len(ids) <= 100 or any((type(value) is not int or value <= 0 for value in ids)) or (len(set(ids)) != len(ids)):
            raise ValueError('Valid unique case selection required')
        if not isinstance(rate_id, str) or not 1 <= len(rate_id) <= 80 or (not rate_id.isalnum()):
            raise ValueError('Provider rate required')
        if type(amount_cents) is not int or not 0 < amount_cents <= 100000:
            raise ValueError('Valid USD rate required')
        label_id = 'ADWL-' + secrets.token_hex(16)
        with self.engine.begin() as db:
            db.execute(labels.insert().values(id=label_id, staff_id=str(staff['id']), state='quoted', snapshot=snapshot, rate_id=rate_id, amount_cents=amount_cents, expires=int(now) + 900, created=int(now)))
        return label_id

    def get(self, label_id, *, staff):
        require_staff(staff)
        with self.engine.connect() as db:
            row = db.execute(select(labels).where(labels.c.id == label_id)).mappings().one_or_none()
        if row is None:
            raise ValueError('Label request unavailable')
        return dict(row)

    def claim(self, label_id, *, staff, amount_cents, now, validate):
        """validate(db, snapshot) must lock/check current case and lab rows."""
        require_staff(staff)
        try:
            with self.engine.begin() as db:
                row = db.execute(select(labels).where(labels.c.id == label_id).with_for_update()).mappings().one_or_none()
                if row is None:
                    raise ValueError('Label request unavailable')
                if row['staff_id'] != str(staff['id']):
                    raise PermissionError('Reload the quote using your staff account')
                if row['amount_cents'] != amount_cents or type(amount_cents) is not int:
                    raise ValueError('Confirm the quoted USD amount')
                if row['state'] != 'quoted':
                    return False
                if now >= row['expires']:
                    raise ValueError('Quote expired. Get fresh rates.')
                validate(db, row['snapshot'])
                for case_id in sorted(row['snapshot']['case_ids']):
                    db.execute(case_claims.insert().values(case_id=case_id, label_id=label_id))
                db.execute(update(labels).where(labels.c.id == label_id).values(state='submitting'))
                return True
        except IntegrityError:
            raise ValueError('A selected case already has a label purchase or unresolved attempt') from None

    def uncertain(self, label_id):
        with self.engine.begin() as db:
            db.execute(update(labels).where(labels.c.id == label_id, labels.c.state == 'submitting').values(state='needs_reconciliation'))

    def complete(self, label_id, result, *, cases):
        """Only a verified provider response may reach here; atomic tracking log."""
        with self.engine.begin() as db:
            row = db.execute(select(labels).where(labels.c.id == label_id).with_for_update()).mappings().one()
            if row['state'] == 'purchased':
                if row['transaction_id'] != result['transaction_id']:
                    raise ValueError('Transaction mismatch')
                return
            if row['state'] not in ('submitting', 'needs_reconciliation'):
                raise ValueError('No purchase was reserved')
            if result['rate_id'] != row['rate_id'] or result['metadata'] != label_id:
                raise ValueError('Provider transaction does not match this purchase')
            selected = db.execute(select(cases.c.id, cases.c.log).where(cases.c.id.in_(row['snapshot']['case_ids'])).with_for_update()).mappings().all()
            if len(selected) != len(row['snapshot']['case_ids']):
                raise ValueError('Case disappeared')
            for case in selected:
                logs = json.loads(case['log']) if case['log'] else []
                if not isinstance(logs, list):
                    raise ValueError('Case log requires review')
                logs.append('ADW label purchased; tracking ' + result['tracking_number'])
                encoded = json.dumps(logs)
                if len(encoded) > 2000:
                    raise ValueError('Case log requires review before tracking can be saved')
                db.execute(cases.update().where(cases.c.id == case['id']).values(log=encoded))
            db.execute(update(labels).where(labels.c.id == label_id).values(state='purchased', transaction_id=result['transaction_id'], tracking_number=result['tracking_number'], label_url=result['label_url']))
            db.execute(tracking_jobs.insert().values(label_id=label_id, state='pending', payload={'case_ids': row['snapshot']['case_ids'], 'tracking_number': result['tracking_number'], 'transaction_id': result['transaction_id']}))

"""Atomic staff handoff confirmation; does not send customer notifications."""
import json
from sqlalchemy import select
from .lab_review import require_staff
from .label_ledger import labels, tracking_jobs

class ShipmentConfirmation:

    def __init__(self, engine, cases, validate):
        (self.engine, self.cases, self.validate) = (engine, cases, validate)

    def confirm(self, label_id, *, staff, tracking_number, confirmed, now):
        require_staff(staff)
        if confirmed is not True:
            raise ValueError('Confirm the parcel was handed to the carrier')
        with self.engine.begin() as db:
            label = db.execute(select(labels).where(labels.c.id == label_id).with_for_update()).mappings().one_or_none()
            if not label or label['state'] != 'purchased':
                raise ValueError('A confirmed purchased label is required')
            if tracking_number != label['tracking_number']:
                raise ValueError('Confirm the tracking number on the parcel')
            job = db.execute(select(tracking_jobs).where(tracking_jobs.c.label_id == label_id).with_for_update()).mappings().one_or_none()
            if not job:
                raise ValueError('Tracking record missing; staff review required')
            if job['state'] in ('ready', 'sending', 'sent', 'needs_reconciliation'):
                return dict(label_id=label_id, state=job['state'], duplicate=True)
            if job['state'] != 'pending':
                raise ValueError('Tracking record requires review')
            self.validate(db, label['snapshot'])
            rows = db.execute(select(self.cases).where(self.cases.c.id.in_(label['snapshot']['case_ids'])).order_by(self.cases.c.id).with_for_update()).mappings().all()
            if len(rows) != len(label['snapshot']['case_ids']) or any((row['status'] != 'Ready to Ship' or row['hold'] not in (None, '') for row in rows)):
                raise ValueError('All cases must be ready and not on hold')
            for row in rows:
                logs = json.loads(row['log']) if row['log'] else []
                if not isinstance(logs, list):
                    raise ValueError('Case log requires review')
                logs.append('ADW carrier handoff confirmed by staff ' + str(staff['id']) + '; tracking ' + tracking_number)
                encoded = json.dumps(logs)
                if len(encoded) > 2000:
                    raise ValueError('Case log requires review')
                db.execute(self.cases.update().where(self.cases.c.id == row['id']).values(status='Shipped', log=encoded))
            payload = dict(job['payload'], confirmed_by=str(staff['id']), confirmed_at=int(now))
            db.execute(tracking_jobs.update().where(tracking_jobs.c.label_id == label_id).values(state='ready', payload=payload))
            return dict(label_id=label_id, state='ready', duplicate=False)

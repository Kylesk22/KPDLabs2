"""Durable per-order dispatch states. No Shopify client or live registration."""
from copy import deepcopy
from sqlalchemy import select
from .label_ledger import tracking_jobs

class TrackingDelivery:

    def __init__(self, engine, provider, *, validate=None):
        (self.engine, self.provider) = (engine, provider)
        self.validate = validate

    def prepare(self, label_id, targets):
        """Targets must come from a trusted server-side fulfillment planner."""
        if not isinstance(targets, list) or not targets or len(targets) > 100:
            raise ValueError('Verified fulfillment targets required')
        keys = [row.get('key') for row in targets]
        if any((not isinstance(key, str) or not key or len(key) > 200 for key in keys)) or len(set(keys)) != len(keys):
            raise ValueError('Unique fulfillment targets required')
        with self.engine.begin() as db:
            job = db.execute(select(tracking_jobs).where(tracking_jobs.c.label_id == label_id).with_for_update()).mappings().one()
            payload = deepcopy(job['payload'])
            if 'deliveries' in payload:
                if [row['target'] for row in payload['deliveries']] != targets:
                    raise ValueError('Prepared shipment changed; reconciliation required')
                return
            if job['state'] != 'ready' or not payload.get('confirmed_by'):
                raise ValueError('Carrier handoff required before tracking delivery')
            payload['deliveries'] = [dict(target=deepcopy(target), state='ready') for target in targets]
            db.execute(tracking_jobs.update().where(tracking_jobs.c.label_id == label_id).values(payload=payload))

    def claim(self, label_id, key):
        with self.engine.begin() as db:
            job = db.execute(select(tracking_jobs).where(tracking_jobs.c.label_id == label_id).with_for_update()).mappings().one()
            payload = deepcopy(job['payload'])
            rows = payload.get('deliveries', [])
            row = next((row for row in rows if row['target']['key'] == key), None)
            if row is None:
                raise ValueError('Prepared target missing')
            if row['state'] != 'ready':
                return None
            if self.validate is not None:
                self.validate(db, label_id)
            order = row['target'].get('order_id')
            if row['target'].get('fulfillment', {}).get('notifyCustomer') is True and any((other is not row and other['target'].get('order_id') == order and (other['state'] != 'sent') for other in rows)):
                raise ValueError('Finish the other shipment items before notifying this order')
            row['state'] = 'sending'
            db.execute(tracking_jobs.update().where(tracking_jobs.c.label_id == label_id).values(payload=payload, state='sending'))
            return deepcopy(row['target'])

    def finish(self, label_id, key, *, receipt=None):
        with self.engine.begin() as db:
            job = db.execute(select(tracking_jobs).where(tracking_jobs.c.label_id == label_id).with_for_update()).mappings().one()
            payload = deepcopy(job['payload'])
            row = next((row for row in payload['deliveries'] if row['target']['key'] == key))
            if row['state'] == 'sent':
                if receipt != row['receipt']:
                    raise ValueError('Fulfillment receipt mismatch')
                return
            if row['state'] not in ('sending', 'needs_reconciliation'):
                raise ValueError('No submitted tracking attempt')
            if receipt is None:
                row['state'] = 'needs_reconciliation'
            else:
                if not isinstance(receipt, str) or not receipt or len(receipt) > 200:
                    raise ValueError('Verified fulfillment receipt required')
                row.update(state='sent', receipt=receipt)
            states = {entry['state'] for entry in payload['deliveries']}
            state = 'sent' if states == {'sent'} else 'needs_reconciliation' if 'needs_reconciliation' in states else 'sending'
            db.execute(tracking_jobs.update().where(tracking_jobs.c.label_id == label_id).values(payload=payload, state=state))

    def deliver(self, label_id, key):
        target = self.claim(label_id, key)
        if target is None:
            return False
        try:
            receipt = self.provider.create(target)
            if not isinstance(receipt, str) or not receipt or len(receipt) > 200:
                raise ValueError('Provider did not confirm fulfillment')
            self.finish(label_id, key, receipt=receipt)
        except Exception:
            self.finish(label_id, key)
            raise RuntimeError('Tracking outcome uncertain; reconcile before retrying') from None
        return True

    def reconcile(self, label_id, key):
        with self.engine.connect() as db:
            payload = db.execute(select(tracking_jobs.c.payload).where(tracking_jobs.c.label_id == label_id)).scalar_one()
        row = next((row for row in payload['deliveries'] if row['target']['key'] == key))
        if row['state'] == 'sent':
            return
        if row['state'] not in ('sending', 'needs_reconciliation'):
            raise ValueError('No submitted tracking attempt')
        receipt = self.provider.find_existing(row['target'])
        if receipt is None:
            raise ValueError('No verified fulfillment found; keep for staff review')
        self.finish(label_id, key, receipt=receipt)

"""Explicitly gated shipment dispatch; not registered with the live application."""
from copy import deepcopy
from sqlalchemy import select
from .label_ledger import labels, tracking_jobs
from .fulfillment_plan import selected_orders, fulfillment_targets
from .tracking_delivery import TrackingDelivery

class TrackingWorker:

    def __init__(self, engine, provider, validate, *, enabled=False):
        (self.engine, self.provider, self.validate) = (engine, provider, validate)
        self.enabled = enabled
        self.delivery = TrackingDelivery(engine, provider, validate=self._validate)

    def _validate(self, db, label_id):
        label = db.execute(select(labels).where(labels.c.id == label_id)).mappings().one()
        if label['state'] != 'purchased':
            raise ValueError('Verified purchased label required')
        self.validate(db, label['snapshot'])

    def status(self, label_id):
        with self.engine.connect() as db:
            job = db.execute(select(tracking_jobs).where(tracking_jobs.c.label_id == label_id)).mappings().one()
            return deepcopy(dict(job))

    def prepare(self, label_id):
        job = self.status(label_id)
        if 'deliveries' in job['payload']:
            return job
        with self.engine.begin() as db:
            self._validate(db, label_id)
            expected = selected_orders(db, label_id)
        targets = []
        for order in expected:
            targets.extend(fulfillment_targets(order, self.provider.read(order['order_id'])))
        self.delivery.prepare(label_id, targets)
        return self.status(label_id)

    def run(self, label_id):
        if self.enabled is not True:
            raise ValueError('Tracking dispatch is disabled')
        job = self.prepare(label_id)
        rows = job['payload']['deliveries']
        if any((row['state'] in ('sending', 'needs_reconciliation') for row in rows)):
            raise ValueError('Resolve uncertain tracking attempts before continuing')
        for row in rows:
            if row['state'] == 'ready':
                self.delivery.deliver(label_id, row['target']['key'])
        return self.status(label_id)

    def reconcile(self, label_id, key):
        self.delivery.reconcile(label_id, key)
        return self.status(label_id)

    def batch(self, *, limit=25, after=None, send=False):
        """One bounded queue page. Uncertain sends always need reconciliation."""
        if type(limit) is not int or not 1 <= limit <= 100:
            raise ValueError('Batch limit must be between 1 and 100')
        if after is not None and (not isinstance(after, str) or len(after) > 40):
            raise ValueError('Invalid queue cursor')
        if send and self.enabled is not True:
            raise ValueError('Tracking dispatch is disabled')
        query = select(tracking_jobs).where(tracking_jobs.c.state.in_(('ready', 'sending', 'needs_reconciliation')))
        if after:
            query = query.where(tracking_jobs.c.label_id > after)
        with self.engine.connect() as db:
            jobs = db.execute(query.order_by(tracking_jobs.c.label_id).limit(limit + 1)).mappings().all()
        results = []
        for job in jobs[:limit]:
            label_id = job['label_id']
            rows = job['payload'].get('deliveries', [])
            uncertain = any((row['state'] in ('sending', 'needs_reconciliation') for row in rows))
            state = 'needs_reconciliation' if uncertain else job['state']
            if send and (not uncertain) and (state != 'needs_reconciliation'):
                try:
                    state = self.run(label_id)['state']
                except Exception:
                    state = 'review_required'
            results.append(dict(label_id=label_id, state=state))
        return dict(jobs=results, preview=not send, next_cursor=jobs[limit - 1]['label_id'] if len(jobs) > limit else None)

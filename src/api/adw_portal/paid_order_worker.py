"""Bounded paid-notice reconciliation. Never accepts files or creates KPD cases."""
import re
from sqlalchemy import select, update
from .shared_queues import jobs

class PaidOrderWorker:

    def __init__(self, engine, reconciler, *, shop):
        (self.engine, self.reconciler, self.shop) = (engine, reconciler, shop)

    def batch(self, *, limit=25, after=None, process=False):
        if type(limit) is not int or not 1 <= limit <= 100:
            raise ValueError('Limit must be between 1 and 100')
        if after is not None and (not isinstance(after, str) or not re.fullmatch('[1-9][0-9]{0,31}', after)):
            raise ValueError('Invalid order cursor')
        query = select(jobs).where(jobs.c.shop == self.shop, jobs.c.status == 'awaiting_reconciliation')
        if after is not None:
            query = query.where(jobs.c.order_id > after)
        with self.engine.connect() as db:
            rows = list(db.execute(query.order_by(jobs.c.order_id).limit(limit + 1)).mappings())
        results = []
        for row in rows[:limit]:
            state = 'awaiting_reconciliation'
            if process:
                try:
                    self.reconciler.reconcile(row['order_id'])
                    state = 'awaiting_manufacturing_review'
                except Exception:
                    state = 'needs_review'
                with self.engine.begin() as db:
                    changed = db.execute(update(jobs).where(jobs.c.shop == self.shop, jobs.c.order_id == row['order_id'], jobs.c.version == row['version'], jobs.c.status == 'awaiting_reconciliation').values(status=state)).rowcount
                if not changed:
                    state = 'changed_during_processing'
            results.append(dict(order_id=row['order_id'], state=state))
        return dict(jobs=results, preview=not process, next_cursor=rows[limit - 1]['order_id'] if len(rows) > limit else None)

def register_paid_order_command(app, handoff):
    import click
    import json
    from .order_reconciliation import Reconciler
    worker = PaidOrderWorker(handoff.engine, Reconciler(handoff.client, handoff.memberships, handoff.receipts, handoff.claims, shop=handoff.shop, catalog=handoff.catalog, guest_checkout=handoff.guest_checkout, clock=handoff.clock), shop=handoff.shop)

    @app.cli.command('adw-paid-order-queue')
    @click.option('--limit', default=25, type=click.IntRange(1, 100))
    @click.option('--after', default=None)
    @click.option('--process', is_flag=True, help='Verify paid orders and reserve for staff review only.')
    def paid_queue(limit, after, process):
        try:
            result = worker.batch(limit=limit, after=after, process=process)
        except Exception:
            raise click.ClickException('Paid-order queue unavailable; check configuration and migrations.') from None
        click.echo(json.dumps(result))
        if any((job['state'] == 'needs_review' for job in result['jobs'])):
            raise click.ClickException('Some orders require review; no manufacturing cases were created.')

"""Operator-only maintenance commands; no automatic dispatch or public endpoint."""
import json
import click

def register_tracking_commands(app, worker):

    @app.cli.command('adw-tracking')
    @click.option('--label-id', required=True)
    @click.option('--action', type=click.Choice(['status', 'prepare', 'send', 'reconcile']), default='status', show_default=True)
    @click.option('--target-key', default=None)
    def tracking(label_id, action, target_key):
        """Inspect or explicitly process one confirmed parcel."""
        try:
            if action == 'status':
                job = worker.status(label_id)
            elif action == 'prepare':
                job = worker.prepare(label_id)
            elif action == 'send':
                job = worker.run(label_id)
            else:
                if not target_key:
                    raise ValueError('Target key required')
                job = worker.reconcile(label_id, target_key)
            rows = job['payload'].get('deliveries', [])
            click.echo(json.dumps(dict(label_id=label_id, state=job['state'], deliveries=[dict(key=row['target']['key'], state=row['state']) for row in rows])))
        except Exception:
            raise click.ClickException('Tracking operation did not complete. Check configuration, shipment eligibility and permissions. Use status; reconcile uncertain attempts before sending again.') from None

def assemble_tracking(engine, handoff, cases, environ):
    from .fulfillment_transport import FulfillmentTransport
    from .shopify_fulfillment import ShopifyFulfillment
    from .label_validation import LabelValidation
    from .tracking_worker import TrackingWorker
    writes = environ.get('ADW_TRACKING_SEND_ENABLED') == 'true'
    notifications = environ.get('ADW_TRACKING_EMAIL_ENABLED') == 'true'
    if notifications and (not writes):
        raise ValueError('Tracking sending required before notifications')
    provider = ShopifyFulfillment(FulfillmentTransport(handoff.client, writes_enabled=writes), shop=handoff.shop, enabled=writes, notifications_enabled=notifications)
    return TrackingWorker(engine, provider, LabelValidation(handoff, cases, required_status='Shipped'), enabled=writes)

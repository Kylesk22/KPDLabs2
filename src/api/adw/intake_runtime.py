"""Intake assembly for an explicitly enabled pilot. No automatic schema creation."""
from .shared_receipts import SharedReceiptRepository
from .shared_memberships import SharedMemberships
from .shared_queues import SharedCleanup
from .private_storage import PrivateObjectStorage
from .streaming_intake import StreamingIntake
from .upload_grants import UploadGrants
from .shopify_upload_routes import register_shopify_intake

SHOP='0z8umb-uq.myshopify.com'
BUCKET='adw-case-files'


def register_intake_runtime(app,engine,client,config,*,allow_sqlite_for_tests=False):
    if config.get('ADW_INTAKE_ENABLED') is not True:return None
    if config.get('ADW_STORAGE_BUCKET')!=BUCKET:
        raise ValueError('Dedicated ADW bucket required')
    secret=config.get('ADW_SHOPIFY_SECRET');signing=config.get('ADW_UPLOAD_SIGNING_SECRET')
    if (not isinstance(secret,str) or len(secret)<32 or not isinstance(signing,str)
            or len(signing)<32 or secret==signing):
        raise ValueError('Separate server app and upload secrets required')
    options=dict(allow_sqlite_for_tests=allow_sqlite_for_tests)
    memberships=SharedMemberships(engine,**options)
    receipts=SharedReceiptRepository(engine,**options)
    cleanup=SharedCleanup(engine,BUCKET,**options)
    storage=PrivateObjectStorage(client,BUCKET,cleanup.enqueue)
    intake=StreamingIntake(receipts,storage)
    grants=UploadGrants(signing.encode(),memberships,SHOP)
    app.config.update(ADW_SHOPIFY_INTAKE_ENABLED=True,ADW_STREAMING_UPLOAD_ENABLED=True)
    register_shopify_intake(app,grants=grants,intake=intake,shop=SHOP,
        proxy_secret=secret.encode(),origin='https://'+SHOP)
    return dict(memberships=memberships,receipts=receipts,cleanup=cleanup)


def register_approval_commands(app,memberships):
    """Operator CLI only. Access to the server console is the privilege boundary.

Never expose these commands as unauthenticated web endpoints or run them from
shopper-provided payloads. Actor is an operator-supplied audit label.
"""
    import click

    @app.cli.group('adw-labs')
    def adw_labs():
        """Approve/revoke explicitly verified ADW lab customer memberships."""

    @adw_labs.command('approve')
    @click.option('--customer',required=True)
    @click.option('--lab',required=True)
    @click.option('--actor',required=True)
    @click.confirmation_option(prompt='Approve this Shopify customer for this verified lab?')
    def approve(customer,lab,actor):
        memberships.approve(SHOP,customer,lab,actor=actor)
        click.echo('ADW lab membership approved and audited.')

    @adw_labs.command('revoke')
    @click.option('--customer',required=True)
    @click.option('--actor',required=True)
    @click.confirmation_option(prompt='Revoke this customer’s ADW upload access?')
    def revoke(customer,actor):
        memberships.revoke(SHOP,customer,actor=actor)
        click.echo('ADW lab membership revoked and audited.')

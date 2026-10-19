"""Operator-only, read-only order verification. Never reserves or creates work."""
import json
import click
from .guest_checkout import GuestCheckout
from .order_verification import verify_order
from .order_shipping import normalize_address
from .shared_receipts import SharedReceiptRepository
from .shopify_orders import ShopifyOrders, ShopifyUnavailable
import time
SHOP = '0z8umb-uq.myshopify.com'
CATALOG = {'gid://shopify/ProductVariant/44290691563579': 'ADW-ZR-M', 'gid://shopify/ProductVariant/44290691596347': 'ADW-ZR-D', 'gid://shopify/ProductVariant/44290691629115': 'ADW-ZR-MF', 'gid://shopify/ProductVariant/44290691661883': 'ADW-ZR-DF', 'gid://shopify/ProductVariant/44290691760187': 'ADW-CAD-CB'}

def check_order(order_id, *, client, receipts, checkout, now, test_order=False):
    current = client.fetch_order(order_id)
    if test_order and current.get('test') is not True:
        raise ValueError('Explicit test-order check requires a Shopify test order')
    plan = verify_order(current, shop=SHOP, memberships=None, receipts=receipts, catalog=CATALOG, guest_checkout=checkout, now=now, allow_test=test_order)
    physical = any((line['sku'] != 'ADW-CAD-CB' for line in plan['lines']))
    if physical:
        normalize_address(current.get('shippingAddress'))
    return dict(mode='read_only', order_id=plan['order_id'], verified_lines=len(plan['lines']), units=sum((line['quantity'] for line in plan['lines'])), shipping_required=physical, shipping_verified=physical, test_order=current.get('test') is True, production_release=False, database_writes=False)

def register_order_preflight(app, engine, environ, *, client_factory=ShopifyOrders):

    @app.cli.command('adw-order-check')
    @click.option('--order-id', required=True, help='Numeric Shopify order ID, not its display number.')
    @click.option('--test-order', is_flag=True, help='Read-only check of a Shopify test order; never releases production.')
    def command(order_id, test_order):
        """Verify a paid order without reserving files or creating KPD cases."""
        client_id = environ.get('ADW_SHOPIFY_CLIENT_ID')
        secret = environ.get('ADW_SHOPIFY_SECRET')
        if not client_id or not secret:
            raise click.ClickException('Configure ADW_SHOPIFY_CLIENT_ID and ADW_SHOPIFY_SECRET on the server.')
        try:
            receipts = SharedReceiptRepository(engine)
            result = check_order(order_id, client=client_factory(client_id, secret), receipts=receipts, checkout=GuestCheckout(engine, receipts), now=time.time(), test_order=test_order)
        except ShopifyUnavailable:
            raise click.ClickException('Shopify lookup failed. Check app credentials and order permissions; no changes made.') from None
        except (ValueError, PermissionError):
            raise click.ClickException('Order is not ready: verify payment, products, file ownership, checkout proof, and shipping. No changes made.') from None
        except Exception:
            raise click.ClickException('Order check unavailable. Check server/database readiness; no changes made.') from None
        click.echo(json.dumps(result, sort_keys=True))

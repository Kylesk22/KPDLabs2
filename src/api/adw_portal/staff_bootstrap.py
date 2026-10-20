"""Explicit host assembly for review only; no order acceptance or label purchases."""
from sqlalchemy import inspect
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from .order_claims import OrderClaims, metadata as order_metadata
from .guest_enrollment import metadata as guest_metadata
from .staff_runtime import register_staff_runtime
from .kpd_host_guards import register_kpd_guards

def configure_staff(app, engine, storage, receipts, lookup_user, *, environ=None):
    if not callable(lookup_user):
        raise ValueError('Trusted KPD user lookup required')
    if app.config.get('JWT_COOKIE_CSRF_PROTECT') is not True:
        raise ValueError('KPD cookie CSRF protection required')
    inspector = inspect(engine)
    for table in list(order_metadata.tables.values()) + list(guest_metadata.tables.values()):
        columns = {entry['name'] for entry in inspector.get_columns(table.name)}
        if not set(table.columns.keys()).issubset(columns):
            raise ValueError('Staff migration required')
    claims = OrderClaims(engine)
    order_service = None
    shipping_service = None
    if (environ or {}).get('ADW_SHIPPING_RATES_ENABLED') == 'true' and (environ or {}).get('ADW_STAFF_ORDERS_ENABLED') != 'true':
        raise ValueError('Staff order review must be enabled before shipping rates')
    if (environ or {}).get('ADW_STAFF_ORDERS_ENABLED') == 'true':
        from sqlalchemy import MetaData, Table
        from datetime import datetime, timezone, date
        import json
        from .shopify_orders import ShopifyOrders
        from .guest_checkout import GuestCheckout
        from .order_preflight import SHOP, CATALOG
        from .reviewed_handoff import ReviewedHandoff
        from .kpd_case_writer import case_writer
        from .staff_orders import StaffOrders
        if not environ.get('ADW_SHOPIFY_CLIENT_ID') or not environ.get('ADW_SHOPIFY_SECRET'):
            raise ValueError('Shopify order credentials required')
        tables = MetaData()
        users = Table('user', tables, autoload_with=engine)
        cases = Table('case', tables, autoload_with=engine)
        calendar = json.loads(environ.get('ADW_PRODUCTION_HOLIDAYS', '[]'))
        if not isinstance(calendar, list) or len(calendar) > 366:
            raise ValueError('Production holiday calendar must be a list of dates')
        holidays = tuple((date.fromisoformat(value) for value in calendar))

        def writer_factory(profile):
            return case_writer(cases, accepted_at=datetime.now(timezone.utc), practice=profile['practice'], holidays=holidays)
        order_service = StaffOrders(ReviewedHandoff(engine, users, ShopifyOrders(environ['ADW_SHOPIFY_CLIENT_ID'], environ['ADW_SHOPIFY_SECRET']), None, receipts, claims, shop=SHOP, catalog=CATALOG, writer=None, auth_guard_enabled=True, guest_checkout=GuestCheckout(engine, receipts), writer_factory=writer_factory))
        if environ.get('ADW_SHIPPING_RATES_ENABLED') == 'true':
            from .staff_shipping_rates import StaffShippingRates
            from .shipping_rates import ShippoRates
            shipping_service = StaffShippingRates(order_service.handoff, cases, ShippoRates(environ.get('SHIPPO_TOKEN')))

    def authenticate():
        verify_jwt_in_request(locations=['cookies'])
        return lookup_user(get_jwt_identity())
    register_kpd_guards(app, enabled=True, engine=engine, authenticate_staff=authenticate, lookup_user=lookup_user)
    register_staff_runtime(app, enabled=True, engine=engine, lookup_user=lookup_user, claims=claims, receipts=receipts, storage=storage, order_service=order_service, shipping_service=shipping_service)

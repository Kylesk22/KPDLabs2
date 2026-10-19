"""Explicit host assembly for review only; no order acceptance or label purchases."""
from sqlalchemy import inspect
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from .order_claims import OrderClaims, metadata as order_metadata
from .guest_enrollment import metadata as guest_metadata
from .staff_runtime import register_staff_runtime
from .kpd_host_guards import register_kpd_guards

def configure_staff(app, engine, storage, receipts, lookup_user):
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

    def authenticate():
        verify_jwt_in_request(locations=['cookies'])
        return lookup_user(get_jwt_identity())
    register_kpd_guards(app, enabled=True, engine=engine, authenticate_staff=authenticate, lookup_user=lookup_user)
    register_staff_runtime(app, enabled=True, engine=engine, lookup_user=lookup_user, claims=claims, receipts=receipts, storage=storage)

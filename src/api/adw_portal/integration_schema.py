"""Register staged order/guest schema for host migration discovery only.

No database connection, DDL, route registration, or feature enablement occurs.
Host must call this before any integration migration is deployed so later
autogeneration does not propose dropping these tables as unknown models.
"""
from .order_claims import metadata as orders
from . import kpd_case_links
from . import lab_accounts
from . import order_shipping
from .guest_email_verification import metadata as email
from .guest_upload_session import metadata as sessions
from .guest_enrollment import metadata as enrollment
from . import lab_review
from .guest_checkout import metadata as checkout
from .portal_rate_limits import metadata as rate_limits
INTEGRATION_TABLES = tuple((table for metadata in (orders, email, sessions, enrollment, checkout, rate_limits) for table in metadata.tables.values()))

def register_integration_metadata(target):
    for table in INTEGRATION_TABLES:
        if table.key not in target.tables:
            table.to_metadata(target)

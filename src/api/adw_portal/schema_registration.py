"""Expose migrated ADW tables to KPD's migration metadata, without connecting."""
from .shared_receipts import receipts
from .shared_memberships import members, audit
from .shared_queues import cleanup
INTAKE_TABLES = (receipts, members, audit, cleanup)

def register_intake_metadata(target):
    for table in INTAKE_TABLES:
        if table.key not in target.tables:
            table.to_metadata(target)

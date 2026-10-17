"""ADW owner-approved dispatch targets; independent of KPD's six-day rule."""
from datetime import date, timedelta
BUSINESS_DAYS = {'ADW-ZR-M': 2, 'ADW-ZR-D': 3, 'ADW-ZR-MF': 3, 'ADW-ZR-DF': 4, 'ADW-CAD-CB': 2}

def dispatch_target(accepted_date, sku, *, holidays):
    """Start after payment and file acceptance; pass Florida-local acceptance date.

Holidays are explicitly supplied by the production calendar. Standalone CAD is
two business days; PMMA remains quoted. Transit is not included.
"""
    if type(accepted_date) is not date:
        raise ValueError('Local acceptance date required')
    if sku not in BUSINESS_DAYS:
        raise ValueError('This service requires an explicit dispatch date')
    if any((type(day) is not date for day in holidays)):
        raise ValueError('Invalid holiday calendar')
    excluded = set(holidays)
    remaining = BUSINESS_DAYS[sku]
    target = accepted_date
    while remaining:
        target += timedelta(days=1)
        if target.weekday() < 5 and target not in excluded:
            remaining -= 1
    return target

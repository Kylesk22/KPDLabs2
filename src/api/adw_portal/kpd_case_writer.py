"""Insert reviewed ADW work using KPD's existing Case columns.

Use only in the atomic handoff transaction. No placeholder cases or public scan
URLs. The linked ADW record supplies files, billing provenance and shipping.
"""
import json
from decimal import Decimal
from datetime import datetime, date, time
from zoneinfo import ZoneInfo
from .production_schedule import dispatch_target

def case_writer(case_table, *, accepted_at, practice, holidays, quoted_dates=None, local_timezone=None):
    if not isinstance(accepted_at, datetime) or accepted_at.tzinfo is None:
        raise ValueError('Timezone-aware acceptance time required')
    if not isinstance(practice, str) or not 1 <= len(practice.strip()) <= 100:
        raise ValueError('Lab name required')
    accepted = accepted_at.astimezone(local_timezone or ZoneInfo('America/New_York'))
    stamp = accepted.strftime('%m/%d/%Y %H:%M:%S')
    excluded = tuple(holidays)
    quoted_dates = dict(quoted_dates or {})

    def write(connection, account_id, line):
        sku = line['sku']
        if sku == 'ADW-CAD-CB':
            due = quoted_dates.get(line['line_id'], dispatch_target(accepted.date(), sku, holidays=excluded))
            if type(due) is not date or due < accepted.date():
                raise ValueError('Invalid approved CAD delivery date')
            (product, finish) = ('ADW Crown & Bridge CAD', 'Design only')
        else:
            due = dispatch_target(accepted.date(), sku, holidays=excluded)
            product = 'ADW Multilayer Zirconia'
            finish = 'Stain & glaze' if sku in {'ADW-ZR-MF', 'ADW-ZR-DF'} else 'Milled & sintered'
        includes_design = sku in {'ADW-ZR-D', 'ADW-ZR-DF', 'ADW-CAD-CB'}
        fields = dict(user_id=account_id, name=line['reference'], doctor_name=practice.strip(), type='ADW', product=product, finish=finish, shade=line['shade'], teeth=','.join((str(tooth) for tooth in line['teeth'])), status='Submitted', price=f"{Decimal(line['unit_price_cents']) * line['quantity'] / 100:.2f}", creation_date=stamp, update_date=stamp, due_date=datetime.combine(due, time(17)).strftime('%m/%d/%Y %H:%M:%S'), reference_id=line['reference'], production='Standard', notes='ADW CAD design requested.' if includes_design else 'Customer-supplied design.', log=json.dumps(['ADW accepted: ' + stamp + '; billing handled in Shopify']), tooth_designations=json.dumps({}))
        return connection.execute(case_table.insert().values(**fields)).inserted_primary_key[0]
    return write

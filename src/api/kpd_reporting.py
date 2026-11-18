"""Read-only operations reporting over KPD's existing case records.

Legacy local timestamps are interpreted as Florida wall time. No draft dates or
billing dates are substituted for shipment dates. Values are current case values,
not revenue recognition or cash receipts.
"""
import csv
import io
import json
import re
from collections import defaultdict
from datetime import date, datetime
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from zoneinfo import ZoneInfo

FLORIDA = ZoneInfo('America/New_York')
ACTIVE = {'submitted', 'scanning', 'design', 'manufacturing', 'pre-finish', 'finish', 'ready to ship'}
TERMINAL = {'shipped', 'billed', 'closed'}
VIEWS = ('received', 'shipped', 'in_house', 'production', 'held', 'ready')


def held(value):
    return bool(value) and str(value).strip().lower() not in {'', 'false', '0', 'none', 'null'}


def money_cents(value):
    if value is None or str(value).strip() == '':
        return None
    raw = str(value).strip().replace('$', '').replace(',', '')
    try:
        amount = Decimal(raw)
        if not amount.is_finite() or amount < 0:
            return None
        return int((amount * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
    except (InvalidOperation, ValueError):
        return None


def local_day(value):
    if not value:
        return None
    value = str(value).strip()
    for fmt in ('%m/%d/%Y %H:%M:%S', '%m/%d/%Y', '%Y-%m-%d'):
        try:
            return datetime.strptime(value, fmt).date().isoformat()
        except ValueError:
            pass
    try:
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
        if parsed.tzinfo:
            parsed = parsed.astimezone(FLORIDA)
        return parsed.date().isoformat()
    except ValueError:
        return None


def case_logs(value):
    try:
        entries = json.loads(value) if isinstance(value, str) else value
        return [entry for entry in entries if isinstance(entry, str)] if isinstance(entries, list) else []
    except (ValueError, TypeError):
        return []


def event_day(logs, prefix):
    dates = [local_day(entry[len(prefix):].strip()) for entry in logs if entry.startswith(prefix)]
    return min((day for day in dates if day), default=None)


def quantity(case):
    """Count restoration teeth or explicitly recorded arches; flag ambiguity."""
    raw = case.get('teeth') or ''
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except ValueError:
            # PostgreSQL's legacy array-to-text representation: {"8","9"}.
            raw = raw.strip('{}[]').split(',')
    if isinstance(raw, (str, int)):
        raw = [raw]
    parts = [str(item).strip(' \"\'') for item in raw] if isinstance(raw, (list, tuple)) else []
    kind = str(case.get('type') or '').lower()
    if kind in {'crown', 'veneer', 'bridge', 'implantcrown'}:
        teeth = {int(item) for item in parts if item.isdecimal() and 1 <= int(item) <= 32}
        return (len(teeth), 'tooth', False) if teeth and len(teeth) == len(set(parts)) else (None, 'tooth', True)
    arches = set()
    for part in parts:
        if 'upper' in part.lower():
            arches.add('upper')
        if 'lower' in part.lower():
            arches.add('lower')
    if arches:
        return len(arches), 'arch', False
    # A case is reliable; an item/arch count is not for incomplete legacy data.
    return None, 'unit', True


def normalize_case(case):
    status = str(case.get('status') or '').strip().lower()
    if status in {'created', 'void', 'voided', 'cancelled', 'canceled', ''}:
        return None
    logs = case_logs(case.get('log'))
    received = event_day(logs, 'KPD: Impressions Received ') or event_day(logs, 'Submitted:')
    inferred = False
    if not received and status in ACTIVE | TERMINAL:
        received = local_day(case.get('update_date'))
        inferred = bool(received)
    shipped = event_day(logs, 'Shipped:')
    units, unit_kind, unknown = quantity(case)
    return dict(id=case['id'], patient=case.get('name') or '', customer_id=case.get('user_id'),
                customer=case.get('customer') or 'Unknown customer', doctor=case.get('doctor_name') or case.get('customer') or '',
                type=case.get('type') or 'Unspecified', product=case.get('product') or 'Unspecified',
                status=(case.get('status') or '').strip(), received=received, shipped=shipped,
                value_cents=money_cents(case.get('price')), units=units, unit_kind=unit_kind,
                quantity_unknown=unknown, received_inferred=inferred,
                in_house=status in ACTIVE, held=held(case.get('hold')) and status in ACTIVE)


def totals(rows):
    return dict(cases=len(rows), value_cents=sum(row['value_cents'] or 0 for row in rows),
                units=sum(row['units'] or 0 for row in rows),
                missing_values=sum(row['value_cents'] is None for row in rows),
                missing_quantities=sum(row['units'] is None for row in rows))


def build_report(cases, start, end, view='received', customer_id=None, product=None, doctor=None):
    date.fromisoformat(start)
    date.fromisoformat(end)
    if start > end or view not in VIEWS:
        raise ValueError('Choose a valid date range and report.')
    all_rows = [row for row in (normalize_case(c) for c in cases) if row]
    customers = sorted({(r['customer_id'], r['customer']) for r in all_rows}, key=lambda pair: pair[1])
    products = sorted({r['product'] for r in all_rows})
    doctors = sorted({r['doctor'] for r in all_rows if r['doctor']})
    rows = [r for r in all_rows if (not customer_id or str(r['customer_id']) == str(customer_id))
            and (not product or r['product'] == product) and (not doctor or r['doctor'] == doctor)]
    groups = {
        'received': [r for r in rows if r['received'] and start <= r['received'] <= end],
        'shipped': [r for r in rows if r['shipped'] and start <= r['shipped'] <= end],
        'in_house': [r for r in rows if r['in_house']],
        'production': [r for r in rows if r['in_house'] and not r['held'] and r['status'].lower() != 'ready to ship'],
        'held': [r for r in rows if r['held']],
        'ready': [r for r in rows if r['in_house'] and not r['held'] and r['status'].lower() == 'ready to ship'],
    }
    selected = sorted(groups[view], key=lambda row: row['id'], reverse=True)
    breakdowns = {}
    for key in ('customer', 'doctor', 'product', 'status'):
        bucket = defaultdict(list)
        for row in selected:
            # Do not merge identically named products across device types or unit bases.
            label = f"{row['type']} / {row['product']} ({row['unit_kind']})" if key == 'product' else row[key]
            bucket[label].append(row)
        breakdowns[key] = [dict(name=name, **totals(items)) for name, items in sorted(bucket.items())]
    return dict(start=start, end=end, view=view, timezone='America/New_York',
                snapshot_at=datetime.now(FLORIDA).isoformat(),
                summary={key: totals(items) for key, items in groups.items()},
                rows=selected, breakdowns=breakdowns,
                filters=dict(customers=[dict(id=k, name=v) for k, v in customers], products=products, doctors=doctors),
                quality=dict(missing_received=sum(not r['received'] for r in rows),
                             inferred_received=sum(r['received_inferred'] for r in rows),
                             missing_shipped=sum(r['status'].lower() in TERMINAL and not r['shipped'] for r in rows)))


def report_csv(report):
    output = io.StringIO(newline='')
    writer = csv.writer(output)
    writer.writerow(['Case', 'Customer', 'Doctor', 'Patient', 'Type', 'Product', 'Status', 'Received', 'Shipped', 'Units', 'Unit basis', 'Case value USD'])
    def safe(value):
        text = str(value) if value is not None else ''
        return "'" + text if text.lstrip().startswith(('=', '+', '-', '@', '\t', '\r')) else text
    for r in report['rows']:
        writer.writerow([safe(v) for v in [r['id'], r['customer'], r['doctor'], r['patient'], r['type'], r['product'], r['status'],
                                          r['received'], r['shipped'], r['units'], r['unit_kind'],
                                          f"{r['value_cents'] / 100:.2f}" if r['value_cents'] is not None else None]])
    return '\ufeff' + output.getvalue()

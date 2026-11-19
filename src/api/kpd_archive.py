"""Bounded, read-only case searches. Never serialize scans or prescription details."""
from datetime import date
from sqlalchemy import case as sql_case, func, or_
from api.models import db, Case, User
from api.kpd_shipments import adw_case_ids

PAGE_SIZE = 25


def saved_case_day():
    # Existing case dates are text, predominantly MM/DD/YYYY HH:MM:SS.
    value = Case.update_date
    return sql_case(
        (value.like('____-__-__%'), func.substr(value, 1, 10)),
        (value.like('__/__/____%'), func.substr(value, 7, 4) + '-' + func.substr(value, 1, 2) + '-' + func.substr(value, 4, 2)),
        else_=None,
    )


def search_archive(args):
    scope = args.get('scope', 'closed')
    if scope not in ('closed', 'all'):
        raise ValueError('Choose Closed cases or All cases.')
    try:
        page = int(args.get('page', '1'))
    except (TypeError, ValueError):
        raise ValueError('Invalid page number.')
    if not 1 <= page <= 1000000:
        raise ValueError('Invalid page number.')
    text = (args.get('q') or '').strip()
    if len(text) > 200:
        raise ValueError('Search must be 200 characters or fewer.')
    start, end = args.get('start', ''), args.get('end', '')
    for value in (start, end):
        if value:
            try:
                if date.fromisoformat(value).isoformat() != value:
                    raise ValueError()
            except (TypeError, ValueError):
                raise ValueError('Use valid dates in YYYY-MM-DD format.')
    if start and end and start > end:
        raise ValueError('From must be on or before Through.')
    customer = func.trim(func.coalesce(User.fname, '') + ' ' + func.coalesce(User.lname, ''))
    doctor = func.coalesce(func.nullif(func.trim(Case.doctor_name), ''), customer)
    day = saved_case_day()
    sort = args.get('sort', 'case')
    direction = args.get('direction', 'desc')
    columns = {'case': Case.id, 'patient': func.lower(Case.name), 'doctor': func.lower(doctor),
               'date': day, 'product': func.lower(Case.product), 'status': Case.status}
    if sort not in columns or direction not in ('asc', 'desc'):
        raise ValueError('Invalid sort order.')
    query = db.session.query(
        Case.id, Case.name.label('patient'), doctor.label('doctor'), customer.label('customer'),
        Case.type, Case.product, Case.status, day.label('case_date'), Case.scanner_id,
    ).outerjoin(User, User.id == Case.user_id)
    excluded = adw_case_ids()
    if excluded:
        query = query.filter(~Case.id.in_(excluded))
    if scope == 'closed':
        query = query.filter(Case.status == 'Closed')
    if text:
        # #123 or 123 selects the exact case; named/scanner searches allow substrings.
        number = text.lstrip('#')
        if number.isascii() and number.isdigit():
            if len(number) > 10:
                query = query.filter(False)
            else:
                query = query.filter(Case.id == int(number))
        else:
            term = '%' + text.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_') + '%'
            query = query.filter(or_(Case.name.ilike(term, escape='\\'), doctor.ilike(term, escape='\\'),
                                     customer.ilike(term, escape='\\'), Case.scanner_id.ilike(term, escape='\\')))
    if start:
        query = query.filter(day >= start)
    if end:
        query = query.filter(day <= end)
    total = query.count()
    pages = max(1, (total + PAGE_SIZE - 1) // PAGE_SIZE)
    page = min(page, pages)
    order = columns[sort].asc() if direction == 'asc' else columns[sort].desc()
    rows = query.order_by(order, Case.id.desc()).offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()
    return {'cases': [dict(row._mapping) for row in rows], 'total': total, 'page': page,
            'pages': pages, 'page_size': PAGE_SIZE, 'scope': scope}

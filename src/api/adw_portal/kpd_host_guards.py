"""Optional legacy-route guardrails. No case creation or label purchasing."""
from flask import request, jsonify
from sqlalchemy import select
from .kpd_case_links import links
from .internal_account_guard import register_internal_account_guard

def register_kpd_guards(app, *, enabled, engine, authenticate_staff, lookup_user):
    if enabled is not True:
        return False
    if not callable(authenticate_staff) or not callable(lookup_user):
        raise ValueError('Trusted KPD account callbacks required')
    with engine.connect() as connection:
        connection.execute(select(links.c.case_id).limit(0))
    register_internal_account_guard(app, lookup_user)

    @app.before_request
    def protect_adw_cases():
        if not request.path.startswith('/api/'):
            return None
        if request.method not in {'POST', 'PUT', 'PATCH', 'DELETE'}:
            return None
        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            return None
        ids = body.get('cases') if isinstance(body.get('cases'), list) else [body.get('case')]
        if len(ids) > 1000:
            return (jsonify(message='Select at most 1000 cases'), 400)
        selected = []
        for value in ids:
            if type(value) is int and value > 0:
                selected.append(value)
            elif isinstance(value, str) and value.isascii() and value.isdecimal() and (len(value) <= 10):
                selected.append(int(value))
        if not selected:
            return None
        with engine.connect() as connection:
            linked = connection.execute(select(links.c.case_id).where(links.c.case_id.in_(selected))).scalars().all()
        if not linked:
            return None
        staff = authenticate_staff()
        if not isinstance(staff, dict) or staff.get('role') != 'Admin' or (not staff.get('id')):
            return (jsonify(message='Administrator access required for ADW cases'), 403)
        if body.get('status') == 'Billed':
            return (jsonify(message='ADW cases are paid through Shopify and cannot be billed again in KPD.'), 409)
        if request.path.startswith('/api/shippo/'):
            return (jsonify(message='ADW labels require the verified order shipping flow.'), 409)
    app.extensions['adw_kpd_guards'] = True
    return True

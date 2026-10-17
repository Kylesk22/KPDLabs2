"""Host hook blocking login/recovery for non-interactive ADW account records."""
from flask import request, jsonify

def register_internal_account_guard(app, lookup_user):
    paths = {'/api/login', '/api/admin-login', '/api/updatePassword', '/api/forgotPassword', '/api/validateanswers', '/api/signup'}

    @app.before_request
    def block_internal_auth():
        if request.path.rstrip('/') not in paths or request.method not in {'POST', 'PUT'}:
            return None
        payload = request.get_json(silent=True)
        email = payload.get('email') if isinstance(payload, dict) else None
        if not isinstance(email, str):
            return None
        if email.strip().lower().endswith('@internal.invalid'):
            return (jsonify(message='This account cannot sign in or use password recovery'), 403)
        user = lookup_user(email)
        if user and user.get('role') == 'ADWInternal':
            return (jsonify(message='This account cannot sign in or use password recovery'), 403)
    app.extensions['adw_internal_auth_guard'] = True

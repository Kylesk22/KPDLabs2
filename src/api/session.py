"""Session status is read-only; explicit activity renewal never comes from polling."""
from datetime import datetime, timezone, timedelta
import math
from flask import jsonify, request, current_app
from flask_jwt_extended import (jwt_required, get_jwt, get_jwt_identity,
    create_access_token, decode_token, set_access_cookies, unset_jwt_cookies)


def register_session_routes(app, lookup_user):
    def reply(expiry):
        user = lookup_user(get_jwt_identity())
        if not user:
            return jsonify(message="Account unavailable"), 401
        response = jsonify(identity=get_jwt_identity(), user_id=user['id'], role=user['role'],
            expires_at=expiry, server_time=datetime.now(timezone.utc).timestamp(),
            idle_seconds=current_app.config.get('SESSION_IDLE_SECONDS', 1800))
        response.headers['Cache-Control'] = 'no-store'
        return response

    @app.get('/api/session/status')
    @jwt_required()
    def session_status():
        return reply(get_jwt()['exp'])

    @app.post('/api/session/continue')
    @jwt_required()
    def session_continue():
        # Elapsed time lets activity reported on the next heartbeat keep its
        # original deadline instead of gaining an extra polling interval.
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return jsonify(message='Activity interval required'), 400
        idle = payload.get('idle_seconds')
        limit = current_app.config.get('SESSION_IDLE_SECONDS', 1800)
        if isinstance(idle, bool) or not isinstance(idle, (int, float)) or not math.isfinite(idle) or idle < 0:
            return jsonify(message="Invalid activity interval"), 400
        if idle >= limit:
            return jsonify(message="Session inactive"), 401
        response = reply(get_jwt()['exp'])
        if isinstance(response, tuple):
            return response
        token = create_access_token(identity=get_jwt_identity(),
                                    expires_delta=timedelta(seconds=limit-idle))
        response = reply(decode_token(token)['exp'])
        set_access_cookies(response, token)
        return response

    @app.post('/api/session/logout')
    def session_logout():
        # Works with expired cookies, too. Require a same-origin browser request.
        origin = request.headers.get('Origin')
        if origin != current_app.config.get('SESSION_PUBLIC_ORIGIN', request.host_url.rstrip('/')) or request.headers.get('X-KPD-Logout') != '1':
            return jsonify(message="Same-origin logout required"), 403
        response = jsonify(message='Signed out')
        response.headers['Cache-Control'] = 'no-store'
        unset_jwt_cookies(response)
        return response

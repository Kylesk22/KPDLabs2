"""Server-authorized security-question recovery, no schema changes required."""
import hashlib
import hmac
import bcrypt
from flask import request, jsonify
from itsdangerous import URLSafeTimedSerializer, BadData


def register_recovery(app, db, User):
    secret = app.config.get('JWT_SECRET_KEY')
    if not secret:
        raise RuntimeError('Recovery signing secret required')
    signer = URLSafeTimedSerializer(secret, salt='kpd-password-recovery-v1')

    def version(user):
        return hmac.new(secret.encode(), user.password.encode(), hashlib.sha256).hexdigest()

    def reject():
        return jsonify(message='Verification expired or unsuccessful. Please verify your answers again.'), 403

    def account(payload):
        email = payload.get('email')
        if not isinstance(email, str) or len(email) > 120:return None
        user = db.session.query(User).filter_by(email=email).first()
        if user is None or user.role == 'ADWInternal':return None
        return user

    def verify_answers():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):return reject()
        user = account(payload)
        if user is None:return reject()
        values = [payload.get('securityAnswer1'), payload.get('securityAnswer2')]
        if any(not isinstance(v, str) or not 1 <= len(v.encode()) <= 72 for v in values):return reject()
        try:
            first = bcrypt.checkpw(values[0].encode(), user.security_answer_1.encode())
            second = bcrypt.checkpw(values[1].encode(), user.security_answer_2.encode())
        except (ValueError, TypeError):return reject()
        if not (first and second):return reject()
        token = signer.dumps(dict(user_id=user.id, version=version(user)))
        response = jsonify(message='Success', resetAuthorization=token)
        response.headers['Cache-Control'] = 'no-store'
        return response

    def update_password():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):return reject()
        token = payload.get('resetAuthorization')
        if not isinstance(token, str) or len(token) > 2048:return reject()
        try:
            grant = signer.loads(token, max_age=300)
        except BadData:return reject()
        user = account(payload)
        if (user is None or not isinstance(grant, dict) or grant.get('user_id') != user.id
                or not hmac.compare_digest(str(grant.get('version', '')), version(user))):return reject()
        password = payload.get('newPW')
        if not isinstance(password, str) or not 8 <= len(password.encode()) <= 72:
            return jsonify(message='Use a password between 8 and 72 bytes long.'), 400
        previous = user.password
        replacement = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        # Atomic compare-and-update: concurrent reuse can only succeed once.
        count = db.session.query(User).filter(User.id == user.id, User.password == previous).update(
            {User.password: replacement}, synchronize_session=False)
        if count != 1:
            db.session.rollback()
            return reject()
        db.session.commit()
        return jsonify(id=user.id)

    app.view_functions['api.validate_answers'] = verify_answers
    app.view_functions['api.update_pw'] = update_password

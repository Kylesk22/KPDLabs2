"""Provision an internal lab record in the caller's database transaction.

Requires host authentication/recovery blocking for role ADWInternal before use.
No login cookies, notifications, or placeholder cases are created.
"""
import hashlib
import re
import secrets
import bcrypt
from sqlalchemy import select
from .lab_accounts import lab_accounts

def provision_lab(connection, users, *, lab_id, practice, address, auth_guard_enabled=False):
    if not auth_guard_enabled:
        raise ValueError('Internal account authentication guard must be installed')
    if not isinstance(lab_id, str) or not re.fullmatch('[A-Za-z0-9_-]{1,80}', lab_id):
        raise ValueError('Verified lab ID required')
    if not isinstance(practice, str) or not 1 <= len(practice.strip()) <= 100:
        raise ValueError('Lab name required')
    if not isinstance(address, str) or not address.strip():
        raise ValueError('Lab address required')
    if connection.dialect.name == 'postgresql':
        from sqlalchemy import text
        lock_id = int.from_bytes(hashlib.sha256(('adw-lab:' + lab_id).encode()).digest()[:8], 'big', signed=True)
        connection.execute(text('SELECT pg_advisory_xact_lock(:key)'), dict(key=lock_id))
    existing = connection.execute(select(lab_accounts.c.user_id).where(lab_accounts.c.lab_id == lab_id)).scalar_one_or_none()
    if existing is not None:
        return existing
    suffix = hashlib.sha256(lab_id.encode()).hexdigest()[:32]

    def inaccessible_hash():
        return bcrypt.hashpw(secrets.token_bytes(32), bcrypt.gensalt()).decode()
    record = dict(role='ADWInternal', email='adw-' + suffix + '@internal.invalid', password=inaccessible_hash(), address=address, fname='ADW', lname='Lab', practice=practice.strip(), license_number='ADW-' + suffix, pricing_package='ADW', security_question_1='Internal account', security_question_2='Internal account', security_answer_1=inaccessible_hash(), security_answer_2=inaccessible_hash())
    user_id = connection.execute(users.insert().values(**record)).inserted_primary_key[0]
    connection.execute(lab_accounts.insert().values(lab_id=lab_id, user_id=user_id))
    return user_id

"""Local-staged guest upload session after email proof and lab resolution.

Resolver is trusted server-side: email verification never silently approves a
lab or merges businesses. Session grants uploads only, no account/file history.
Future HTTP layer must use a secure HttpOnly cookie, origin checks and limits.
"""
import hashlib
import re
import secrets
from sqlalchemy import MetaData, Table, Column, String, BigInteger, select
metadata = MetaData()
sessions = Table('adw_guest_upload_session', metadata, Column('digest', String(64), primary_key=True), Column('binding', String(64), nullable=False), Column('email', String(254), nullable=False), Column('lab_id', String(80), nullable=False), Column('expires', BigInteger, nullable=False))

def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()

def upload_principal(profile):
    """Translate trusted enrollment permission into the existing intake boundary.

    Intake's legacy adw_approved field authorizes transport only. Never persist
    this translated flag as business approval or use it for production release.
    New lab enrollment may grant upload_authorized while lab_review is pending.
    """
    if not isinstance(profile, dict) or not profile.get('lab_id') or profile.get('blocked') is True or (not (profile.get('upload_authorized') is True or profile.get('adw_approved') is True)):
        raise PermissionError('Lab access unavailable')
    return dict(profile, adw_approved=True)

class GuestUploadSession:

    def __init__(self, engine, verification, resolver, intake, *, enrollment=None):
        (self.engine, self.verification, self.resolver, self.intake) = (engine, verification, resolver, intake)
        self.enrollment = enrollment

    def begin(self, proof, binding, *, now, registration=None):
        if self.enrollment is not None:
            from .guest_enrollment import validate_details
            identity = self.verification.inspect(proof, binding, now=now)
            existing = self.resolver(identity['email'])
            if not existing:
                registration = validate_details(registration)
        identity = self.verification.finish(proof, binding, now=now)
        if self.enrollment is not None:
            self.enrollment.enroll_verified(identity['email'], registration, now=now)
        principal = upload_principal(self.resolver(identity['email']))
        token = secrets.token_urlsafe(32)
        with self.engine.begin() as db:
            db.execute(sessions.insert().values(digest=digest(token), binding=digest(binding), email=identity['email'], lab_id=principal['lab_id'], expires=int(now) + 1800))
        return token

    def principal(self, token, binding, *, now):
        if any((not isinstance(value, str) or not re.fullmatch('[A-Za-z0-9_-]{43}', value) for value in [token, binding])):
            raise PermissionError('Verify your email again')
        with self.engine.connect() as db:
            row = db.execute(select(sessions).where(sessions.c.digest == digest(token), sessions.c.binding == digest(binding), sessions.c.expires > int(now))).mappings().one_or_none()
        if row is None:
            raise PermissionError('Verify your email again')
        principal = upload_principal(self.resolver(row['email']))
        if principal.get('lab_id') != row['lab_id']:
            raise PermissionError('Lab access unavailable')
        return principal

    def checkout_proof(self, token, binding, receipt, *, checkout, shop, now):
        principal = self.principal(token, binding, now=now)
        return checkout.issue(principal=principal, shop=shop, receipt=receipt, now=now)

    def submit(self, token, binding, reference, files, request_key, *, now):
        principal = self.principal(token, binding, now=now)
        return self.intake.submit(principal, reference, files, request_key)

    def submit_streams(self, token, binding, reference, files, request_key, *, clock):
        self.principal(token, binding, now=clock())
        if not isinstance(request_key, str) or not re.fullmatch('[A-Za-z0-9_-]{16,80}', request_key):
            raise ValueError('Invalid request key')
        return self.intake.submit_verified(reference, files, authorize=lambda manifest: (self.principal(token, binding, now=clock()), request_key))

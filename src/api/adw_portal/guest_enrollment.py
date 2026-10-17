"""Local staged lab enrollment. Call enroll only AFTER server email verification.

Exact verified email maps to one lab; company names/domains never merge records.
No KPD login, manufacturing approval, or customer file-history access is created.
"""
import hashlib
import secrets
from sqlalchemy import MetaData, Table, Column, String, Boolean, BigInteger, select, text
metadata = MetaData()
labs = Table('adw_guest_lab_profile', metadata, Column('lab_id', String(80), primary_key=True), Column('verified_email', String(254), nullable=False, unique=True), Column('practice', String(160), nullable=False), Column('contact_name', String(120), nullable=False), Column('phone', String(40), nullable=False), Column('lab_review', String(20), nullable=False), Column('blocked', Boolean, nullable=False), Column('created', BigInteger, nullable=False))

def email_key(value):
    if not isinstance(value, str) or value.count('@') != 1 or len(value) > 254:
        raise ValueError('Verified email required')
    (local, domain) = value.rsplit('@', 1)
    if not local or '.' not in domain or any((c.isspace() for c in value)):
        raise ValueError('Verified email required')
    return local + '@' + domain.lower()

def validate_details(details):
    clean = {}
    for (field, limit) in [('practice', 100), ('contact_name', 120), ('phone', 40)]:
        value = details.get(field) if isinstance(details, dict) else None
        if not isinstance(value, str) or not value.strip() or len(value.strip()) > limit or any((ord(c) < 32 for c in value)):
            raise ValueError('Complete your lab name, contact name, and phone number')
        clean[field] = value.strip()
    return clean

class GuestEnrollment:

    def __init__(self, engine):
        self.engine = engine

    def resolve(self, email):
        with self.engine.connect() as db:
            row = db.execute(select(labs).where(labs.c.verified_email == email_key(email))).mappings().one_or_none()
        if row is None:
            return {}
        return dict(row, upload_authorized=not row['blocked'], adw_approved=False)

    def enroll_verified(self, email, details, *, now):
        email = email_key(email)
        with self.engine.begin() as db:
            if self.engine.dialect.name == 'postgresql':
                key = int.from_bytes(hashlib.sha256(email.encode()).digest()[:8], 'big', signed=True)
                db.execute(text('SELECT pg_advisory_xact_lock(:key)'), dict(key=key))
            existing = db.execute(select(labs).where(labs.c.verified_email == email)).mappings().one_or_none()
            if existing:
                if existing['blocked']:
                    raise PermissionError('Lab access unavailable')
                return existing['lab_id']
            clean = validate_details(details)
            lab_id = 'ADW-LAB-' + secrets.token_hex(16)
            db.execute(labs.insert().values(lab_id=lab_id, verified_email=email, lab_review='pending', blocked=False, created=int(now), **clean))
            return lab_id

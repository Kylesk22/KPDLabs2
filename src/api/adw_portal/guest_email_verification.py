"""Pre-checkout email proof; local staging, not a lab approval or login.

The future HTTP layer must add origin checks and per-IP abuse limits. Tokens go
only to the mail transport; browser binding stays with the requesting browser.
"""
import hashlib
import re
import secrets
from sqlalchemy import MetaData, Table, Column, String, BigInteger, select, update, func
metadata = MetaData()
challenges = Table('adw_guest_email_challenge', metadata, Column('digest', String(64), primary_key=True), Column('binding', String(64), nullable=False), Column('email', String(254), nullable=False), Column('created', BigInteger, nullable=False), Column('expires', BigInteger, nullable=False), Column('used', BigInteger, nullable=True))

def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()

class EmailVerification:

    def __init__(self, engine, mail, *, allow_live_delivery=False):
        from .guest_links import LocalMailCapture
        from .transactional_mail import ResendVerificationMail
        if isinstance(mail, LocalMailCapture):
            self.verification_url = 'https://adw.invalid/verify'
        elif allow_live_delivery is True and isinstance(mail, ResendVerificationMail):
            self.verification_url = mail.verification_url
        else:
            raise ValueError('Guest live email delivery requires explicit reviewed configuration')
        (self.engine, self.mail) = (engine, mail)

    def start(self, email, browser_binding, *, now):
        if not isinstance(email, str) or len(email) > 254 or (not re.fullmatch('[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]+', email)):
            raise ValueError('Valid email required')
        if not isinstance(browser_binding, str) or not re.fullmatch('[A-Za-z0-9_-]{43}', browser_binding):
            raise ValueError('Secure browser binding required')
        (local, domain) = email.rsplit('@', 1)
        email = local + '@' + domain.lower()
        token = secrets.token_urlsafe(32)
        with self.engine.begin() as db:
            if self.engine.dialect.name == 'postgresql':
                from sqlalchemy import text
                key = int.from_bytes(hashlib.sha256(email.lower().encode()).digest()[:8], 'big', signed=True)
                db.execute(text('SELECT pg_advisory_xact_lock(:key)'), dict(key=key))
            count = db.execute(select(func.count()).select_from(challenges).where(func.lower(challenges.c.email) == email.lower(), challenges.c.created > int(now) - 3600)).scalar()
            if count >= 5:
                raise ValueError('Please wait before requesting another verification email')
            db.execute(challenges.insert().values(digest=digest(token), binding=digest(browser_binding), email=email, created=int(now), expires=int(now) + 900))
        try:
            self.mail.send_upload_link(email, self.verification_url + '#' + token)
        except Exception:
            with self.engine.begin() as db:
                db.execute(update(challenges).where(challenges.c.digest == digest(token)).values(used=int(now)))
            raise ValueError('Unable to send verification email. Please try again.') from None
        return dict(message='Check your email to continue')

    def finish(self, token, browser_binding, *, now):
        if any((not isinstance(v, str) or not re.fullmatch('[A-Za-z0-9_-]{43}', v) for v in [token, browser_binding])):
            raise PermissionError('Verification unavailable')
        with self.engine.begin() as db:
            matched = (challenges.c.digest == digest(token), challenges.c.binding == digest(browser_binding), challenges.c.expires > int(now), challenges.c.used.is_(None))
            if db.execute(update(challenges).where(*matched).values(used=int(now))).rowcount != 1:
                raise PermissionError('Verification expired or already used')
            email = db.execute(select(challenges.c.email).where(challenges.c.digest == digest(token))).scalar_one()
            return dict(email=email, email_verified=True)

    def inspect(self, token, browser_binding, *, now):
        """Validate proof without consuming it; only used for enrollment preparation."""
        if any((not isinstance(v, str) or not re.fullmatch('[A-Za-z0-9_-]{43}', v) for v in [token, browser_binding])):
            raise PermissionError('Verification unavailable')
        with self.engine.connect() as db:
            email = db.execute(select(challenges.c.email).where(challenges.c.digest == digest(token), challenges.c.binding == digest(browser_binding), challenges.c.expires > int(now), challenges.c.used.is_(None))).scalar_one_or_none()
        if email is None:
            raise PermissionError('Verification expired or already used')
        return dict(email=email, email_verified=True)

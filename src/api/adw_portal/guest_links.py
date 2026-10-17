"""Single-use, order-scoped guest proof. Not registered in production.

Only a trusted server may issue after verifying the order recipient. Redemption
is POST-only at the future transport layer; email scanner GET must not consume.
Proof grants no history/download rights. Raw token must never be logged/stored.
"""
import hashlib
import re
import secrets
from sqlalchemy import MetaData, Table, Column, String, BigInteger, select, update
metadata = MetaData()
proofs = Table('adw_guest_upload_proof', metadata, Column('digest', String(64), primary_key=True), Column('shop', String(255), nullable=False), Column('order_id', String(32), nullable=False), Column('expires', BigInteger, nullable=False), Column('consumed', BigInteger, nullable=True))

class GuestLinks:

    def __init__(self, engine):
        self.engine = engine

    def issue(self, shop, order_id, *, now):
        if not isinstance(shop, str) or not re.fullmatch('[a-z0-9-]+\\.myshopify\\.com', shop):
            raise ValueError('Shop required')
        if not isinstance(order_id, str) or not re.fullmatch('[1-9][0-9]{0,31}', order_id):
            raise ValueError('Verified order required')
        token = secrets.token_urlsafe(32)
        with self.engine.begin() as connection:
            connection.execute(proofs.insert().values(digest=hashlib.sha256(token.encode()).hexdigest(), shop=shop, order_id=order_id, expires=int(now) + 900))
        return token

    def redeem(self, token, *, shop, now):
        if not isinstance(token, str) or not re.fullmatch('[A-Za-z0-9_-]{43}', token):
            raise PermissionError('Upload link unavailable')
        digest = hashlib.sha256(token.encode()).hexdigest()
        with self.engine.begin() as connection:
            statement = update(proofs).where(proofs.c.digest == digest, proofs.c.shop == shop, proofs.c.expires > int(now), proofs.c.consumed.is_(None)).values(consumed=int(now))
            if connection.execute(statement).rowcount != 1:
                raise PermissionError('Upload link expired or already used')
            row = connection.execute(select(proofs.c.order_id).where(proofs.c.digest == digest)).one()
            return dict(shop=shop, order_id=row.order_id, purpose='upload-only')

class LocalMailCapture:
    """In-memory test mailbox; no network, disk, or console output."""

    def __init__(self, *, environment):
        if environment != 'local-test':
            raise ValueError('Capture mail is development-only')
        self.messages = []

    def send_upload_link(self, recipient, url):
        self.messages.append(dict(sender='ADW <no-reply@adw.invalid>', recipient=recipient, subject='Your American Dental Works upload link', url=url))

def require_live_email(*, sender, verified, mode):
    if mode != 'live' or verified is not True or (not isinstance(sender, str)) or ('@' not in sender) or sender.lower().endswith(('.invalid', '.test', '.example')):
        raise ValueError('Verified live email delivery required before enabling guest uploads')

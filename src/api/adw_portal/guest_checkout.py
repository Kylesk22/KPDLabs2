"""Receipt-scoped checkout proof. Local staged; not customer-account linking.

The token may travel as a private Shopify line property. It grants no file read
access. OrderClaims remains mandatory to prevent use on two paid orders.
"""
import hashlib
import secrets
import re
from sqlalchemy import MetaData, Table, Column, String, BigInteger, select
metadata = MetaData()
proofs = Table('adw_guest_checkout_proof', metadata, Column('digest', String(64), primary_key=True), Column('shop', String(255), nullable=False), Column('receipt', String(36), nullable=False), Column('lab_id', String(80), nullable=False), Column('reference', String(40), nullable=False), Column('expires', BigInteger, nullable=False))

class GuestCheckout:

    def __init__(self, engine, receipts):
        (self.engine, self.receipts) = (engine, receipts)

    def issue(self, *, principal, shop, receipt, now):
        if not principal or principal.get('blocked') is True or (not (principal.get('upload_authorized') is True or principal.get('adw_approved') is True)):
            raise PermissionError('Verified upload session required')
        if not re.fullmatch('[a-z0-9-]+\\.myshopify\\.com', shop):
            raise ValueError('Invalid shop')
        row = self.receipts.get(receipt)
        if not row or row.get('lab_id') != principal.get('lab_id') or row.get('status') != 'awaiting_file_review':
            raise PermissionError('Receipt unavailable')
        token = secrets.token_urlsafe(32)
        with self.engine.begin() as db:
            db.execute(proofs.insert().values(digest=hashlib.sha256(token.encode()).hexdigest(), shop=shop, receipt=receipt, lab_id=row['lab_id'], reference=row['reference'], expires=int(now) + 86400))
        return token

    def resolve(self, *, shop, receipt, reference, token, now, order_id=None, line_id=None):
        if not isinstance(token, str) or not re.fullmatch('[A-Za-z0-9_-]{43}', token):
            raise PermissionError('Checkout proof unavailable')
        with self.engine.connect() as db:
            row = db.execute(select(proofs).where(proofs.c.digest == hashlib.sha256(token.encode()).hexdigest(), proofs.c.shop == shop, proofs.c.receipt == receipt, proofs.c.reference == reference)).mappings().one_or_none()
            if row is not None and row['expires'] <= int(now):
                if order_id is None or line_id is None:
                    raise PermissionError('Checkout proof unavailable')
                from .order_claims import claims
                claimed = db.execute(select(claims.c.receipt).where(claims.c.receipt == receipt, claims.c.shop == shop, claims.c.order_id == order_id, claims.c.line_id == line_id)).scalar_one_or_none()
                if claimed is None:
                    raise PermissionError('Checkout proof unavailable')
        if row is None:
            raise PermissionError('Checkout proof unavailable')
        return dict(lab_id=row['lab_id'])

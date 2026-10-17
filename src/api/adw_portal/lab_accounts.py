"""Server-owned lab mapping. No matching by unverified email or company name."""
from sqlalchemy import Table, Column, String, Integer, select
from .order_claims import metadata
lab_accounts = Table('adw_kpd_lab_account', metadata, Column('lab_id', String(80), primary_key=True), Column('user_id', Integer, nullable=False, unique=True))

def resolve_account(connection, lab_id):
    account = connection.execute(select(lab_accounts.c.user_id).where(lab_accounts.c.lab_id == lab_id)).scalar_one_or_none()
    if account is None:
        raise ValueError('Lab account must be provisioned before case handoff')
    return account

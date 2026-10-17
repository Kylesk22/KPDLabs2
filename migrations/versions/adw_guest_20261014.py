"""Additive guest schema, staged only; never removes existing KPD data."""
from alembic import op
import sqlalchemy as sa
revision = 'adw_guest_20261014'
down_revision = 'adw_orders_20261013'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('adw_guest_email_challenge',
        sa.Column('digest', sa.String(length=64), primary_key=True, nullable=False),
        sa.Column('binding', sa.String(length=64), primary_key=False, nullable=False),
        sa.Column('email', sa.String(length=254), primary_key=False, nullable=False),
        sa.Column('created', sa.BigInteger(), primary_key=False, nullable=False),
        sa.Column('expires', sa.BigInteger(), primary_key=False, nullable=False),
        sa.Column('used', sa.BigInteger(), primary_key=False, nullable=True),
    )
    op.create_table('adw_guest_upload_session',
        sa.Column('digest', sa.String(length=64), primary_key=True, nullable=False),
        sa.Column('binding', sa.String(length=64), primary_key=False, nullable=False),
        sa.Column('email', sa.String(length=254), primary_key=False, nullable=False),
        sa.Column('lab_id', sa.String(length=80), primary_key=False, nullable=False),
        sa.Column('expires', sa.BigInteger(), primary_key=False, nullable=False),
    )
    op.create_table('adw_guest_lab_profile',
        sa.Column('lab_id', sa.String(length=80), primary_key=True, nullable=False),
        sa.Column('verified_email', sa.String(length=254), primary_key=False, nullable=False, unique=True),
        sa.Column('practice', sa.String(length=160), primary_key=False, nullable=False),
        sa.Column('contact_name', sa.String(length=120), primary_key=False, nullable=False),
        sa.Column('phone', sa.String(length=40), primary_key=False, nullable=False),
        sa.Column('lab_review', sa.String(length=20), primary_key=False, nullable=False),
        sa.Column('blocked', sa.Boolean(), primary_key=False, nullable=False),
        sa.Column('created', sa.BigInteger(), primary_key=False, nullable=False),
    )
    op.create_table('adw_guest_lab_review_audit',
        sa.Column('id', sa.String(length=64), primary_key=True, nullable=False),
        sa.Column('lab_id', sa.String(length=80), primary_key=False, nullable=False),
        sa.Column('staff_id', sa.String(length=80), primary_key=False, nullable=False),
        sa.Column('previous', sa.String(length=20), primary_key=False, nullable=False),
        sa.Column('decision', sa.String(length=20), primary_key=False, nullable=False),
        sa.Column('reason', sa.String(length=500), primary_key=False, nullable=False),
        sa.Column('created', sa.BigInteger(), primary_key=False, nullable=False),
    )
    op.create_table('adw_guest_checkout_proof',
        sa.Column('digest', sa.String(length=64), primary_key=True, nullable=False),
        sa.Column('shop', sa.String(length=255), primary_key=False, nullable=False),
        sa.Column('receipt', sa.String(length=36), primary_key=False, nullable=False),
        sa.Column('lab_id', sa.String(length=80), primary_key=False, nullable=False),
        sa.Column('reference', sa.String(length=40), primary_key=False, nullable=False),
        sa.Column('expires', sa.BigInteger(), primary_key=False, nullable=False),
    )

def downgrade():
    raise RuntimeError('Retain guest profiles and audit history. Disable guest processing to roll back code.')

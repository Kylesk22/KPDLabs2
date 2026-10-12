"""Add isolated ADW intake tables. Verify live revision before applying.

Revision ID: adw_intake_20261012
Revises: c88f16c0eba3
"""
from alembic import op
import sqlalchemy as sa

revision='adw_intake_20261012'
down_revision='c88f16c0eba3'
branch_labels=None
depends_on=None


def upgrade():
    op.create_table('adw_intake_receipt',
        sa.Column('receipt',sa.String(36),primary_key=True),
        sa.Column('lab_id',sa.String(80),nullable=False),
        sa.Column('request_key',sa.String(80),nullable=False),
        sa.Column('fingerprint',sa.String(64),nullable=False),
        sa.Column('body',sa.JSON(),nullable=False),
        sa.UniqueConstraint('lab_id','request_key',name='uq_adw_intake_lab_request'))
    op.create_table('adw_lab_membership',
        sa.Column('shop',sa.String(255),primary_key=True),
        sa.Column('customer',sa.String(20),primary_key=True),
        sa.Column('lab',sa.String(80),nullable=False),
        sa.Column('active',sa.Boolean(),nullable=False))
    op.create_table('adw_lab_membership_audit',
        sa.Column('id',sa.Integer(),primary_key=True),
        sa.Column('shop',sa.String(255),nullable=False),
        sa.Column('customer',sa.String(20),nullable=False),
        sa.Column('lab',sa.String(80),nullable=False),
        sa.Column('action',sa.String(20),nullable=False),
        sa.Column('actor',sa.String(120),nullable=False),
        sa.Column('created_at',sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False))
    op.create_table('adw_object_cleanup',
        sa.Column('bucket',sa.String(255),primary_key=True),
        sa.Column('object_key',sa.String(255),primary_key=True),
        sa.Column('status',sa.String(40),nullable=False),
        sa.Column('created_at',sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False))


def downgrade():
    raise RuntimeError('ADW intake tables retain accepted file receipts. Disable ADW in configuration to roll back code; destructive schema rollback requires separate review.')

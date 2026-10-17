"""Staged migration; not packaged or approved for production rollout yet."""
from alembic import op
import sqlalchemy as sa

revision = 'adw_orders_20261013'
down_revision = 'adw_intake_20261012'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('adw_order_destination',
        sa.Column('shop', sa.String(255), primary_key=True),
        sa.Column('order_id', sa.String(32), primary_key=True),
        sa.Column('address', sa.JSON(), nullable=False))
    op.create_table('adw_kpd_lab_account',
        sa.Column('lab_id', sa.String(80), primary_key=True),
        sa.Column('user_id', sa.Integer(), nullable=False, unique=True))
    op.create_table('adw_verified_order',
        sa.Column('shop', sa.String(255), primary_key=True),
        sa.Column('order_id', sa.String(32), primary_key=True),
        sa.Column('fingerprint', sa.String(64), nullable=False),
        sa.Column('plan', sa.JSON(), nullable=False))
    op.create_table('adw_order_receipt_claim',
        sa.Column('receipt', sa.String(36), primary_key=True),
        sa.Column('shop', sa.String(255), nullable=False),
        sa.Column('order_id', sa.String(32), nullable=False),
        sa.Column('line_id', sa.String(32), nullable=False),
        sa.UniqueConstraint('shop', 'order_id', 'line_id', name='uq_adw_order_line'))
    op.create_table('adw_kpd_case_link',
        sa.Column('case_id', sa.Integer(), primary_key=True),
        sa.Column('shop', sa.String(255), nullable=False),
        sa.Column('order_id', sa.String(32), nullable=False),
        sa.Column('line_id', sa.String(32), nullable=False),
        sa.Column('lab_id', sa.String(80), nullable=False),
        sa.Column('receipt', sa.String(36), nullable=False, unique=True),
        sa.Column('reviewed_by', sa.String(120), nullable=False),
        sa.UniqueConstraint('shop', 'order_id', 'line_id', name='uq_adw_kpd_order_line'))


def downgrade():
    raise RuntimeError('Retain order and receipt reservations. Disable order processing to roll back code.')

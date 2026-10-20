"""Add label reservations without changing existing cases or buying labels."""
from alembic import op
import sqlalchemy as sa

revision='adw_labels_20261020'
down_revision='adw_direct_20261019'
branch_labels=None
depends_on=None


def upgrade():
    op.create_table('adw_shipping_label',
        sa.Column('id',sa.String(40),primary_key=True),
        sa.Column('staff_id',sa.String(80),nullable=False),
        sa.Column('state',sa.String(24),nullable=False),
        sa.Column('snapshot',sa.JSON(),nullable=False),
        sa.Column('rate_id',sa.String(80),nullable=False),
        sa.Column('amount_cents',sa.Integer(),nullable=False),
        sa.Column('expires',sa.BigInteger(),nullable=False),
        sa.Column('transaction_id',sa.String(80),unique=True),
        sa.Column('tracking_number',sa.String(120)),
        sa.Column('label_url',sa.String(2048)),
        sa.Column('created',sa.BigInteger(),nullable=False))
    op.create_table('adw_shipping_case_claim',
        sa.Column('case_id',sa.Integer(),primary_key=True),
        sa.Column('label_id',sa.String(40),nullable=False))
    op.create_table('adw_shipping_tracking_job',
        sa.Column('label_id',sa.String(40),primary_key=True),
        sa.Column('payload',sa.JSON(),nullable=False),
        sa.Column('state',sa.String(24),nullable=False))


def downgrade():
    raise RuntimeError('Reconcile label purchases and tracking jobs before removing their audit records')

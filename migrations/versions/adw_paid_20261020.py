"""Add durable paid notification queue without changing cases or receipts."""
from alembic import op
import sqlalchemy as sa

revision = 'adw_paid_20261020'
down_revision = 'adw_labels_20261020'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('adw_paid_notification',
        sa.Column('shop', sa.String(255), primary_key=True),
        sa.Column('delivery', sa.String(128), primary_key=True),
        sa.Column('digest', sa.String(64), nullable=False))
    op.create_table('adw_reconciliation_job',
        sa.Column('shop', sa.String(255), primary_key=True),
        sa.Column('order_id', sa.String(32), primary_key=True),
        sa.Column('status', sa.String(40), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False))


def downgrade():
    raise RuntimeError('Review pending notifications before removing the payment audit queue')

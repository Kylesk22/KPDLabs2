"""Add KPD outbound shipment history and purchase reservations; no case changes."""
from alembic import op
import sqlalchemy as sa

revision = 'kpd_operations_20261118'
down_revision = 'adw_paid_20261020'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('kpd_shipment',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('group_id', sa.String(36)),
        sa.Column('box_number', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('box_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('state', sa.String(24), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('customer_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('snapshot', sa.JSON(), nullable=False),
        sa.Column('rates', sa.JSON(), nullable=False),
        sa.Column('selected_rate', sa.JSON()),
        sa.Column('transaction_id', sa.String(80)),
        sa.Column('tracking_number', sa.String(120)),
        sa.Column('label_url', sa.Text()),
        sa.Column('shipped_at', sa.DateTime()))
    op.create_index('ix_kpd_shipment_group_id', 'kpd_shipment', ['group_id'])
    op.create_table('kpd_shipment_case',
        sa.Column('case_id', sa.Integer(), sa.ForeignKey('case.id'), primary_key=True),
        sa.Column('shipment_id', sa.String(36), sa.ForeignKey('kpd_shipment.id'), nullable=False))
    op.create_index('ix_kpd_shipment_case_shipment_id', 'kpd_shipment_case', ['shipment_id'])


def downgrade():
    # Financial history must not disappear as a side effect of an application rollback.
    raise RuntimeError('Retain shipment purchases and reservations when rolling back application code.')

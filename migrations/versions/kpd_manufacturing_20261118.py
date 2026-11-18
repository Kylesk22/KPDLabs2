"""Track confirmed manufacturing case labels; preserve existing case records."""
from alembic import op
import sqlalchemy as sa

revision = 'kpd_manufacturing_20261118'
down_revision = 'kpd_operations_20261118'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('kpd_manufacturing_label',
        sa.Column('case_id', sa.Integer(), sa.ForeignKey('case.id'), primary_key=True),
        sa.Column('fingerprint', sa.String(64), nullable=False),
        sa.Column('printed_at', sa.DateTime(), nullable=False),
        sa.Column('printed_by', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('batch_id', sa.String(36), nullable=False))


def downgrade():
    raise RuntimeError('Retain confirmed label receipts when rolling back application code.')

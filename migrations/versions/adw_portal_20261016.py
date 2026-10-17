"""Additive shared portal quotas; staged, not applied to production."""
from alembic import op
import sqlalchemy as sa
revision='adw_portal_20261016'
down_revision='adw_guest_20261014'
branch_labels=None
depends_on=None

def upgrade():
    op.create_table('adw_portal_rate_bucket',
        sa.Column('key',sa.String(64),primary_key=True),
        sa.Column('window',sa.BigInteger(),primary_key=True),
        sa.Column('count',sa.BigInteger(),nullable=False))

def downgrade():
    raise RuntimeError('Disable portal routing before changing shared quota storage')

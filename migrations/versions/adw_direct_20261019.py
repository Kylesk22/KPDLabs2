"""Additive direct-upload reservations. No existing case table changes."""
from alembic import op
import sqlalchemy as sa
revision='adw_direct_20261019'
down_revision='adw_portal_20261016'
branch_labels=None
depends_on=None

def upgrade():
    op.create_table('adw_direct_upload_lock',
        sa.Column('lab_id',sa.String(80),primary_key=True),
        sa.Column('version',sa.BigInteger(),nullable=False))
    op.create_table('adw_direct_upload_reservation',
        sa.Column('id',sa.String(36),primary_key=True),
        sa.Column('lab_id',sa.String(80),nullable=False),
        sa.Column('request_key',sa.String(80),nullable=False),
        sa.Column('fingerprint',sa.String(64),nullable=False),
        sa.Column('reference',sa.String(40),nullable=False),
        sa.Column('manifest',sa.Text(),nullable=False),
        sa.Column('bytes',sa.BigInteger(),nullable=False),
        sa.Column('state',sa.String(24),nullable=False),
        sa.Column('created',sa.BigInteger(),nullable=False),
        sa.UniqueConstraint('lab_id','request_key'))
    op.create_index('ix_adw_direct_upload_reservation_lab_id','adw_direct_upload_reservation',['lab_id'])

def downgrade():
    raise RuntimeError('Disable direct uploads and reconcile pending files before removing reservations')

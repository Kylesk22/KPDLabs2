"""empty message

Revision ID: a764a0eb7d24
Revises: 8f6e95a56450
Create Date: 2024-05-07 13:08:30.645304

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a764a0eb7d24'
down_revision = '8f6e95a56450'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('pricing_package', sa.String(length=50), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('pricing_package')

    # ### end Alembic commands ###
"""empty message

Revision ID: e0e8dd2ced60
Revises: 67339ee45d8a
Create Date: 2024-05-29 09:08:19.833545

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e0e8dd2ced60'
down_revision = '67339ee45d8a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('case', schema=None) as batch_op:
        batch_op.alter_column('update_date',
               existing_type=postgresql.BYTEA(),
               type_=sa.String(length=100),
               existing_nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('case', schema=None) as batch_op:
        batch_op.alter_column('update_date',
               existing_type=sa.String(length=100),
               type_=postgresql.BYTEA(),
               existing_nullable=True)

    # ### end Alembic commands ###

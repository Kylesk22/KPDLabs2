"""empty message

Revision ID: 650ca83af7ef
Revises: f3546aaa07a9
Create Date: 2024-07-02 10:26:19.034782

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '650ca83af7ef'
down_revision = 'f3546aaa07a9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.alter_column('security_answer_1',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.String(length=100),
               existing_nullable=False)
        batch_op.alter_column('security_answer_2',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.String(length=100),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.alter_column('security_answer_2',
               existing_type=sa.String(length=100),
               type_=sa.VARCHAR(length=50),
               existing_nullable=False)
        batch_op.alter_column('security_answer_1',
               existing_type=sa.String(length=100),
               type_=sa.VARCHAR(length=50),
               existing_nullable=False)

    # ### end Alembic commands ###
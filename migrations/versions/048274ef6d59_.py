"""empty message

Revision ID: 048274ef6d59
Revises: 6b81a7b9f424
Create Date: 2024-04-17 13:08:25.089662

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '048274ef6d59'
down_revision = '6b81a7b9f424'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('security_question_1', sa.String(length=50), nullable=False))
        batch_op.add_column(sa.Column('security_answer_1', sa.String(length=50), nullable=False))
        batch_op.add_column(sa.Column('security_question_2', sa.String(length=50), nullable=False))
        batch_op.add_column(sa.Column('security_answer_2', sa.String(length=50), nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('security_answer_2')
        batch_op.drop_column('security_question_2')
        batch_op.drop_column('security_answer_1')
        batch_op.drop_column('security_question_1')

    # ### end Alembic commands ###
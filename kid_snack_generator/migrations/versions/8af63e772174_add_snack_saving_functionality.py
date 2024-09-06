"""Add snack saving functionality

Revision ID: 8af63e772174
Revises: 4a5f32c767ec
Create Date: 2024-09-06 16:44:16.355222

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8af63e772174'
down_revision = '4a5f32c767ec'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('child', schema=None) as batch_op:
        batch_op.drop_column('dummy_column')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('child', schema=None) as batch_op:
        batch_op.add_column(sa.Column('dummy_column', sa.VARCHAR(length=100), nullable=True))

    # ### end Alembic commands ###

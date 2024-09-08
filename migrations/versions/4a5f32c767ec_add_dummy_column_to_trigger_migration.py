from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '4a5f32c767ec'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create the 'child' table
    op.create_table(
        'child',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('exclusions', sa.String(length=500), nullable=True),
        sa.Column('dummy_column', sa.String(length=100), nullable=True)
    )

    # Create the 'child_snack' table
    op.create_table(
        'child_snack',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('child_id', sa.Integer(), sa.ForeignKey('child.id'), nullable=False),
        sa.Column('snack', sa.String(length=500), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True)
    )

def downgrade():
    # Drop tables on downgrade
    op.drop_table('child_snack')
    op.drop_table('child')
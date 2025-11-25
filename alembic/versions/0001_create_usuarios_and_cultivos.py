"""create usuarios and cultivos, drop legacy tables

Revision ID: 0001_create_usuarios_and_cultivos
Revises: 
Create Date: 2025-11-24
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_create_usuarios_and_cultivos'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Drop legacy tables if they exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    legacy_tables = ['item_category', 'items', 'categories', 'users', 'profiles']
    for t in legacy_tables:
        if t in inspector.get_table_names():
            op.drop_table(t)

    # Create usuarios
    op.create_table(
        'usuarios',
        sa.Column('id', sa.Integer, primary_key=True, nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='user'),
    )

    # Create cultivos
    op.create_table(
        'cultivos',
        sa.Column('id', sa.Integer, primary_key=True, nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('tipo', sa.String(length=100), nullable=False),
        sa.Column('descripcion', sa.Text, nullable=True),
        sa.Column('usuario_id', sa.Integer, sa.ForeignKey('usuarios.id', ondelete='CASCADE'), nullable=False),
    )


def downgrade():
    op.drop_table('cultivos')
    op.drop_table('usuarios')

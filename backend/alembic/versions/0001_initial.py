"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_projects_id"), "projects", ["id"], unique=False)

    device_type_enum = sa.Enum("router", "switch", "pc", "server", "firewall", name="devicetype")

    op.create_table(
        "devices",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("device_type", device_type_enum, nullable=False),
        sa.Column("pos_x", sa.Float(), nullable=True),
        sa.Column("pos_y", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_devices_id"), "devices", ["id"], unique=False)

    op.create_table(
        "device_links",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("device_a_id", sa.Integer(), nullable=False),
        sa.Column("device_b_id", sa.Integer(), nullable=False),
        sa.Column("link_type", sa.String(length=50), nullable=True),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(["device_a_id"], ["devices.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["device_b_id"], ["devices.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_device_links_id"), "device_links", ["id"], unique=False)

    op.create_table(
        "address_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("device_name", sa.String(length=100), nullable=False),
        sa.Column("device_type", device_type_enum, nullable=False),
        sa.Column("interface", sa.String(length=100), nullable=False),
        sa.Column("ip_address", sa.String(length=50), nullable=True),
        sa.Column("subnet_mask", sa.String(length=50), nullable=True),
        sa.Column("gateway", sa.String(length=50), nullable=True),
        sa.Column("vlan", sa.Integer(), nullable=True),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_address_entries_id"), "address_entries", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_address_entries_id"), table_name="address_entries")
    op.drop_table("address_entries")
    op.drop_index(op.f("ix_device_links_id"), table_name="device_links")
    op.drop_table("device_links")
    op.drop_index(op.f("ix_devices_id"), table_name="devices")
    op.drop_table("devices")
    op.drop_index(op.f("ix_projects_id"), table_name="projects")
    op.drop_table("projects")
    sa.Enum(name="devicetype").drop(op.get_bind())
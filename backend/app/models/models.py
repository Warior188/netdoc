from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class DeviceType(str, enum.Enum):
    router = "router"
    switch = "switch"
    pc = "pc"
    server = "server"
    firewall = "firewall"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    devices = relationship("Device", back_populates="project", cascade="all, delete-orphan")
    address_entries = relationship("AddressEntry", back_populates="project", cascade="all, delete-orphan")
    links = relationship("DeviceLink", back_populates="project", cascade="all, delete-orphan")


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    device_type = Column(Enum(DeviceType), nullable=False)
    pos_x = Column(Float, default=50.0)
    pos_y = Column(Float, default=50.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="devices")
    links_as_a = relationship("DeviceLink", foreign_keys="DeviceLink.device_a_id", back_populates="device_a")
    links_as_b = relationship("DeviceLink", foreign_keys="DeviceLink.device_b_id", back_populates="device_b")


class DeviceLink(Base):
    __tablename__ = "device_links"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    device_a_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    device_b_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    link_type = Column(String(50), default="ethernet")
    description = Column(String(255), nullable=True)

    project = relationship("Project", back_populates="links")
    device_a = relationship("Device", foreign_keys=[device_a_id], back_populates="links_as_a")
    device_b = relationship("Device", foreign_keys=[device_b_id], back_populates="links_as_b")


class AddressEntry(Base):
    __tablename__ = "address_entries"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    device_name = Column(String(100), nullable=False)
    device_type = Column(Enum(DeviceType), nullable=False)
    interface = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=True)
    subnet_mask = Column(String(50), default="255.255.255.0")
    gateway = Column(String(50), nullable=True)
    vlan = Column(Integer, nullable=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="address_entries")
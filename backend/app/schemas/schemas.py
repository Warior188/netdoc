from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DeviceType(str, Enum):
    router = "router"
    switch = "switch"
    pc = "pc"
    server = "server"
    firewall = "firewall"


# ── Project ──────────────────────────────────────────────
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ProjectDetail(ProjectOut):
    devices: List["DeviceOut"] = []
    address_entries: List["AddressEntryOut"] = []
    links: List["DeviceLinkOut"] = []


# ── Device ───────────────────────────────────────────────
class DeviceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    device_type: DeviceType
    pos_x: float = 50.0
    pos_y: float = 50.0


class DeviceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    device_type: Optional[DeviceType] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None


class DeviceOut(BaseModel):
    id: int
    project_id: int
    name: str
    device_type: DeviceType
    pos_x: float
    pos_y: float
    created_at: datetime

    model_config = {"from_attributes": True}


# ── DeviceLink ───────────────────────────────────────────
class DeviceLinkCreate(BaseModel):
    device_a_id: int
    device_b_id: int
    link_type: str = "ethernet"
    description: Optional[str] = None


class DeviceLinkOut(BaseModel):
    id: int
    project_id: int
    device_a_id: int
    device_b_id: int
    link_type: str
    description: Optional[str]

    model_config = {"from_attributes": True}


# ── AddressEntry ─────────────────────────────────────────
class AddressEntryCreate(BaseModel):
    device_name: str = Field(..., min_length=1, max_length=100)
    device_type: DeviceType
    interface: str = Field(..., min_length=1, max_length=100)
    ip_address: Optional[str] = None
    subnet_mask: str = "255.255.255.0"
    gateway: Optional[str] = None
    vlan: Optional[int] = None
    description: Optional[str] = None


class AddressEntryUpdate(BaseModel):
    device_name: Optional[str] = None
    interface: Optional[str] = None
    ip_address: Optional[str] = None
    subnet_mask: Optional[str] = None
    gateway: Optional[str] = None
    vlan: Optional[int] = None
    description: Optional[str] = None


class AddressEntryOut(BaseModel):
    id: int
    project_id: int
    device_name: str
    device_type: DeviceType
    interface: str
    ip_address: Optional[str]
    subnet_mask: str
    gateway: Optional[str]
    vlan: Optional[int]
    description: Optional[str]

    model_config = {"from_attributes": True}


# ── Config (response only) ───────────────────────────────
class DeviceConfig(BaseModel):
    device_name: str
    device_type: DeviceType
    config_text: str


class ProjectConfigOut(BaseModel):
    project_name: str
    configs: List[DeviceConfig]


ProjectDetail.model_rebuild()
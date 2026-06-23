from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Project, Device, AddressEntry
from app.schemas.schemas import DeviceConfig, ProjectConfigOut, DeviceOut, AddressEntryOut
from app.services.config_generator import generate_config

router = APIRouter()


@router.get("/", response_model=ProjectConfigOut)
def get_all_configs(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projekt nie znaleziony")

    devices = db.query(Device).filter(Device.project_id == project_id).all()
    addresses = db.query(AddressEntry).filter(AddressEntry.project_id == project_id).all()

    device_outs = [DeviceOut.model_validate(d) for d in devices]
    addr_outs = [AddressEntryOut.model_validate(a) for a in addresses]

    configs = [
        DeviceConfig(
            device_name=dev.name,
            device_type=dev.device_type,
            config_text=generate_config(dev, addr_outs),
        )
        for dev in device_outs
    ]

    return ProjectConfigOut(project_name=project.name, configs=configs)


@router.get("/{device_id}", response_model=DeviceConfig)
def get_device_config(project_id: int, device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id, Device.project_id == project_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Urządzenie nie znalezione")

    addresses = db.query(AddressEntry).filter(AddressEntry.project_id == project_id).all()
    dev_out = DeviceOut.model_validate(device)
    addr_outs = [AddressEntryOut.model_validate(a) for a in addresses]

    return DeviceConfig(
        device_name=device.name,
        device_type=device.device_type,
        config_text=generate_config(dev_out, addr_outs),
    )
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Project, Device, DeviceLink
from app.schemas.schemas import DeviceCreate, DeviceUpdate, DeviceOut, DeviceLinkCreate, DeviceLinkOut

router = APIRouter()


def _get_project(project_id: int, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projekt nie znaleziony")
    return project


@router.get("/", response_model=List[DeviceOut])
def list_devices(project_id: int, db: Session = Depends(get_db)):
    _get_project(project_id, db)
    return db.query(Device).filter(Device.project_id == project_id).all()


@router.post("/", response_model=DeviceOut, status_code=status.HTTP_201_CREATED)
def create_device(project_id: int, payload: DeviceCreate, db: Session = Depends(get_db)):
    _get_project(project_id, db)
    device = Device(**payload.model_dump(), project_id=project_id)
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


@router.put("/{device_id}", response_model=DeviceOut)
def update_device(project_id: int, device_id: int, payload: DeviceUpdate, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id, Device.project_id == project_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Urządzenie nie znalezione")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(device, field, value)
    db.commit()
    db.refresh(device)
    return device


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_device(project_id: int, device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id, Device.project_id == project_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Urządzenie nie znalezione")
    db.delete(device)
    db.commit()


# ── Links ──────────────────────────────────────────────────────────────────
@router.get("/links/", response_model=List[DeviceLinkOut])
def list_links(project_id: int, db: Session = Depends(get_db)):
    return db.query(DeviceLink).filter(DeviceLink.project_id == project_id).all()


@router.post("/links/", response_model=DeviceLinkOut, status_code=status.HTTP_201_CREATED)
def create_link(project_id: int, payload: DeviceLinkCreate, db: Session = Depends(get_db)):
    _get_project(project_id, db)
    existing = db.query(DeviceLink).filter(
        DeviceLink.project_id == project_id,
        ((DeviceLink.device_a_id == payload.device_a_id) & (DeviceLink.device_b_id == payload.device_b_id)) |
        ((DeviceLink.device_a_id == payload.device_b_id) & (DeviceLink.device_b_id == payload.device_a_id))
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Połączenie już istnieje")
    link = DeviceLink(**payload.model_dump(), project_id=project_id)
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


@router.delete("/links/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_link(project_id: int, link_id: int, db: Session = Depends(get_db)):
    link = db.query(DeviceLink).filter(DeviceLink.id == link_id, DeviceLink.project_id == project_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Połączenie nie znalezione")
    db.delete(link)
    db.commit()
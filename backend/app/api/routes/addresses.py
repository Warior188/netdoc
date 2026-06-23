from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Project, AddressEntry
from app.schemas.schemas import AddressEntryCreate, AddressEntryUpdate, AddressEntryOut

router = APIRouter()


def _get_project(project_id: int, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projekt nie znaleziony")
    return project


@router.get("/", response_model=List[AddressEntryOut])
def list_addresses(project_id: int, db: Session = Depends(get_db)):
    _get_project(project_id, db)
    return db.query(AddressEntry).filter(AddressEntry.project_id == project_id).all()


@router.post("/", response_model=AddressEntryOut, status_code=status.HTTP_201_CREATED)
def create_address(project_id: int, payload: AddressEntryCreate, db: Session = Depends(get_db)):
    _get_project(project_id, db)
    entry = AddressEntry(**payload.model_dump(), project_id=project_id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=AddressEntryOut)
def update_address(project_id: int, entry_id: int, payload: AddressEntryUpdate, db: Session = Depends(get_db)):
    entry = db.query(AddressEntry).filter(
        AddressEntry.id == entry_id, AddressEntry.project_id == project_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Wpis nie znaleziony")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(project_id: int, entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(AddressEntry).filter(
        AddressEntry.id == entry_id, AddressEntry.project_id == project_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Wpis nie znaleziony")
    db.delete(entry)
    db.commit()


@router.post("/bulk", response_model=List[AddressEntryOut], status_code=status.HTTP_201_CREATED)
def bulk_create_addresses(project_id: int, payload: List[AddressEntryCreate], db: Session = Depends(get_db)):
    _get_project(project_id, db)
    entries = [AddressEntry(**item.model_dump(), project_id=project_id) for item in payload]
    db.add_all(entries)
    db.commit()
    for e in entries:
        db.refresh(e)
    return entries
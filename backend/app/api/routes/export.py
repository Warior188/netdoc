from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.core.database import get_db
from app.core.config import settings
from app.models.models import Project, Device, AddressEntry
from app.schemas.schemas import DeviceOut, AddressEntryOut, DeviceConfig, ProjectDetail, DeviceOut, DeviceLinkOut
from app.services.config_generator import generate_config
from app.services.export_service import export_pdf, export_docx

router = APIRouter()


def _build_project_detail(project_id: int, db: Session):
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

    project_detail = ProjectDetail.model_validate(project)
    return project_detail, configs


@router.get("/pdf")
def export_to_pdf(project_id: int, db: Session = Depends(get_db)):
    project_detail, configs = _build_project_detail(project_id, db)
    try:
        filename = export_pdf(project_detail, configs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Błąd eksportu PDF: {str(e)}")

    filepath = os.path.join(settings.EXPORT_DIR, filename)
    return FileResponse(
        path=filepath,
        media_type="application/pdf",
        filename=filename,
    )


@router.get("/docx")
def export_to_docx(project_id: int, db: Session = Depends(get_db)):
    project_detail, configs = _build_project_detail(project_id, db)
    try:
        filename = export_docx(project_detail, configs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Błąd eksportu DOCX: {str(e)}")

    filepath = os.path.join(settings.EXPORT_DIR, filename)
    return FileResponse(
        path=filepath,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=filename,
    )
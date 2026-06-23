from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.routes import projects, devices, addresses, configs, export

app = FastAPI(
    title="NetDoc Maker API",
    description="REST API do tworzenia dokumentacji sieciowej Cisco",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(devices.router, prefix="/api/projects/{project_id}/devices", tags=["devices"])
app.include_router(addresses.router, prefix="/api/projects/{project_id}/addresses", tags=["addresses"])
app.include_router(configs.router, prefix="/api/projects/{project_id}/configs", tags=["configs"])
app.include_router(export.router, prefix="/api/projects/{project_id}/export", tags=["export"])

os.makedirs(settings.EXPORT_DIR, exist_ok=True)
app.mount("/exports", StaticFiles(directory=settings.EXPORT_DIR), name="exports")


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
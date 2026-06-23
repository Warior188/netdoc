from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://netdoc:netdoc_pass@localhost:5432/netdoc_db"
    SECRET_KEY: str = "change-me"
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    EXPORT_DIR: str = "./exports"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
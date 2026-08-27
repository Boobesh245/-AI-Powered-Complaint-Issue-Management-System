import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "complaint_management")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_jwt_key_ai_complaint_mgmt_2026_antigravity")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "smtp.example.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "587"))
    EMAIL_USERNAME: str = os.getenv("EMAIL_USERNAME", "noreply@example.com")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "secret")
    APP_NAME: str = os.getenv("APP_NAME", "AI-Powered Complaint & Issue Management System")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

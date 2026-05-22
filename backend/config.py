from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Movement Range Assessment"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rehab_app.db")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "YOUR_SUPER_SECRET_KEY_CHANGE_ME")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]  # In production, specify origins
    
    # CV Settings
    MIN_DETECTION_CONFIDENCE: float = 0.5
    MIN_TRACKING_CONFIDENCE: float = 0.5
    
    DEBUG_MODE: bool = True

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "WeatherXpert API"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production-use-long-random-string")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:password@localhost:5432/weatherxpert"
    )

    # CORS — frontend URL on Render + local dev
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "https://weatherxpert-frontend.onrender.com"),
    ]

    # Weather API keys
    TOMORROW_IO_API_KEY: str = os.getenv("TOMORROW_IO_API_KEY", "")
    IMD_API_KEY: str = os.getenv("IMD_API_KEY", "")

    # Redis (for caching + WebSocket pub/sub)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List
import warnings


class Settings(BaseSettings):
    environment: str = "development"
    database_url: str = "postgresql://user:password@db:5432/taskdb"
    cors_origins: str = "*"
    jwt_secret: str = "dev-secret-key-change-in-production"
    jwt_expire_minutes: int = 60
    jwt_refresh_expire_days: int = 7
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.cors_origins or self.cors_origins == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.environment == "production" and settings.jwt_secret == "dev-secret-key-change-in-production":
        warnings.warn(
            "🚨 WARNING: Using default JWT_SECRET in a PRODUCTION environment! "
            "This is highly insecure. Please set the JWT_SECRET environment variable."
        )
    return settings

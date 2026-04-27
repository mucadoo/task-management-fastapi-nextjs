from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    database_url: str = "postgresql://user:password@db:5432/taskdb"
    cors_origins: str = "http://localhost:3000"
    jwt_secret: str = "dev-secret-key-change-in-production"
    jwt_expire_minutes: int = 60
    jwt_refresh_expire_days: int = 7
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.cors_origins:
            return ["http://localhost:3000"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

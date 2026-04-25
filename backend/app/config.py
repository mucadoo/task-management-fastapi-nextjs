from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str
    cors_origins: str = "*"
    jwt_secret: str
    jwt_expire_minutes: int = 60
    jwt_refresh_expire_days: int = 7

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()

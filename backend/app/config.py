from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Smart Health Monitoring API"
    api_prefix: str = "/api"
    debug: bool = True
    cors_origins: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
            "http://localhost:3004",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:3002",
            "http://127.0.0.1:3003",
            "http://127.0.0.1:3004",
        ]
    )

    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "health_user"
    mysql_password: str = "health_password"
    mysql_database: str = "smart_health_db"

    thingspeak_channel_id: str = "" 
    thingspeak_read_key: str = ""
    thingspeak_write_key: str = ""

    firebase_url: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

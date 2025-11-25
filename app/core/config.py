from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = "Project Name API"
    database_url: str = "sqlite:///./project.db"
    auto_create_tables: bool = True
    # CORS configuration
    cors_allow_origins: List[str] = ["*"]
    cors_allow_methods: List[str] = ["*"]
    cors_allow_headers: List[str] = ["*"]
    cors_allow_credentials: bool = True

    # JWT security configuration (explicit env names to match .env / Render variables)
    jwt_secret: str = Field("CHANGE_ME_SUPER_SECRET_KEY", env="JWT_SECRET")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    jwt_expiration_minutes: int = Field(60, env="JWT_EXPIRATION_MINUTES")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    environment: str = "development"
    debug: bool = False
    service_name: str = "estatefox-api"

    # AWS
    aws_region: str = "us-east-1"

    # CORS
    cors_origins: list[str] = ["*"]

    class Config:
        env_prefix = "APP_"
        case_sensitive = False


settings = Settings()

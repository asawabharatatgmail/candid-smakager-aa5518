from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    anthropic_api_key: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    app_name: str = "EduVeda"
    app_env: str = "development"
    cors_origins: str = "https://system4learn.com,https://candid-smakager-aa5518.netlify.app,http://localhost:3000,http://localhost:5173"

    # SMTP — set these in .env (Gmail: use an App Password)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    app_url: str = "https://system4learn.com"

    # Trial duration in days (new registrations)
    trial_days: int = 7

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()

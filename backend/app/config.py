from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./keto.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    ANTHROPIC_API_KEY: str = ""
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_PRO: str = ""
    STRIPE_PRICE_ELITE: str = ""
    FRONTEND_URL: str = "http://localhost:3000"
    SMTP_EMAIL: str = ""
    SMTP_PASSWORD: str = ""
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "KetoCoach <noreply@keto-coach.app>"

    class Config:
        env_file = ".env"


settings = Settings()

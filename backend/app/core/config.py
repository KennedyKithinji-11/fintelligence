from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FinTelligence API"
    debug: bool = False
    ALLOWED_ORIGIN: str = "http://localhost:5173"

    DATABASE_URL: str = "postgresql://finuser:finpass@localhost:5432/fintelligence"
    REDIS_URL: str = "redis://localhost:6379"

    JWT_SECRET_KEY: str = "CHANGE-THIS-IN-PRODUCTION"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GROQ_API_KEY: str = ""
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    ALPHA_VANTAGE_KEY: str = "demo"

    class Config:
        env_file = ".env"

settings = Settings()
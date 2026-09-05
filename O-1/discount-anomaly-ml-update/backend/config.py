import os

class Settings:
    PROJECT_NAME: str = "DealFlow360 API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Primary: PostgreSQL (owner postgres as seen in user's pgAdmin screenshot)
    # Fallback: SQLite local file database
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "DealFlow360")
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def SQLITE_FALLBACK_URL(self) -> str:
        return "sqlite:///./dealflow360.db"

settings = Settings()

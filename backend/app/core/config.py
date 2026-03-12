from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Configuración central de la aplicación.
    Pydantic lee automáticamente las variables del archivo .env
    """
    APP_NAME: str = "BizDash"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

# Instancia única que usaremos en toda la app
settings = Settings()
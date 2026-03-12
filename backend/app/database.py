from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Motor de conexión a PostgreSQL
engine = create_engine(settings.DATABASE_URL)

# Fábrica de sesiones (cada request tendrá su propia sesión)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base de la que heredarán todos los modelos
Base = declarative_base()

def get_db():
    """
    Generador que provee una sesión de BD por request.
    El 'finally' garantiza que la sesión siempre se cierra,
    incluso si hay un error. Como abrir y cerrar una conexión limpiamente.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
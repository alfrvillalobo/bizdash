from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import UserRole

class UserCreate(BaseModel):
    """Datos requeridos para registrar un usuario"""
    name: str
    email: EmailStr  # Valida automáticamente que sea un email válido
    password: str
    role: UserRole = UserRole.seller

class UserResponse(BaseModel):
    """Lo que devolvemos al frontend (NUNCA el password)"""
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True  # Permite convertir objetos SQLAlchemy a JSON

class LoginRequest(BaseModel):
    """Datos para hacer login"""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """Respuesta del login exitoso"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
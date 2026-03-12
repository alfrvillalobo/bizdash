from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from app.models.user import UserRole
import re

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.seller

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        if len(v) > 100:
            raise ValueError("El nombre no puede tener más de 100 caracteres")
        # Solo letras y espacios (acepta tildes y ñ)
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$", v):
            raise ValueError("El nombre solo puede contener letras y espacios")
        return v

    @field_validator("email")
    @classmethod
    def validate_email_domain(cls, v: str) -> str:
        if not v.endswith("@bizdash.com"):
            raise ValueError("El correo debe ser del dominio @bizdash.com")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres")
        return v


class UserUpdate(BaseModel):
    name: str | None = None
    role: UserRole | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if len(v) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$", v):
            raise ValueError("El nombre solo puede contener letras y espacios")
        return v


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
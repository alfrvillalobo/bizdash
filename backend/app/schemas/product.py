from pydantic import BaseModel
from datetime import datetime

class ProductCreate(BaseModel):
    """Datos para crear un producto"""
    name: str
    price: float
    stock: int = 0

class ProductUpdate(BaseModel):
    """Todos opcionales para actualizar solo lo que se necesita"""
    name: str | None = None
    price: float | None = None
    stock: int | None = None

class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    stock: int
    created_at: datetime

    class Config:
        from_attributes = True
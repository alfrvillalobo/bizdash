from pydantic import BaseModel
from datetime import datetime
from app.schemas.product import ProductResponse
from app.schemas.user import UserResponse

class SaleCreate(BaseModel):
    """Datos para registrar una venta"""
    product_id: int
    quantity: int

class SaleResponse(BaseModel):
    id: int
    quantity: int
    total: float
    created_at: datetime
    user: UserResponse
    product: ProductResponse

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    """Estadísticas generales para el dashboard"""
    total_sales: int
    total_revenue: float
    total_products: int
    low_stock_count: int
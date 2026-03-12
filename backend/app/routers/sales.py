from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date
from app.database import get_db
from app.models.sale import Sale
from app.models.product import Product
from app.models.user import User
from app.schemas.sale import SaleCreate, SaleResponse, DashboardStats
from app.core.dependencies import get_current_user, require_admin
from typing import List

router = APIRouter(prefix="/sales", tags=["Ventas"])

# ✅ PRIMERO todas las rutas estáticas

@router.get("/stats/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Estadísticas generales para el dashboard (solo admin)"""
    total_sales = db.query(func.count(Sale.id)).scalar()
    total_revenue = db.query(func.sum(Sale.total)).scalar() or 0
    total_products = db.query(func.count(Product.id)).scalar()
    low_stock_count = db.query(func.count(Product.id)).filter(Product.stock < 5).scalar()

    return DashboardStats(
        total_sales=total_sales,
        total_revenue=total_revenue,
        total_products=total_products,
        low_stock_count=low_stock_count
    )


@router.get("/stats/by-day")
def get_sales_by_day(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Ventas agrupadas por día (últimos 7 días)"""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    results = (
        db.query(
            func.date(Sale.created_at).label("date"),
            func.count(Sale.id).label("sales_count"),
            func.sum(Sale.total).label("revenue")
        )
        .filter(Sale.created_at >= seven_days_ago)
        .group_by(func.date(Sale.created_at))
        .order_by(func.date(Sale.created_at))
        .all()
    )

    return [
        {
            "date": str(row.date),
            "sales_count": row.sales_count,
            "revenue": round(row.revenue, 2)
        }
        for row in results
    ]


@router.get("/my-sales", response_model=List[SaleResponse])
def get_my_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista las ventas del usuario autenticado"""
    return (
        db.query(Sale)
        .filter(Sale.user_id == current_user.id)
        .order_by(Sale.created_at.desc())
        .all()
    )

@router.get("/stats/by-product")
def get_sales_by_product(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Ventas agrupadas por producto.
    Alimentará el gráfico de torta del dashboard.
    """
    results = (
        db.query(
            Product.name.label("product_name"),
            func.count(Sale.id).label("sales_count"),
            func.sum(Sale.total).label("revenue")
        )
        .join(Product, Sale.product_id == Product.id)
        .group_by(Product.name)
        .order_by(func.sum(Sale.total).desc())
        .all()
    )

    return [
        {
            "name": row.product_name,
            "sales_count": row.sales_count,
            "revenue": round(row.revenue, 2)
        }
        for row in results
    ]


@router.get("/stats/by-seller")
def get_sales_by_seller(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Ventas agrupadas por vendedor.
    Alimentará el gráfico de barras del dashboard.
    """
    results = (
        db.query(
            User.name.label("seller_name"),
            func.count(Sale.id).label("sales_count"),
            func.sum(Sale.total).label("revenue")
        )
        .join(User, Sale.user_id == User.id)
        .group_by(User.name)
        .order_by(func.sum(Sale.total).desc())
        .all()
    )

    return [
        {
            "name": row.seller_name,
            "sales_count": row.sales_count,
            "revenue": round(row.revenue, 2)
        }
        for row in results
    ]
    
@router.get("/stats/my-stats")
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Estadísticas personales del vendedor autenticado.
    Cada vendedor solo ve sus propios números.
    """
    # Total de ventas del vendedor
    my_total_sales = (
        db.query(func.count(Sale.id))
        .filter(Sale.user_id == current_user.id)
        .scalar()
    )

    # Ingresos totales del vendedor
    my_total_revenue = (
        db.query(func.sum(Sale.total))
        .filter(Sale.user_id == current_user.id)
        .scalar() or 0
    )

    # Ventas de hoy
    from datetime import date
    today_start = datetime.combine(date.today(), datetime.min.time())
    my_today_sales = (
        db.query(func.count(Sale.id))
        .filter(
            Sale.user_id == current_user.id,
            Sale.created_at >= today_start
        )
        .scalar()
    )

    # Ingresos de hoy
    my_today_revenue = (
        db.query(func.sum(Sale.total))
        .filter(
            Sale.user_id == current_user.id,
            Sale.created_at >= today_start
        )
        .scalar() or 0
    )

    # Ventas por día (últimos 7 días) del vendedor
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    daily_results = (
        db.query(
            func.date(Sale.created_at).label("date"),
            func.count(Sale.id).label("sales_count"),
            func.sum(Sale.total).label("revenue")
        )
        .filter(
            Sale.user_id == current_user.id,
            Sale.created_at >= seven_days_ago
        )
        .group_by(func.date(Sale.created_at))
        .order_by(func.date(Sale.created_at))
        .all()
    )

    return {
        "my_total_sales": my_total_sales,
        "my_total_revenue": round(my_total_revenue, 2),
        "my_today_sales": my_today_sales,
        "my_today_revenue": round(my_today_revenue, 2),
        "daily_chart": [
            {
                "date": str(row.date),
                "sales_count": row.sales_count,
                "revenue": round(row.revenue, 2)
            }
            for row in daily_results
        ]
    }    

# ✅ DESPUÉS las rutas dinámicas con {id}

@router.get("/", response_model=List[SaleResponse])
def get_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Lista todas las ventas (solo admin)"""
    return db.query(Sale).order_by(Sale.created_at.desc()).all()


@router.post("/", response_model=SaleResponse, status_code=201)
def create_sale(
    sale_data: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Registra una nueva venta y descuenta el stock"""
    product = db.query(Product).filter(Product.id == sale_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if product.stock < sale_data.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Stock insuficiente. Disponible: {product.stock}"
        )

    total = product.price * sale_data.quantity
    product.stock -= sale_data.quantity

    new_sale = Sale(
        user_id=current_user.id,
        product_id=sale_data.product_id,
        quantity=sale_data.quantity,
        total=total
    )

    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    return new_sale
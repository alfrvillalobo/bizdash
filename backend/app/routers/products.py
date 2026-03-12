from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.core.dependencies import get_current_user, require_admin
from typing import List

router = APIRouter(prefix="/products", tags=["Productos"])

@router.get("/", response_model=List[ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Cualquier usuario autenticado
):
    """Lista todos los productos"""
    return db.query(Product).order_by(Product.created_at.desc()).all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtiene un producto por ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)  # Solo admins
):
    """Crea un nuevo producto (solo admin)"""
    new_product = Product(**product_data.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)  # Solo admins
):
    """Actualiza un producto parcialmente (solo admin)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Actualiza solo los campos enviados (ignora los None)
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Elimina un producto (solo admin)"""
    from sqlalchemy.exc import IntegrityError

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    try:
        db.delete(product)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar este producto porque tiene ventas asociadas"
        )
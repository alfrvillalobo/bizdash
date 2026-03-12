from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, LoginRequest, TokenResponse, UserUpdate
from app.core.security import hash_password, verify_password, create_access_token
from typing import List
from app.core.dependencies import get_current_user, require_admin


router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario.
    Depends(get_db) inyecta automáticamente la sesión de BD.
    """
    # Verificar si el email ya existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Crear usuario con password encriptado
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # Obtiene el ID generado por la BD
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica un usuario y devuelve un JWT.
    El frontend guarda este token y lo manda en cada request.
    """
    # Buscar usuario por email
    user = db.query(User).filter(User.email == credentials.email).first()

    # Verificar usuario y contraseña
    # Usamos el mismo mensaje para ambos casos por seguridad
    # (no revelamos si el email existe o no)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Generar token JWT con el ID y rol del usuario
    token = create_access_token(data={
        "sub": str(user.id),
        "role": user.role.value
    })

    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    token: str,
    db: Session = Depends(get_db)
):
    """Devuelve la info del usuario autenticado"""
    from app.core.security import decode_token

    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return user

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Lista todos los usuarios (solo admin)"""
    return db.query(User).order_by(User.created_at.desc()).all()

@router.post("/users", response_model=UserResponse, status_code=201)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Crea un usuario desde el panel admin"""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Actualiza nombre y/o rol de un usuario (solo admin)"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="No puedes modificar tu propio usuario desde aquí"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Elimina un usuario (solo admin, no puede eliminarse a sí mismo)"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="No puedes eliminar tu propio usuario"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Verificar si tiene ventas asociadas
    from sqlalchemy.exc import IntegrityError
    try:
        db.delete(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar este usuario porque tiene ventas registradas"
        )
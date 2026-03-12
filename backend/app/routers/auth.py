from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token

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
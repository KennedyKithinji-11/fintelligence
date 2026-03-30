# backend/app/routers/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.core.config import settings
from app.database import get_db
from app.models.user import User
from app.middleware.auth_middleware import get_current_user
from app.core.security import hash_password, verify_password, create_token, JWTError

# Create the router
router = APIRouter(prefix="/auth", tags=["auth"])


# ====================== Pydantic Schemas ======================
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "analyst"   # Default role — never allow "admin" via self-registration


class RefreshRequest(BaseModel):
    refresh_token: str


# ====================== Endpoints ======================

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if email already exists
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists"
        )

    # Prevent privilege escalation
    allowed_roles = ["viewer", "analyst"]
    role = payload.role if payload.role in allowed_roles else "analyst"

    # Create new user
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=role,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }


@router.post("/login")
async def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login with email + password and return access + refresh tokens"""
    user = db.query(User).filter(User.email == form.username).first()

    # Always return same error to prevent user enumeration attacks
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    # Create tokens
    access_token = create_token(
        {"sub": str(user.id), "role": user.role},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    refresh_token = create_token(
        {"sub": str(user.id), "type": "refresh"},
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role,
    }


@router.post("/refresh")
async def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    """Refresh access token using a valid refresh token"""
    credentials_error = HTTPException(
        status_code=401,
        detail="Invalid refresh token"
    )

    try:
        data = jwt.decode(
            payload.refresh_token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]   # Make sure this exists in config
        )

        if data.get("type") != "refresh":
            raise credentials_error

        user_id = int(data.get("sub"))
    except JWTError:
        raise credentials_error

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise credentials_error

    # Issue new access token only
    new_access_token = create_token(
        {"sub": str(user.id), "role": user.role},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Return current user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }
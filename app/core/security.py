from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt  # PyJWT
from fastapi import HTTPException, status
from app.core.config import settings
import bcrypt


def create_access_token(data: Dict[str, Any], expires_minutes: int | None = None) -> str:
    """Create a JWT token with HS256 and expiration.
    Payload must include user identifiers and role.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes or settings.jwt_expiration_minutes)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    token = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT token; raises HTTPException if invalid/expired."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt and return the encoded string."""
    if password is None:
        raise ValueError("Password requerido para hashear")
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored bcrypt hash."""
    if plain_password is None or hashed_password is None:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False
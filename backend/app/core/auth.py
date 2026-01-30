from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import HTTPException, status
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash, handling bcrypt 72-byte limit"""
    try:
        # Handle old "simple_hash" format for migration
        if hashed_password == "simple_hash":
            return True  # Accept any password for migration
        
        # Ensure password is within bcrypt's 72-byte limit
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            # Truncate to 72 bytes for verification
            password_bytes = password_bytes[:72]
        
        # Standard bcrypt hash (both $2a$ and $2b$ formats work with bcrypt.checkpw)
        if hashed_password.startswith('$2'):
            try:
                return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))
            except Exception:
                # If direct bcrypt fails, try passlib as fallback
                try:
                    from passlib.context import CryptContext
                    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                    return pwd_context.verify(plain_password, hashed_password)
                except Exception:
                    return False
        else:
            # Try passlib format for backward compatibility
            try:
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                return pwd_context.verify(plain_password, hashed_password)
            except Exception:
                return False
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt directly, ensuring it's within bcrypt's 72-byte limit"""
    # Bcrypt has a 72-byte limit, so we need to handle longer passwords
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncate to 72 bytes
        password_bytes = password_bytes[:72]
    
    try:
        # Generate salt and hash password
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    except ValueError as e:
        # If still fails, provide a better error message
        raise HTTPException(
            status_code=400,
            detail=f"Password hashing failed: Password must be 72 bytes or less"
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
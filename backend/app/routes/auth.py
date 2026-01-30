from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database.connection import get_db
from app.database.models import User, RoleEnum
from app.schemas.schemas import (
    UserCreate,
    UserResponse,
    LoginRequest,
    Token,
)
from app.core.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
)
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Authentication"])


# =========================
# Register
# =========================

@router.post("/register")
def register(request_data: dict = Body(...), db: Session = Depends(get_db)):
    try:
        # Extract and validate data
        email = request_data.get('email', '').strip().lower()
        name = request_data.get('name', '').strip()
        password = request_data.get('password', '')
        role = request_data.get('role', 'user')
        
        # Validation
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        if not name:
            raise HTTPException(status_code=400, detail="Name is required")
        if not password:
            raise HTTPException(status_code=400, detail="Password is required")
        if len(password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        # Bcrypt has a 72-byte limit
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            raise HTTPException(status_code=400, detail="Password must be 72 bytes or less (approximately 72 characters)")
        
        # Check if email or username already exists
        existing_user_by_email = db.query(User).filter(User.email == email).first()
        existing_user_by_username = db.query(User).filter(User.username == name).first()
        
        if existing_user_by_email:
            # If user exists but inactive, reactivate them and update password
            if not existing_user_by_email.is_active:
                existing_user_by_email.is_active = True
                # Update password to new hash
                existing_user_by_email.hashed_password = get_password_hash(password)
                db.commit()
                db.refresh(existing_user_by_email)
                
                access_token = create_access_token(data={"sub": existing_user_by_email.username})
                return {
                    "token": access_token,
                    "user": {
                        "id": existing_user_by_email.id,
                        "username": existing_user_by_email.username,
                        "email": existing_user_by_email.email,
                        "full_name": existing_user_by_email.full_name,
                        "role": existing_user_by_email.role.value,
                        "is_active": existing_user_by_email.is_active
                    }
                }
            else:
                raise HTTPException(status_code=400, detail="Email already registered")
        
        if existing_user_by_username:
            raise HTTPException(status_code=400, detail="Username already taken")
        
        # Map role
        role_enum = RoleEnum.USER
        if role in ['writer', 'tech_writer', 'techwriter']:
            role_enum = RoleEnum.TECH_WRITER
        elif role == 'admin':
            role_enum = RoleEnum.ADMIN

        # Create user
        try:
            hashed_password = get_password_hash(password)
            db_user = User(
                email=email,
                username=name,
                full_name=name,
                hashed_password=hashed_password,
                role=role_enum,
                is_active=True,
            )

            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        except IntegrityError as db_error:
            db.rollback()
            # Check if it's a unique constraint violation
            error_str = str(db_error.orig).lower() if hasattr(db_error, 'orig') else str(db_error).lower()
            if 'unique' in error_str or 'duplicate' in error_str:
                if 'email' in error_str or 'users.email' in error_str:
                    raise HTTPException(status_code=400, detail="Email already registered")
                elif 'username' in error_str or 'users.username' in error_str:
                    raise HTTPException(status_code=400, detail="Username already taken")
            raise HTTPException(status_code=400, detail="Registration failed: User with this email or username already exists")
        except Exception as db_error:
            db.rollback()
            raise

        # Create token
        access_token = create_access_token(data={"sub": db_user.username})

        return {
            "token": access_token,
            "user": {
                "id": db_user.id,
                "username": db_user.username,
                "email": db_user.email,
                "full_name": db_user.full_name,
                "role": db_user.role.value,
                "is_active": db_user.is_active
            }
        }
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        error_str = str(e.orig).lower() if hasattr(e, 'orig') else str(e).lower()
        if 'unique' in error_str or 'duplicate' in error_str:
            if 'email' in error_str or 'users.email' in error_str:
                raise HTTPException(status_code=400, detail="Email already registered")
            elif 'username' in error_str or 'users.username' in error_str:
                raise HTTPException(status_code=400, detail="Username already taken")
        raise HTTPException(status_code=400, detail="Registration failed: User with this email or username already exists")
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.rollback()
        # Provide more specific error messages
        error_msg = str(e)
        raise HTTPException(status_code=500, detail=f"Registration failed: {error_msg}")


# =========================
# Login
# =========================

@router.post("/login")
def login(request_data: dict = Body(...), db: Session = Depends(get_db)):
    try:
        email = request_data.get('email', '').strip().lower()
        password = request_data.get('password', '')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        if not password:
            raise HTTPException(status_code=400, detail="Password is required")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Verify password - handle migration from old "simple_hash" format
        password_valid = False
        if not user.hashed_password:
            # No password set - invalid
            raise HTTPException(status_code=401, detail="Invalid credentials")
        elif user.hashed_password == "simple_hash":
            # Migration path: accept any password for old users, then upgrade their hash
            password_valid = True
            # Upgrade to proper bcrypt hash
            user.hashed_password = get_password_hash(password)
            db.commit()
            db.refresh(user)
        else:
            # Normal password verification
            try:
                password_valid = verify_password(password, user.hashed_password)
            except Exception as e:
                # If verification fails (e.g., invalid hash format), treat as invalid
                password_valid = False
        
        if not password_valid:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Activate user if inactive
        if not user.is_active:
            user.is_active = True
            db.commit()
            db.refresh(user)

        access_token = create_access_token(data={"sub": user.username})

        return {
            "token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value,
                "is_active": user.is_active
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


# =========================
# Current user
# =========================

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    user = db.query(User).options(joinedload(User.profile)).filter(User.id == current_user.id).first()
    return user

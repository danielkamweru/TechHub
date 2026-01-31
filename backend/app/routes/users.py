from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.models import User, Profile, RoleEnum
from app.schemas.schemas import UserResponse, UserUpdate, UserCreate
from app.core.dependencies import get_current_user, require_admin
from app.core.auth import get_password_hash

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    from sqlalchemy.orm import joinedload
    users = db.query(User).options(joinedload(User.profile)).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy.orm import joinedload
    user = db.query(User).options(joinedload(User.profile)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only update their own profile, admins can update any
    if current_user.id != user_id and current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    update_data = user_update.dict(exclude_unset=True)
    profile_fields = {'bio', 'avatar_url'}
    user_fields = {k: v for k, v in update_data.items() if k not in profile_fields}
    
    for field, value in user_fields.items():
        setattr(user, field, value)
    
    # Update or create profile for bio and avatar_url
    profile_fields_data = {k: v for k, v in update_data.items() if k in profile_fields}
    if profile_fields_data:
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if profile:
            for field, value in profile_fields_data.items():
                setattr(profile, field, value)
        else:
            profile = Profile(user_id=user_id, **profile_fields_data)
            db.add(profile)
    
    db.commit()
    db.refresh(user)
    # Reload with profile
    from sqlalchemy.orm import joinedload
    user = db.query(User).options(joinedload(User.profile)).filter(User.id == user_id).first()
    return user

@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Check if user already exists
    db_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role,
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create profile if bio or avatar_url provided
    if user.bio or user.avatar_url:
        profile = Profile(
            user_id=db_user.id,
            bio=user.bio,
            avatar_url=user.avatar_url
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # Reload with profile
    from sqlalchemy.orm import joinedload
    db_user = db.query(User).options(joinedload(User.profile)).filter(User.id == db_user.id).first()
    return db_user

class UserRoleUpdate(BaseModel):
    role: RoleEnum

@router.put("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    body: "UserRoleUpdate",
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = body.role
    db.commit()
    db.refresh(user)
    from sqlalchemy.orm import joinedload
    user = db.query(User).options(joinedload(User.profile)).filter(User.id == user_id).first()
    return user

@router.put("/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}

@router.put("/{user_id}/activate")
def activate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()
    
    return {"message": "User activated successfully"}

@router.get("/{user_id}/recommendations")
def get_user_recommendations(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get content recommendations for a user"""
    return {"recommendations": []}
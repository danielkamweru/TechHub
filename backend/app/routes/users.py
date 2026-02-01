from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.models import User, Profile, RoleEnum, Content, Category, Like, ContentStatusEnum, user_categories
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
    """Get content recommendations for a user based on preferences and behavior"""
    
    # Get user's subscribed categories
    user_subscribed_categories = db.query(Category).join(
        user_categories, Category.id == user_categories.c.category_id
    ).filter(user_categories.c.user_id == user_id).all()
    
    subscribed_category_ids = [cat.id for cat in user_subscribed_categories]
    
    # Get user's liked content to understand preferences
    user_likes = db.query(Like).filter(
        Like.user_id == user_id,
        Like.is_like == True
    ).all()
    
    liked_content_ids = [like.content_id for like in user_likes]
    liked_content = db.query(Content).filter(Content.id.in_(liked_content_ids)).all()
    
    # Get categories from user's liked content
    preferred_category_ids = list(set([content.category_id for content in liked_content]))
    
    # Combine subscribed and preferred categories
    target_category_ids = list(set(subscribed_category_ids + preferred_category_ids))
    
    # Get content from target categories that user hasn't seen/liked
    recommended_content = db.query(Content).filter(
        Content.category_id.in_(target_category_ids),
        Content.status == ContentStatusEnum.PUBLISHED,
        Content.is_flagged == False,
        ~Content.id.in_(liked_content_ids)  # Exclude already liked content
    ).order_by(
        Content.likes_count.desc(),
        Content.views_count.desc(),
        Content.created_at.desc()
    ).limit(20).all()
    
    # If no recommendations from categories, get popular content
    if not recommended_content:
        recommended_content = db.query(Content).filter(
            Content.status == ContentStatusEnum.PUBLISHED,
            Content.is_flagged == False,
            ~Content.id.in_(liked_content_ids)
        ).order_by(
            Content.likes_count.desc(),
            Content.views_count.desc()
        ).limit(20).all()
    
    # Format response
    recommendations = []
    for content in recommended_content:
        content_dict = {
            "id": content.id,
            "title": content.title,
            "content_text": content.content_text,
            "content_type": content.content_type.value,
            "media_url": content.media_url,
            "thumbnail_url": content.thumbnail_url,
            "likes_count": content.likes_count,
            "dislikes_count": content.dislikes_count,
            "views_count": content.views_count,
            "comments_count": len(content.comments) if content.comments else 0,
            "created_at": content.created_at.isoformat(),
            "category": {
                "id": content.category.id,
                "name": content.category.name,
                "color": content.category.color
            } if content.category else None,
            "author": {
                "id": content.author.id,
                "username": content.author.username,
                "full_name": content.author.full_name
            } if content.author else None
        }
        recommendations.append(content_dict)
    
    return {"recommendations": recommendations}
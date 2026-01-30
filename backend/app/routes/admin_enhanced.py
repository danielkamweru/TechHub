from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from typing import List, Optional
from datetime import datetime

from app.database.connection import get_db
from app.database.models import (
    User, Profile, Content, ContentFlag, RoleEnum, Category,
    FlagReasonEnum, Notification, NotificationTypeEnum, ContentStatusEnum
)
from app.schemas.schemas import UserCreate, UserResponse, ContentResponse, CategoryResponse
from app.core.dependencies import get_current_user, require_admin
from app.core.auth import get_password_hash

router = APIRouter()

# =========================
# User Management (Admin)
# =========================

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new user (admin only)"""
    # Check if user already exists
    existing = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create profile if bio or avatar_url provided
    if user_data.bio or user_data.avatar_url:
        profile = Profile(
            user_id=new_user.id,
            bio=user_data.bio,
            avatar_url=user_data.avatar_url
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # Reload with profile
    from sqlalchemy.orm import joinedload
    new_user = db.query(User).options(joinedload(User.profile)).filter(User.id == new_user.id).first()
    
    return new_user

@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    role: Optional[RoleEnum] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all users with filtering (admin only)"""
    from sqlalchemy.orm import joinedload
    query = db.query(User).options(joinedload(User.profile))
    
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()

@router.put("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Deactivate a user account (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    user.is_active = False
    db.commit()
    
    return {"message": f"User {user.username} deactivated successfully"}

@router.put("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Activate a user account (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    db.commit()
    
    return {"message": f"User {user.username} activated successfully"}

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    new_role: RoleEnum,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user role (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = new_role
    db.commit()
    
    return {"message": f"User role updated to {new_role.value}"}

# =========================
# Content Management (Admin)
# =========================

@router.get("/content/pending", response_model=List[ContentResponse])
def get_pending_content(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all content pending approval"""
    return db.query(Content).filter(
        Content.status == ContentStatusEnum.REVIEW
    ).offset(skip).limit(limit).all()

@router.put("/content/{content_id}/approve")
def approve_content(
    content_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Approve content for publication"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    content.status = ContentStatusEnum.PUBLISHED
    content.published_at = datetime.now()
    db.commit()
    
    # Notify author
    notification = Notification(
        user_id=content.author_id,
        notification_type=NotificationTypeEnum.STATUS_CHANGE,
        title="Content Approved",
        message=f"Your content '{content.title}' has been approved and published",
        related_content_id=content.id
    )
    db.add(notification)
    db.commit()
    
    return {"message": "Content approved and published"}

@router.delete("/content/{content_id}")
def remove_content(
    content_id: int,
    reason: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Remove content that violates guidelines"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Notify author before deletion
    notification = Notification(
        user_id=content.author_id,
        notification_type=NotificationTypeEnum.STATUS_CHANGE,
        title="Content Removed",
        message=f"Your content '{content.title}' was removed. Reason: {reason or 'Violation of guidelines'}",
        related_content_id=content.id
    )
    db.add(notification)
    
    db.delete(content)
    db.commit()
    
    return {"message": "Content removed successfully"}

# =========================
# Category Management (Admin)
# =========================

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    name: str,
    description: Optional[str] = None,
    color: Optional[str] = "#3B82F6",
    icon: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new category"""
    existing = db.query(Category).filter(Category.name.ilike(name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    category = Category(
        name=name,
        description=description,
        color=color,
        icon=icon,
        created_by=current_user.id
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return category

@router.put("/categories/{category_id}")
def update_category(
    category_id: int,
    name: Optional[str] = None,
    description: Optional[str] = None,
    color: Optional[str] = None,
    icon: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update category details"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if name: category.name = name
    if description is not None: category.description = description
    if color: category.color = color
    if icon is not None: category.icon = icon
    
    db.commit()
    return {"message": "Category updated successfully"}

@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a category"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has content
    content_count = db.query(Content).filter(Content.category_id == category_id).count()
    if content_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category with existing content")
    
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}

# =========================
# Content Flagging (Admin)
# =========================

@router.get("/flags/pending")
def get_pending_flags(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all pending content flags"""
    return db.query(ContentFlag).filter(
        ContentFlag.is_resolved == False
    ).offset(skip).limit(limit).all()

@router.put("/flags/{flag_id}/resolve")
def resolve_flag(
    flag_id: int,
    action: str = Query(..., regex="^(approve|reject)$"),
    admin_notes: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Resolve a content flag"""
    flag = db.query(ContentFlag).filter(ContentFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")
    
    flag.is_resolved = True
    flag.resolved_by = current_user.id
    flag.resolved_at = datetime.now()
    flag.admin_notes = admin_notes
    
    if action == "approve":
        # Remove the flagged content
        content = db.query(Content).filter(Content.id == flag.content_id).first()
        if content:
            db.delete(content)
    
    db.commit()
    return {"message": f"Flag {action}d successfully"}

# =========================
# Dashboard Stats (Admin)
# =========================

@router.get("/stats")
def get_admin_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get platform statistics for admin dashboard"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_content = db.query(Content).count()
    published_content = db.query(Content).filter(Content.status == ContentStatusEnum.PUBLISHED).count()
    pending_content = db.query(Content).filter(Content.status == ContentStatusEnum.REVIEW).count()
    pending_flags = db.query(ContentFlag).filter(ContentFlag.is_resolved == False).count()
    
    # User role breakdown
    admins = db.query(User).filter(User.role == RoleEnum.ADMIN).count()
    tech_writers = db.query(User).filter(User.role == RoleEnum.TECH_WRITER).count()
    regular_users = db.query(User).filter(User.role == RoleEnum.USER).count()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "admins": admins,
            "tech_writers": tech_writers,
            "regular_users": regular_users
        },
        "content": {
            "total": total_content,
            "published": published_content,
            "pending_approval": pending_content
        },
        "moderation": {
            "pending_flags": pending_flags
        }
    }
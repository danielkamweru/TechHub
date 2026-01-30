from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime
from app.database.connection import get_db
from app.database.models import User, Content, ContentStatusEnum, Like, Category, RoleEnum
from app.schemas.schemas import ContentCreate, ContentUpdate, ContentResponse, LikeCreate
from app.core.dependencies import get_current_user, require_admin, require_tech_writer_or_admin

router = APIRouter()

@router.get("/", response_model=List[ContentResponse])
def get_content(
    page: int = 1,
    limit: int = 20,
    category_id: Optional[int] = None,
    status: Optional[ContentStatusEnum] = ContentStatusEnum.PUBLISHED,
    db: Session = Depends(get_db)
):
    try:
        skip = (page - 1) * limit
        query = db.query(Content)
        
        if category_id:
            query = query.filter(Content.category_id == category_id)
        
        if status:
            query = query.filter(Content.status == status)
        
        # Get content with relationships loaded
        content_list = query.options(
            joinedload(Content.author),
            joinedload(Content.category)
        ).offset(skip).limit(limit).all()
        
        # Return empty list if no content found
        if not content_list:
            return []
        
        # Add counts safely
        result = []
        for content in content_list:
            try:
                content_dict = {
                    "id": content.id,
                    "title": content.title,
                    "content_text": content.content_text,
                    "content_type": content.content_type.value if content.content_type else "article",
                    "status": content.status.value if content.status else "published",
                    "media_url": content.media_url,
                    "thumbnail_url": content.thumbnail_url,
                    "tags": getattr(content, 'tags', None),
                    "views_count": content.views_count or 0,
                    "created_at": content.created_at.isoformat() if content.created_at else None,
                    "updated_at": content.updated_at.isoformat() if content.updated_at else None,
                    "published_at": content.published_at.isoformat() if content.published_at else None,
                    "author_id": content.author_id,
                    "category_id": content.category_id,
                    "likes_count": 0,
                    "dislikes_count": 0,
                    "comments_count": 0,
                    "author": {
                        "id": content.author.id if content.author else None,
                        "username": content.author.username if content.author else "Unknown",
                        "email": content.author.email if content.author else "",
                        "full_name": content.author.full_name if content.author else "Unknown",
                        "role": content.author.role.value if content.author and content.author.role else "user",
                        "is_active": content.author.is_active if content.author else True,
                        "created_at": content.author.created_at.isoformat() if content.author and content.author.created_at else None
                    },
                    "category": {
                        "id": content.category.id if content.category else None,
                        "name": content.category.name if content.category else "Uncategorized",
                        "description": content.category.description if content.category else "",
                        "color": content.category.color if content.category else "#3B82F6",
                        "created_at": content.category.created_at.isoformat() if content.category and content.category.created_at else None,
                        "created_by": content.category.created_by if content.category else None
                    }
                }
                result.append(content_dict)
            except Exception as e:
                print(f"Error processing content {content.id}: {e}")
                continue
        
        return result
    except Exception as e:
        # Return empty list on any error to prevent 500
        return []

@router.post("/", response_model=ContentResponse)
def create_content(
    content: ContentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify category exists
    category = db.query(Category).filter(Category.id == content.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    db_content = Content(
        title=content.title,
        content_text=content.content_text,
        content_type=content.content_type,
        media_url=content.media_url,
        thumbnail_url=content.thumbnail_url,
        tags=content.tags,
        author_id=current_user.id,
        category_id=content.category_id,
        status=ContentStatusEnum.DRAFT
    )
    
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    
    # Reload with relationships
    db_content = db.query(Content).options(
        joinedload(Content.author),
        joinedload(Content.category)
    ).filter(Content.id == db_content.id).first()
    
    return db_content

# User-specific routes (must come before parameterized routes)
@router.get("/user/wishlist", response_model=List[ContentResponse])
def get_user_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.wishlist

@router.get("/user/likes")
def get_user_likes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's likes and dislikes"""
    try:
        likes = db.query(Like).filter(Like.user_id == current_user.id).all()
        return [
            {
                "content_id": like.content_id,
                "is_like": like.is_like,
                "created_at": like.created_at
            }
            for like in likes
        ]
    except Exception as e:
        return []

@router.get("/my-likes")
def get_my_likes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Alternative endpoint for user likes"""
    try:
        likes = db.query(Like).filter(Like.user_id == current_user.id).all()
        return [
            {
                "content_id": like.content_id,
                "is_like": like.is_like,
                "created_at": like.created_at
            }
            for like in likes
        ]
    except Exception as e:
        return []

@router.get("/{content_id}", response_model=ContentResponse)
def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db)
):
    content = db.query(Content).options(
        joinedload(Content.author),
        joinedload(Content.category)
    ).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Increment view count
    content.views_count = (content.views_count or 0) + 1
    db.commit()
    
    # Add counts
    likes_count = db.query(Like).filter(
        Like.content_id == content.id, Like.is_like == True
    ).count()
    dislikes_count = db.query(Like).filter(
        Like.content_id == content.id, Like.is_like == False
    ).count()
    comments_count = len(content.comments) if content.comments else 0
    
    # Build response
    return {
        "id": content.id,
        "title": content.title,
        "content_text": content.content_text,
        "content_type": content.content_type.value if content.content_type else "article",
        "status": content.status.value if content.status else "published",
        "media_url": content.media_url,
        "thumbnail_url": content.thumbnail_url,
        "tags": content.tags if hasattr(content, 'tags') else None,
        "views_count": content.views_count or 0,
        "created_at": content.created_at.isoformat() if content.created_at else None,
        "updated_at": content.updated_at.isoformat() if content.updated_at else None,
        "published_at": content.published_at.isoformat() if content.published_at else None,
        "author_id": content.author_id,
        "category_id": content.category_id,
        "likes_count": likes_count,
        "dislikes_count": dislikes_count,
        "comments_count": comments_count,
        "author": {
            "id": content.author.id if content.author else None,
            "username": content.author.username if content.author else "Unknown",
            "email": content.author.email if content.author else "",
            "full_name": content.author.full_name if content.author else "Unknown",
            "role": content.author.role.value if content.author and content.author.role else "user",
            "is_active": content.author.is_active if content.author else True,
            "created_at": content.author.created_at.isoformat() if content.author and content.author.created_at else None
        },
        "category": {
            "id": content.category.id if content.category else None,
            "name": content.category.name if content.category else "Uncategorized",
            "description": content.category.description if content.category else "",
            "color": content.category.color if content.category else "#3B82F6",
            "created_at": content.category.created_at.isoformat() if content.category and content.category.created_at else None,
            "created_by": content.category.created_by if content.category else None
        }
    }

@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: int,
    content_update: ContentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Only author or admin can update
    if content.author_id != current_user.id and current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this content"
        )
    
    for field, value in content_update.dict(exclude_unset=True).items():
        setattr(content, field, value)
    
    db.commit()
    db.refresh(content)
    
    # Reload with relationships
    content = db.query(Content).options(
        joinedload(Content.author),
        joinedload(Content.category)
    ).filter(Content.id == content_id).first()
    
    return content

@router.delete("/{content_id}")
def delete_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Only author or admin can delete
    if content.author_id != current_user.id and current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this content"
        )
    
    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}

@router.put("/{content_id}/approve")
def approve_content(
    content_id: int,
    current_user: User = Depends(require_tech_writer_or_admin),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.status = ContentStatusEnum.PUBLISHED
    content.published_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Content approved and published"}

@router.put("/{content_id}/reject")
def reject_content(
    content_id: int,
    current_user: User = Depends(require_tech_writer_or_admin),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.status = ContentStatusEnum.REJECTED
    db.commit()
    
    return {"message": "Content rejected"}

@router.post("/{content_id}/like")
def like_content(
    content_id: int,
    like_data: LikeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Check if user already liked/disliked this content
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.content_id == content_id
    ).first()
    
    if existing_like:
        # Update existing like/dislike
        existing_like.is_like = like_data.is_like
    else:
        # Create new like/dislike
        new_like = Like(
            user_id=current_user.id,
            content_id=content_id,
            is_like=like_data.is_like
        )
        db.add(new_like)
    
    db.commit()
    
    action = "liked" if like_data.is_like else "disliked"
    return {"message": f"Content {action} successfully"}

@router.post("/{content_id}/wishlist")
def add_to_wishlist(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if content not in current_user.wishlist:
        current_user.wishlist.append(content)
        db.commit()
        return {"message": "Content added to wishlist"}
    
    return {"message": "Content already in wishlist"}

@router.delete("/{content_id}/wishlist")
def remove_from_wishlist(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if content in current_user.wishlist:
        current_user.wishlist.remove(content)
        db.commit()
        return {"message": "Content removed from wishlist"}
    
    return {"message": "Content not in wishlist"}
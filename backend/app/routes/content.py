from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime
from app.database.connection import get_db
from app.database.models import User, Content, ContentStatusEnum, Like, Category, RoleEnum, Notification, NotificationTypeEnum, user_wishlist
from app.database.models import Comment as ContentComment
from app.schemas.schemas import ContentCreate, ContentUpdate, ContentResponse, LikeCreate
from app.core.dependencies import get_current_user, require_admin, require_tech_writer_or_admin

router = APIRouter()

@router.get("/public", response_model=List[ContentResponse])
def get_public_content(
    page: int = 1,
    limit: int = 20,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Public endpoint to fetch published content without authentication"""
    try:
        skip = (page - 1) * limit
        query = db.query(Content)
        
        if category_id:
            query = query.filter(Content.category_id == category_id)
        
        # Only show published content for public access
        query = query.filter(Content.status == ContentStatusEnum.PUBLISHED)
        query = query.filter(Content.is_flagged == False)
        
        # Sort by published_at (newest approved content first)
        query = query.order_by(desc(Content.published_at), desc(Content.created_at))
        
        # Get content with relationships loaded
        content_list = query.options(
            joinedload(Content.author),
            joinedload(Content.category)
        ).offset(skip).limit(limit).all()
        
        # Return empty list if no content found
        if not content_list:
            return []
        
        # Add counts safely (likes, dislikes, comments from DB)
        result = []
        for content in content_list:
            try:
                likes_count = db.query(Like).filter(Like.content_id == content.id, Like.is_like == True).count()
                dislikes_count = db.query(Like).filter(Like.content_id == content.id, Like.is_like == False).count()
                comments_count = db.query(ContentComment).filter(ContentComment.content_id == content.id).count()
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
                    "likes_count": likes_count,
                    "dislikes_count": dislikes_count,
                    "comments_count": comments_count,
                    "is_flagged": content.is_flagged if hasattr(content, 'is_flagged') else False,
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

@router.get("/", response_model=List[ContentResponse])
def get_content(
    page: int = 1,
    limit: int = 20,
    category_id: Optional[int] = None,
    status: Optional[ContentStatusEnum] = None,  # Remove default filter for admin
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        skip = (page - 1) * limit
        query = db.query(Content)
        
        if category_id:
            query = query.filter(Content.category_id == category_id)
        
        # Only filter by status if specified AND user is not admin
        if status and current_user.role != RoleEnum.ADMIN:
            query = query.filter(Content.status == status)
        elif not current_user or current_user.role != RoleEnum.ADMIN:
            # Non-admin users only see published content by default
            query = query.filter(Content.status == ContentStatusEnum.PUBLISHED)
        
        # Filter out flagged content for non-admin users
        if current_user.role != RoleEnum.ADMIN:
            query = query.filter(Content.is_flagged == False)
        # Admin sees ALL content regardless of status or flag
        
        # Sort content: approved content first, then by published_at (newest first)
        if current_user.role == RoleEnum.ADMIN:
            # Admin sees all content, with approved/published at top
            query = query.order_by(
                desc(Content.status == ContentStatusEnum.PUBLISHED),
                desc(Content.status == ContentStatusEnum.APPROVED),
                desc(Content.published_at),
                desc(Content.created_at)
            )
        else:
            # Regular users see published content, sorted by published_at (newest approved content first)
            query = query.order_by(desc(Content.published_at), desc(Content.created_at))
        
        # Get content with relationships loaded
        content_list = query.options(
            joinedload(Content.author),
            joinedload(Content.category)
        ).offset(skip).limit(limit).all()
        
        # Return empty list if no content found
        if not content_list:
            return []
        
        # Add counts safely (likes, dislikes, comments from DB)
        result = []
        for content in content_list:
            try:
                likes_count = db.query(Like).filter(Like.content_id == content.id, Like.is_like == True).count()
                dislikes_count = db.query(Like).filter(Like.content_id == content.id, Like.is_like == False).count()
                comments_count = db.query(ContentComment).filter(ContentComment.content_id == content.id).count()
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
                    "likes_count": likes_count,
                    "dislikes_count": dislikes_count,
                    "comments_count": comments_count,
                    "is_flagged": content.is_flagged if hasattr(content, 'is_flagged') else False,
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
        status=ContentStatusEnum.REVIEW
    )
    
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    
    # Create notification for content creator
    creator_notification = Notification(
        user_id=current_user.id,
        notification_type=NotificationTypeEnum.STATUS_CHANGE,
        title="Content Created Successfully",
        message=f"Your content '{content.title}' has been created and is now pending admin approval. You will be notified once it's reviewed.",
        related_content_id=db_content.id
    )
    db.add(creator_notification)
    
    # Create notifications for all admins
    admins = db.query(User).filter(User.role == RoleEnum.ADMIN).all()
    for admin in admins:
        admin_notification = Notification(
            user_id=admin.id,
            notification_type=NotificationTypeEnum.STATUS_CHANGE,
            title="New Content Pending Approval",
            message=f"{current_user.full_name or current_user.username} has created new content '{content.title}' that requires your approval.",
            related_content_id=db_content.id
        )
        db.add(admin_notification)
    
    db.commit()
    
    # Reload with relationships
    db_content = db.query(Content).options(
        joinedload(Content.author),
        joinedload(Content.category)
    ).filter(Content.id == db_content.id).first()
    
    return db_content

# User-specific routes (must come before parameterized routes)
@router.get("/user/{user_id}", response_model=List[ContentResponse])
def get_user_content(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get content created by a specific user"""
    try:
        # Get content by user_id
        content_list = db.query(Content).filter(Content.author_id == user_id).options(
            joinedload(Content.author),
            joinedload(Content.category)
        ).all()
        
        # Add counts and format response
        result = []
        for content in content_list:
            try:
                likes_count = db.query(Like).filter(Like.content_id == content.id, Like.is_like == True).count()
                dislikes_count = db.query(Like).filter(Like.content_id == content.id, Like.is_like == False).count()
                comments_count = db.query(ContentComment).filter(ContentComment.content_id == content.id).count()
                
                content_dict = {
                    "id": content.id,
                    "title": content.title,
                    "content_text": content.content_text,
                    "content_type": content.content_type,
                    "media_url": content.media_url,
                    "thumbnail_url": content.thumbnail_url,
                    "tags": content.tags,
                    "status": content.status,
                    "views_count": content.views_count,
                    "created_at": content.created_at,
                    "updated_at": content.updated_at,
                    "published_at": content.published_at,
                    "author_id": content.author_id,
                    "category_id": content.category_id,
                    "author": {
                        "id": content.author.id,
                        "username": content.author.username,
                        "email": content.author.email,
                        "full_name": content.author.full_name,
                        "role": content.author.role.value,
                        "is_active": content.author.is_active,
                        "created_at": content.author.created_at,
                        "bio": content.author.bio if hasattr(content.author, 'bio') else None,
                        "avatar_url": content.author.avatar_url if hasattr(content.author, 'avatar_url') else None
                    },
                    "category": {
                        "id": content.category.id,
                        "name": content.category.name,
                        "description": content.category.description,
                        "color": content.category.color,
                        "created_at": content.category.created_at,
                        "created_by": content.category.created_by
                    },
                    "likes_count": likes_count,
                    "dislikes_count": dislikes_count,
                    "comments_count": comments_count,
                    "is_flagged": getattr(content, 'is_flagged', False)
                }
                result.append(content_dict)
            except Exception as e:
                print(f"Error processing content {content.id}: {e}")
                continue
        
        return result
    except Exception as e:
        print(f"Error fetching user content: {e}")
        return []

@router.get("/user/wishlist", response_model=List[ContentResponse])
def get_user_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's wishlist with full content details"""
    try:
        # Get user's wishlist items using the association table
        from app.database.models import user_wishlist
        wishlist_content_ids = db.query(user_wishlist.c.content_id).filter(
            user_wishlist.c.user_id == current_user.id
        ).all()
        
        if not wishlist_content_ids:
            return []
        
        content_ids = [item[0] for item in wishlist_content_ids]
        
        wishlist_items = db.query(Content).filter(
            Content.id.in_(content_ids)
        ).options(
            joinedload(Content.author),
            joinedload(Content.category)
        ).all()
        
        # Format response with counts
        result = []
        for content in wishlist_items:
            try:
                likes_count = db.query(Like).filter(Like.content_id == content.id, Like.is_like == True).count()
                dislikes_count = db.query(Like).filter(Like.content_id == content.id, Like.is_like == False).count()
                comments_count = db.query(ContentComment).filter(ContentComment.content_id == content.id).count()
                
                content_dict = {
                    "id": content.id,
                    "title": content.title,
                    "content_text": content.content_text,
                    "content_type": content.content_type.value if content.content_type else "article",
                    "status": content.status.value if content.status else "published",
                    "media_url": content.media_url,
                    "thumbnail_url": content.thumbnail_url,
                    "tags": content.tags,
                    "views_count": content.views_count or 0,
                    "created_at": content.created_at.isoformat() if content.created_at else None,
                    "updated_at": content.updated_at.isoformat() if content.updated_at else None,
                    "published_at": content.published_at.isoformat() if content.published_at else None,
                    "author_id": content.author_id,
                    "category_id": content.category_id,
                    "author": {
                        "id": content.author.id if content.author else None,
                        "username": content.author.username if content.author else "Unknown",
                        "email": content.author.email if content.author else "",
                        "full_name": content.author.full_name if content.author else "Unknown",
                        "role": content.author.role.value if content.author and content.author.role else "user",
                        "is_active": content.author.is_active if content.author else True,
                        "created_at": content.author.created_at.isoformat() if content.author and content.author.created_at else None,
                        "bio": content.author.bio if hasattr(content.author, 'bio') else None,
                        "avatar_url": content.author.avatar_url if hasattr(content.author, 'avatar_url') else None
                    },
                    "category": {
                        "id": content.category.id if content.category else None,
                        "name": content.category.name if content.category else "Uncategorized",
                        "description": content.category.description if content.category else "",
                        "color": content.category.color if content.category else "#3B82F6",
                        "created_at": content.category.created_at.isoformat() if content.category and content.category.created_at else None,
                        "created_by": content.category.created_by if content.category else None
                    },
                    "likes_count": likes_count,
                    "dislikes_count": dislikes_count,
                    "comments_count": comments_count,
                    "is_flagged": getattr(content, 'is_flagged', False)
                }
                result.append(content_dict)
            except Exception as e:
                print(f"Error processing wishlist content {content.id}: {e}")
                continue
        
        return result
    except Exception as e:
        print(f"Error fetching user wishlist: {e}")
        # Return empty array instead of raising exception
        return []

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
        "is_flagged": getattr(content, 'is_flagged', False),
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
    db.refresh(content)

    # Notify content author about approval
    author_notification = Notification(
        user_id=content.author_id,
        notification_type=NotificationTypeEnum.STATUS_CHANGE,
        title="Content Approved!",
        message=f"Your content '{content.title}' has been approved and is now published. Users can now see it in the explore section.",
        related_content_id=content.id
    )
    db.add(author_notification)

    # Notify category subscribers about new content
    if content.category_id:
        category = db.query(Category).options(joinedload(Category.subscribers)).filter(Category.id == content.category_id).first()
        if category and category.subscribers:
            for subscriber in category.subscribers:
                if subscriber.id != content.author_id:
                    notification = Notification(
                        user_id=subscriber.id,
                        notification_type=NotificationTypeEnum.STATUS_CHANGE,
                        title=f"New content in {category.name}",
                        message=f"\"{content.title}\" was just published.",
                        related_content_id=content.id
                    )
                    db.add(notification)
    
    # Commit all notifications
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
    
    # Notify content author about rejection
    author_notification = Notification(
        user_id=content.author_id,
        notification_type=NotificationTypeEnum.STATUS_CHANGE,
        title="Content Rejected",
        message=f"Your content '{content.title}' has been rejected. Please review the content guidelines and try again.",
        related_content_id=content.id
    )
    db.add(author_notification)
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
    
    should_notify = False
    
    if existing_like:
        # If same action, remove the like/dislike (toggle off)
        if existing_like.is_like == like_data.is_like:
            db.delete(existing_like)
            action = "removed like" if like_data.is_like else "removed dislike"
        else:
            # Update to opposite action
            existing_like.is_like = like_data.is_like
            action = "liked" if like_data.is_like else "disliked"
            should_notify = like_data.is_like  # Only notify for likes, not dislikes
    else:
        # Create new like/dislike
        new_like = Like(
            user_id=current_user.id,
            content_id=content_id,
            is_like=like_data.is_like
        )
        db.add(new_like)
        action = "liked" if like_data.is_like else "disliked"
        should_notify = like_data.is_like  # Only notify for likes, not dislikes
    
    db.commit()
    
    # Create notification for content author (only for likes, not dislikes, and not own content)
    if should_notify and content.author_id != current_user.id:
        print(f"Creating like notification for user {content.author_id} by user {current_user.id}")
        notification = Notification(
            user_id=content.author_id,
            notification_type=NotificationTypeEnum.LIKE,
            title="Someone liked your content",
            message=f"{current_user.full_name or current_user.username} liked \"{content.title}\"",
            related_content_id=content.id
        )
        db.add(notification)
        db.commit()
        print(f"Like notification created successfully")
    else:
        print(f"Like notification not created. should_notify: {should_notify}, author_id: {content.author_id}, current_user_id: {current_user.id}")
    
    # Return updated counts
    likes_count = db.query(Like).filter(Like.content_id == content_id, Like.is_like == True).count()
    dislikes_count = db.query(Like).filter(Like.content_id == content_id, Like.is_like == False).count()
    
    return {
        "message": f"Content {action} successfully",
        "likes_count": likes_count,
        "dislikes_count": dislikes_count
    }

@router.delete("/{content_id}/like")
def remove_like(
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
    
    # Find and remove the like/dislike
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.content_id == content_id
    ).first()
    
    if not existing_like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No like/dislike found for this content"
        )
    
    db.delete(existing_like)
    db.commit()
    
    # Return updated counts
    likes_count = db.query(Like).filter(Like.content_id == content_id, Like.is_like == True).count()
    dislikes_count = db.query(Like).filter(Like.content_id == content_id, Like.is_like == False).count()
    
    return {
        "message": "Like/dislike removed successfully",
        "likes_count": likes_count,
        "dislikes_count": dislikes_count
    }

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
    
    # Check if already in wishlist using association table
    from app.database.models import user_wishlist
    existing = db.query(user_wishlist).filter(
        user_wishlist.c.user_id == current_user.id,
        user_wishlist.c.content_id == content_id
    ).first()
    
    if existing:
        return {"message": "Content already in wishlist"}
    
    # Add to wishlist
    stmt = user_wishlist.insert().values(user_id=current_user.id, content_id=content_id)
    db.execute(stmt)
    db.commit()
    
    return {"message": "Content added to wishlist"}

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
    
    # Remove from wishlist using association table
    from app.database.models import user_wishlist
    stmt = user_wishlist.delete().where(
        user_wishlist.c.user_id == current_user.id,
        user_wishlist.c.content_id == content_id
    )
    result = db.execute(stmt)
    db.commit()
    
    if result.rowcount == 0:
        return {"message": "Content not in wishlist"}
    
    return {"message": "Content removed from wishlist"}

@router.post("/{content_id}/view")
def increment_views(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Increment content view count"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Increment view count
    content.views_count += 1
    db.commit()
    
    return {
        "message": "View count incremented",
        "views_count": content.views_count
    }

@router.post("/{content_id}/flag")
def flag_content(
    content_id: int,
    flag_data: dict = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Toggle flag status
    content.is_flagged = not content.is_flagged
    db.commit()
    
    # Create notification for content author when content is flagged
    if content.is_flagged and content.author_id != current_user.id:
        reason = flag_data.get('reason', 'No reason provided') if flag_data else 'No reason provided'
        notification = Notification(
            user_id=content.author_id,
            notification_type=NotificationTypeEnum.FLAG,
            title="Content Flagged",
            message=f"Your content '{content.title}' has been flagged for review. Reason: {reason}",
            related_content_id=content.id
        )
        db.add(notification)
        db.commit()
    
    action = "flagged" if content.is_flagged else "unflagged"
    return {"message": f"Content {action} successfully", "is_flagged": content.is_flagged}

@router.post("/{content_id}/unflag")
def unflag_content(
    content_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.is_flagged = False
    db.commit()
    
    # Create notification for content author when content is unflagged
    if content.author_id != current_user.id:
        notification = Notification(
            user_id=content.author_id,
            notification_type=NotificationTypeEnum.STATUS_CHANGE,
            title="Content Unflagged",
            message=f"Your content '{content.title}' has been reviewed and unflagged. It is now visible to all users.",
            related_content_id=content.id
        )
        db.add(notification)
        db.commit()
    
    return {"message": "Content unflagged successfully"}
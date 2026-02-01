from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.models import User, Content, Comment, RoleEnum, CommentLike
from app.schemas.schemas import CommentCreate, CommentResponse
from app.core.dependencies import get_current_user

router = APIRouter()

def build_comment_tree(comments: List[Comment]) -> List[dict]:
    """Build nested comment structure"""
    comment_dict = {}
    root_comments = []
    
    # First pass: create comment objects
    for comment in comments:
        comment_data = {
            "id": comment.id,
            "text": comment.text,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "author_id": comment.author_id,
            "content_id": comment.content_id,
            "parent_id": comment.parent_id,
            "author": comment.author,
            "replies": []
        }
        comment_dict[comment.id] = comment_data
    
    # Second pass: build tree structure
    for comment in comments:
        if comment.parent_id is None:
            root_comments.append(comment_dict[comment.id])
        else:
            if comment.parent_id in comment_dict:
                comment_dict[comment.parent_id]["replies"].append(comment_dict[comment.id])
    
    return root_comments

@router.get("/content/{content_id}")
def get_content_comments(
    content_id: int,
    db: Session = Depends(get_db)
):
    from sqlalchemy.orm import joinedload
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    comments = db.query(Comment).options(joinedload(Comment.author)).filter(Comment.content_id == content_id).all()
    return build_comment_tree(comments)

@router.post("/", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify content exists
    content = db.query(Content).filter(Content.id == comment.content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # If replying to a comment, verify parent exists
    if comment.parent_id:
        parent_comment = db.query(Comment).filter(Comment.id == comment.parent_id).first()
        if not parent_comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent comment not found"
            )
        
        # Ensure parent comment belongs to the same content
        if parent_comment.content_id != comment.content_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent comment does not belong to this content"
            )
    
    db_comment = Comment(
        text=comment.text,
        author_id=current_user.id,
        content_id=comment.content_id,
        parent_id=comment.parent_id
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Create notification for content author (if not commenting on own content)
    if content.author_id != current_user.id:
        from app.database.models import Notification, NotificationTypeEnum
        notification = Notification(
            user_id=content.author_id,
            notification_type=NotificationTypeEnum.COMMENT,
            title="New comment on your content",
            message=f"{current_user.full_name or current_user.username} commented on \"{content.title}\"",
            related_content_id=content.id
        )
        db.add(notification)
    
    # If replying to a comment, notify the parent comment author
    if comment.parent_id and parent_comment.author_id != current_user.id and parent_comment.author_id != content.author_id:
        from app.database.models import Notification, NotificationTypeEnum
        notification = Notification(
            user_id=parent_comment.author_id,
            notification_type=NotificationTypeEnum.COMMENT,
            title="Reply to your comment",
            message=f"{current_user.full_name or current_user.username} replied to your comment",
            related_content_id=content.id
        )
        db.add(notification)
    
    db.commit()
    
    # Reload with relationships
    from sqlalchemy.orm import joinedload
    db_comment = db.query(Comment).options(joinedload(Comment.author)).filter(Comment.id == db_comment.id).first()
    
    return db_comment

@router.get("/{comment_id}", response_model=CommentResponse)
def get_comment(
    comment_id: int,
    db: Session = Depends(get_db)
):
    from sqlalchemy.orm import joinedload
    comment = db.query(Comment).options(joinedload(Comment.author)).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    return comment

@router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    text: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Only author or admin can update
    if comment.author_id != current_user.id and current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this comment"
        )
    
    comment.text = text
    db.commit()
    db.refresh(comment)
    
    # Reload with relationships
    from sqlalchemy.orm import joinedload
    comment = db.query(Comment).options(
        joinedload(Comment.author)
    ).filter(Comment.id == comment_id).first()
    
    return comment

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Only author or admin can delete
    if comment.author_id != current_user.id and current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}

@router.get("/{comment_id}/replies")
def get_comment_replies(
    comment_id: int,
    db: Session = Depends(get_db)
):
    parent_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not parent_comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    replies = db.query(Comment).filter(Comment.parent_id == comment_id).all()
    return replies
@router.post("/{comment_id}/like")
def like_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like or unlike a comment"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if user already liked this comment
    existing_like = db.query(CommentLike).filter(
        CommentLike.user_id == current_user.id,
        CommentLike.comment_id == comment_id
    ).first()
    
    if existing_like:
        # Unlike the comment
        db.delete(existing_like)
        action = "unliked"
    else:
        # Like the comment
        new_like = CommentLike(
            user_id=current_user.id,
            comment_id=comment_id
        )
        db.add(new_like)
        action = "liked"
    
    db.commit()
    
    # Get updated like count
    likes_count = db.query(CommentLike).filter(CommentLike.comment_id == comment_id).count()
    
    return {
        "comment_id": comment_id,
        "message": f"Comment {action} successfully",
        "likes_count": likes_count,
        "is_liked": action == "liked"
    }

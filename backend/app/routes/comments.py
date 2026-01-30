from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.models import User, Content, Comment, RoleEnum
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
            "content_text": comment.content_text,
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
        content_text=comment.content_text,
        author_id=current_user.id,
        content_id=comment.content_id,
        parent_id=comment.parent_id
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
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
    content_text: str,
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
    
    comment.content_text = content_text
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
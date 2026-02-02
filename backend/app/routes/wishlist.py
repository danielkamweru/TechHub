from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database.connection import get_db
from app.database.models import Content, User, user_wishlist
from app.schemas.schemas import ContentResponse
from app.core.dependencies import get_current_user

router = APIRouter(tags=["wishlist"])

@router.get("/", response_model=List[ContentResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Query content with all necessary relationships
        content = db.query(Content).join(user_wishlist).filter(
            user_wishlist.c.user_id == current_user.id
        ).options(
            joinedload(Content.author),
            joinedload(Content.category)
        ).all()
        
        if not content:
            return []
            
        return content
    except Exception as e:
        print(f"Error fetching wishlist: {e}")
        # Return empty list on error to prevent crashes
        return []

@router.post("/{content_id}")
def add_to_wishlist(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        # Check if already in wishlist
        existing = db.query(user_wishlist).filter(
            user_wishlist.c.user_id == current_user.id,
            user_wishlist.c.content_id == content_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Content already in wishlist")
        
        # Add to wishlist
        stmt = user_wishlist.insert().values(user_id=current_user.id, content_id=content_id)
        db.execute(stmt)
        db.commit()
        
        return {"message": "Content added to wishlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding to wishlist: {e}")
        raise HTTPException(status_code=500, detail="Failed to add to wishlist")

@router.delete("/{content_id}")
def remove_from_wishlist(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Remove from wishlist
        stmt = user_wishlist.delete().where(
            user_wishlist.c.user_id == current_user.id,
            user_wishlist.c.content_id == content_id
        )
        result = db.execute(stmt)
        db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(status_code=400, detail="Content not in wishlist")
        
        return {"message": "Content removed from wishlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error removing from wishlist: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove from wishlist")
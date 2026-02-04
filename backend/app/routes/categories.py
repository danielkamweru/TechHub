from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.models import User, Category, Notification, NotificationTypeEnum
from app.schemas.schemas import CategoryCreate, CategoryResponse
from app.core.dependencies import get_current_user, require_tech_writer_or_admin

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        categories = db.query(Category).offset(skip).limit(limit).all()
        return categories if categories else []
    except Exception as e:
        # Return empty list on any error to prevent 500
        return []

@router.post("/", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    current_user: User = Depends(require_tech_writer_or_admin),
    db: Session = Depends(get_db)
):
    # Check if category already exists
    existing_category = db.query(Category).filter(Category.name == category.name).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists"
        )
    
    db_category = Category(
        name=category.name,
        description=category.description,
        color=category.color,
        created_by=current_user.id
    )
    
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category: CategoryCreate,
    current_user: User = Depends(require_tech_writer_or_admin),
    db: Session = Depends(get_db)
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if name conflicts with existing category (excluding current one)
    existing_category = db.query(Category).filter(
        Category.name == category.name,
        Category.id != category_id
    ).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    db_category.name = category.name
    db_category.description = category.description
    db_category.color = category.color
    
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    current_user: User = Depends(require_tech_writer_or_admin),
    db: Session = Depends(get_db)
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has content
    if db_category.content and len(db_category.content) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with existing content. Please move or delete the content first."
        )
    
    db.delete(db_category)
    db.commit()
    
    return {"message": "Category deleted successfully"}

@router.post("/{category_id}/subscribe")
def subscribe_to_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    if category not in current_user.subscribed_categories:
        current_user.subscribed_categories.append(category)
        db.commit()
        
        # Notify category creator about new subscriber (if creator exists and is not the subscriber)
        if category.created_by and category.created_by != current_user.id:
            print(f"Creating subscription notification for user {category.created_by} by user {current_user.id}")
            notification = Notification(
                user_id=category.created_by,
                notification_type=NotificationTypeEnum.FOLLOW,
                title="New Category Subscriber",
                message=f"{current_user.full_name or current_user.username} subscribed to your category '{category.name}'",
                related_content_id=category.id
            )
            db.add(notification)
            db.commit()
            print(f"Subscription notification created successfully")
        else:
            print(f"Subscription notification not created. category.created_by: {category.created_by}, current_user.id: {current_user.id}")
        
        return {"message": "Subscribed to category successfully"}
    
    return {"message": "Already subscribed to this category"}

@router.delete("/{category_id}/subscribe")
def unsubscribe_from_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    if category in current_user.subscribed_categories:
        current_user.subscribed_categories.remove(category)
        db.commit()
        return {"message": "Unsubscribed from category successfully"}
    
    return {"message": "Not subscribed to this category"}

@router.get("/user/subscriptions", response_model=List[CategoryResponse])
def get_user_subscriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.subscribed_categories
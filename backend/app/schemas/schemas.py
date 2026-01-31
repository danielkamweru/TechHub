from pydantic import (
    BaseModel,
    EmailStr,
    constr,
    field_validator,
    model_validator,
)
from typing import Optional
from datetime import datetime

from app.database.models import (
    RoleEnum,
    ContentStatusEnum,
    ContentTypeEnum,
)

# =========================
# User schemas
# =========================

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: constr(min_length=8, strip_whitespace=True)
    role: Optional[RoleEnum] = RoleEnum.USER

    @field_validator("password")
    @classmethod
    def password_max_72_bytes(cls, v: str):
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: RoleEnum
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
    
    @model_validator(mode="before")
    @classmethod
    def extract_profile_data(cls, data):
        """Extract bio and avatar_url from profile relationship if present"""
        try:
            if hasattr(data, 'profile') and data.profile:
                if not hasattr(data, 'bio') or data.bio is None:
                    data.bio = data.profile.bio if data.profile.bio else None
                if not hasattr(data, 'avatar_url') or data.avatar_url is None:
                    avatar_url = data.profile.avatar_url if data.profile.avatar_url else None
                    # Convert relative URL to full URL
                    if avatar_url and avatar_url.startswith('/'):
                        avatar_url = f"http://localhost:8000{avatar_url}"
                    data.avatar_url = avatar_url
            elif isinstance(data, dict):
                # Handle dict input (from manual construction)
                if 'profile' in data and data['profile']:
                    if 'bio' not in data or data['bio'] is None:
                        data['bio'] = data['profile'].bio if hasattr(data['profile'], 'bio') and data['profile'].bio else None
                    if 'avatar_url' not in data or data['avatar_url'] is None:
                        avatar_url = data['profile'].avatar_url if hasattr(data['profile'], 'avatar_url') and data['profile'].avatar_url else None
                        # Convert relative URL to full URL
                        if avatar_url and avatar_url.startswith('/'):
                            avatar_url = f"http://localhost:8000{avatar_url}"
                        data['avatar_url'] = avatar_url
                # Also handle direct avatar_url field
                elif 'avatar_url' in data and data['avatar_url']:
                    avatar_url = data['avatar_url']
                    if avatar_url.startswith('/'):
                        data['avatar_url'] = f"http://localhost:8000{avatar_url}"
        except Exception:
            # If profile extraction fails, just use None values
            pass
        return data


# =========================
# Auth schemas
# =========================

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

    @model_validator(mode="after")
    def require_username_or_email(self):
        if not self.username and not self.email:
            raise ValueError("Either username or email must be provided")
        return self


# =========================
# Category schemas
# =========================

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#3B82F6"


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    created_by: Optional[int]

    class Config:
        from_attributes = True


# =========================
# Content schemas
# =========================

class ContentBase(BaseModel):
    title: str
    content_text: Optional[str] = None
    content_type: ContentTypeEnum = ContentTypeEnum.ARTICLE
    media_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[str] = None


class ContentCreate(ContentBase):
    category_id: int


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    content_text: Optional[str] = None
    media_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[str] = None
    category_id: Optional[int] = None


class ContentResponse(ContentBase):
    id: int
    status: ContentStatusEnum
    views_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    published_at: Optional[datetime]
    author_id: int
    category_id: int
    author: UserResponse
    category: CategoryResponse
    likes_count: int = 0
    dislikes_count: int = 0
    comments_count: int = 0

    class Config:
        from_attributes = True


# =========================
# Comment schemas
# =========================

class CommentBase(BaseModel):
    text: str


class CommentCreate(CommentBase):
    content_id: int
    parent_id: Optional[int] = None


class CommentResponse(CommentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    author_id: int
    content_id: int
    parent_id: Optional[int]
    author: UserResponse

    class Config:
        from_attributes = True


# =========================
# Like schemas
# =========================

class LikeCreate(BaseModel):
    content_id: int
    is_like: bool


class LikeResponse(BaseModel):
    id: int
    is_like: bool
    created_at: datetime
    user_id: int
    content_id: int

    class Config:
        from_attributes = True


# =========================
# Notification schemas
# =========================

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    notification_type: Optional[str] = None
    related_content_id: Optional[int] = None

    class Config:
        from_attributes = True

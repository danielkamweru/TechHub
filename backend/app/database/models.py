from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base
import enum

# Association tables for many-to-many relationships
user_categories = Table(
    'user_categories',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)

user_wishlist = Table(
    'user_wishlist',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('content_id', Integer, ForeignKey('content.id'), primary_key=True)
)

class RoleEnum(enum.Enum):
    ADMIN = "admin"
    TECH_WRITER = "tech_writer"
    USER = "user"

class ContentTypeEnum(enum.Enum):
    ARTICLE = "article"
    AUDIO = "audio"
    VIDEO = "video"
    PODCAST = "podcast"

class ContentStatusEnum(enum.Enum):
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    PUBLISHED = "published"
    REJECTED = "rejected"

class FlagReasonEnum(enum.Enum):
    INAPPROPRIATE = "inappropriate"
    SPAM = "spam"
    COPYRIGHT = "copyright"
    MISINFORMATION = "misinformation"
    OTHER = "other"

class NotificationTypeEnum(enum.Enum):
    STATUS_CHANGE = "status_change"
    COMMENT = "comment"
    LIKE = "like"
    FOLLOW = "follow"
    SYSTEM = "system"
    FLAG = "flag"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False)
    content = relationship("Content", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    likes = relationship("Like", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    subscribed_categories = relationship("Category", secondary=user_categories, back_populates="subscribers")
    wishlist = relationship("Content", secondary=user_wishlist, back_populates="wishlisted_by")

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    bio = Column(Text)
    avatar_url = Column(String)
    linkedin_url = Column(String)
    github_url = Column(String)
    twitter_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="profile")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    color = Column(String, default="#3B82F6")
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    content = relationship("Content", back_populates="category")
    subscribers = relationship("User", secondary=user_categories, back_populates="subscribed_categories")
    creator = relationship("User")

class Content(Base):
    __tablename__ = "content"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subtitle = Column(String)  # Added subtitle field for blogs
    content_text = Column(Text)
    content_type = Column(Enum(ContentTypeEnum), nullable=False)
    status = Column(Enum(ContentStatusEnum), default=ContentStatusEnum.DRAFT)
    media_url = Column(String)  # For audio/video files
    thumbnail_url = Column(String)
    tags = Column(String)  # Comma-separated tags
    author_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    likes_count = Column(Integer, default=0)
    dislikes_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    is_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True))
    
    author = relationship("User", back_populates="content")
    category = relationship("Category", back_populates="content")
    comments = relationship("Comment", back_populates="content")
    likes = relationship("Like", back_populates="content")
    wishlisted_by = relationship("User", secondary=user_wishlist, back_populates="wishlist")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    parent_id = Column(Integer, ForeignKey("comments.id"))  # For nested comments
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    content = relationship("Content", back_populates="comments")
    author = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id])
    replies = relationship("Comment", overlaps="parent")

class Like(Base):
    __tablename__ = "likes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content_id = Column(Integer, ForeignKey("content.id"))
    is_like = Column(Boolean)  # True for like, False for dislike
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="likes")
    content = relationship("Content", back_populates="likes")

class CommentLike(Base):
    __tablename__ = "comment_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    comment_id = Column(Integer, ForeignKey("comments.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
    comment = relationship("Comment")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    notification_type = Column(Enum(NotificationTypeEnum), default=NotificationTypeEnum.STATUS_CHANGE)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    related_content_id = Column(Integer, ForeignKey("content.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="notifications")
    
    @property
    def notification_type_str(self):
        return self.notification_type.value if self.notification_type else None

class ContentFlag(Base):
    __tablename__ = "content_flags"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content.id"), nullable=False)
    flagged_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Enum(FlagReasonEnum), nullable=False)
    description = Column(Text)
    is_resolved = Column(Boolean, default=False)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
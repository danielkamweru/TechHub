#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.database import get_db
from app.database.models import Content, ContentStatusEnum, ContentTypeEnum
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DATABASE_URL'))
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Create 3 more unpublished content items
unpublished_content = [
    {
        'title': 'Advanced React Patterns',
        'description': 'Learn advanced React patterns for scalable applications',
        'content_type': ContentTypeEnum.VIDEO,
        'status': ContentStatusEnum.DRAFT,
        'author_id': 2,
        'category_id': 2,
        'url': 'https://www.youtube.com/watch?v=example1'
    },
    {
        'title': 'Docker Best Practices',
        'description': 'Best practices for Docker containerization',
        'content_type': ContentTypeEnum.ARTICLE,
        'status': ContentStatusEnum.REVIEW,
        'author_id': 2,
        'category_id': 3,
        'url': 'https://example.com/docker-best-practices'
    },
    {
        'title': 'GraphQL vs REST API',
        'description': 'Comparison between GraphQL and REST APIs',
        'content_type': ContentTypeEnum.PODCAST,
        'status': ContentStatusEnum.REJECTED,
        'author_id': 2,
        'category_id': 1,
        'url': 'https://example.com/graphql-vs-rest-podcast'
    }
]

for content_data in unpublished_content:
    content = Content(**content_data)
    db.add(content)

db.commit()
db.close()
print('Created 3 unpublished content items')
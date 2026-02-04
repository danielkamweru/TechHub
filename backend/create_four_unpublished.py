#!/usr/bin/env python3
"""
Create 4 unpublished content items: 3 videos and 1 article
Using existing content and proper database connections
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import get_db
from app.database.models import Content, ContentStatusEnum, ContentTypeEnum, User, Category
from sqlalchemy.orm import Session
from datetime import datetime

def create_unpublished_content():
    """Create 3 videos and 1 article with DRAFT status"""
    
    # Get database session
    db_gen = get_db()
    db = next(db_gen)
    
    try:
        # Get a user for author (use first available user)
        author = db.query(User).first()
        if not author:
            print("No users found in database")
            return False
        
        # Get categories for content
        categories = db.query(Category).all()
        if len(categories) < 3:
            print("Need at least 3 categories")
            return False
        
        # Create 3 videos and 1 article with DRAFT status
        unpublished_content = [
            {
                'title': 'Advanced React Patterns: Compound Components',
                'subtitle': 'Learn how to build flexible React components using compound patterns',
                'content_text': 'In this comprehensive video, we explore advanced React patterns that will take your development skills to the next level. Compound components allow you to create flexible and reusable component APIs that are easy to use and maintain. We\'ll cover practical examples including building a custom accordion component, creating flexible form components, and implementing context-aware patterns. You\'ll learn when to use compound components vs render props, how to manage state effectively, and best practices for component composition.',
                'content_type': ContentTypeEnum.VIDEO,
                'status': ContentStatusEnum.DRAFT,
                'author_id': author.id,
                'category_id': categories[0].id,
                'media_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url': 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                'tags': 'react, patterns, components, frontend, advanced'
            },
            {
                'title': 'Docker Containerization Best Practices',
                'subtitle': 'Production-ready Docker workflows and optimization techniques',
                'content_text': 'Master Docker containerization with this in-depth tutorial covering production best practices. Learn how to write efficient Dockerfiles using multi-stage builds, optimize image sizes, implement proper security measures, and set up Docker Compose for development environments. We\'ll explore real-world scenarios including microservices deployment, CI/CD integration, health checks, logging strategies, and monitoring. By the end of this video, you\'ll have the skills to containerize applications like a pro.',
                'content_type': ContentTypeEnum.VIDEO,
                'status': ContentStatusEnum.DRAFT,
                'author_id': author.id,
                'category_id': categories[1].id,
                'media_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url': 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                'tags': 'docker, containers, devops, production, best practices'
            },
            {
                'title': 'Python Performance Optimization Techniques',
                'subtitle': 'Make your Python code run faster with these proven strategies',
                'content_text': 'Discover powerful Python optimization techniques in this detailed video tutorial. Learn profiling tools to identify bottlenecks, understand CPython internals, use caching strategies effectively, implement lazy loading patterns, and leverage built-in optimization features. We\'ll cover real-world examples including web application optimization, data processing pipelines, and memory management. You\'ll also learn about Cython, PyPy, and when to use compiled extensions for maximum performance.',
                'content_type': ContentTypeEnum.VIDEO,
                'status': ContentStatusEnum.DRAFT,
                'author_id': author.id,
                'category_id': categories[2].id,
                'media_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url': 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                'tags': 'python, performance, optimization, programming, speed'
            },
            {
                'title': 'Microservices Architecture: Design Patterns and Implementation',
                'subtitle': 'Complete guide to building scalable microservices systems',
                'content_text': 'Microservices architecture has become the standard for building scalable, resilient applications. This comprehensive article covers everything you need to know about designing, implementing, and maintaining microservices systems. Learn about service decomposition strategies, inter-service communication patterns, data consistency approaches, service discovery, load balancing, circuit breakers, and distributed tracing. We\'ll explore practical implementation using modern tools and frameworks, discuss common pitfalls and how to avoid them, and provide real-world case studies from successful microservices deployments.',
                'content_type': ContentTypeEnum.ARTICLE,
                'status': ContentStatusEnum.DRAFT,
                'author_id': author.id,
                'category_id': categories[0].id,
                'tags': 'microservices, architecture, design patterns, scalability, distributed systems'
            }
        ]
        
        # Create the content items
        created_items = []
        for content_data in unpublished_content:
            content = Content(**content_data)
            db.add(content)
            created_items.append(content_data['title'])
        
        # Commit to database
        db.commit()
        
        print(f"Successfully created {len(unpublished_content)} unpublished content items:")
        for i, title in enumerate(created_items, 1):
            print(f"  {i}. {title}")
        
        print(f"\nAll items set to DRAFT status (unpublished)")
        return True
        
    except Exception as e:
        print(f"Error creating content: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = create_unpublished_content()
    if success:
        print("\nUnpublished content creation completed!")
    else:
        print("\nUnpublished content creation failed!")

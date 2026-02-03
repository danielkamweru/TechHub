from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User, Category, Content, RoleEnum, ContentTypeEnum, ContentStatusEnum

SEED_CONTENT = [
    # Full-Stack Videos
    {"title": "Full Stack Web Development in 2026: Direct roadmap covering the modern stack", "category": "Full-Stack", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=nu_pCVPKzTk", "description": "Complete roadmap for full-stack development in 2026", "thumbnail": "https://img.youtube.com/vi/nu_pCVPKzTk/maxresdefault.jpg"},
    {"title": "Building a Full Stack App from Scratch: High-level architectural walkthrough", "category": "Full-Stack", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=ngc9gnGgUdA", "description": "Architectural walkthrough for building full-stack applications", "thumbnail": "https://img.youtube.com/vi/ngc9gnGgUdA/maxresdefault.jpg"},
    
    # Full-Stack Podcasts
    {"title": "The Changelog – What Developers Miss About Full-Stack Engineering", "category": "Full-Stack", "type": "PODCAST", "url": "https://changelog.com/podcast/469", "description": "Discussion on what developers miss about full-stack engineering", "thumbnail": "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "Syntax FM - Full Stack Development", "category": "Full-Stack", "type": "PODCAST", "url": "https://syntax.fm", "description": "Full stack development discussions and tips", "thumbnail": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format&q=80"},
    
    # Full-Stack Blogs
    {"title": "Modern Full-Stack Development: From Monolith to Microservices", "subtitle": "A comprehensive guide to modern architecture patterns", "category": "Full-Stack", "type": "ARTICLE", "url": "", "description": "A comprehensive guide to understanding the evolution of full-stack development architectures. Learn when to use monoliths vs microservices, and explore modern tools like Docker, Kubernetes, and serverless platforms.", "thumbnail": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "The Complete Guide to Full-Stack Testing Strategies", "subtitle": "Master testing methodologies for robust applications", "category": "Full-Stack", "type": "ARTICLE", "url": "", "description": "Master testing methodologies for full-stack applications including unit testing, integration testing, E2E testing, and performance testing. Learn about Jest, Cypress, and other essential testing frameworks.", "thumbnail": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop&auto=format&q=80"},
    
    # Front-End Videos
    {"title": "React vs Next.js – Which Should You Learn?", "category": "Front-End", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=KjY94sAKLlw", "description": "Comparison between React and Next.js frameworks", "thumbnail": "https://img.youtube.com/vi/KjY94sAKLlw/maxresdefault.jpg"},
    {"title": "Modern CSS: Container Queries & Web Components", "category": "Front-End", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=Zddz_R1RnfM", "description": "Learn modern CSS features including container queries", "thumbnail": "https://img.youtube.com/vi/Zddz_R1RnfM/maxresdefault.jpg"},
    
    # Front-End Podcasts
    {"title": "ShopTalk Show – The State of CSS (Episode 540)", "category": "Front-End", "type": "PODCAST", "url": "https://shoptalkshow.com/540/", "description": "Discussion on the current state of CSS", "thumbnail": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "Syntax.fm – Modern Front-End Tooling", "category": "Front-End", "type": "PODCAST", "url": "https://syntax.fm/show/659/modern-frontend-tooling", "description": "Modern tooling for front-end development", "thumbnail": "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=225&fit=crop&auto=format&q=80"},
    
    # Front-End Blogs
    {"title": "Advanced React Patterns: Building Scalable Component Architectures", "subtitle": "Master modern React design patterns and best practices", "category": "Front-End", "type": "ARTICLE", "url": "", "description": "Explore advanced React patterns including compound components, render props, custom hooks, and context API. Learn how to build maintainable and scalable React applications with modern best practices.", "thumbnail": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "CSS Grid and Flexbox: The Ultimate Guide to Modern Layouts", "subtitle": "Create responsive layouts without frameworks", "category": "Front-End", "type": "ARTICLE", "url": "", "description": "Master modern CSS layout techniques with Grid and Flexbox. Learn practical examples, responsive design patterns, and how to create complex layouts without frameworks.", "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop&auto=format&q=80"},
    
    # DevOps Videos
    {"title": "DevOps Roadmap 2026 – Linux to Kubernetes", "category": "DevOps", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=9pZ2xmsSDdo", "description": "Complete DevOps roadmap from Linux to Kubernetes", "thumbnail": "https://img.youtube.com/vi/9pZ2xmsSDdo/maxresdefault.jpg"},
    {"title": "CI/CD Explained for Beginners", "category": "DevOps", "type": "VIDEO", "url": "https://www.youtube.com/watch?v=scEDHsr3APg", "description": "Beginner-friendly explanation of CI/CD concepts", "thumbnail": "https://img.youtube.com/vi/scEDHsr3APg/maxresdefault.jpg"},
    
    # DevOps Podcasts
    {"title": "The Changelog – CI/CD Is a Culture Problem", "category": "DevOps", "type": "PODCAST", "url": "https://changelog.com/podcast/453", "description": "Discussion on CI/CD as a cultural challenge", "thumbnail": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "DevOps and Docker Talk", "category": "DevOps", "type": "PODCAST", "url": "https://podcast.bretfisher.com/", "description": "DevOps and Docker discussions", "thumbnail": "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=225&fit=crop"},
    
    # DevOps Blogs
    {"title": "Infrastructure as Code: Terraform Best Practices and Patterns", "subtitle": "Master cloud infrastructure automation with Terraform", "category": "DevOps", "type": "ARTICLE", "url": "", "description": "Learn Infrastructure as Code principles with Terraform. Discover best practices for writing maintainable, scalable infrastructure code, including modules, state management, and multi-cloud strategies.", "thumbnail": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "Container Orchestration with Kubernetes: A Production Guide", "subtitle": "Deploy and manage containerized applications at scale", "category": "DevOps", "type": "ARTICLE", "url": "", "description": "Complete guide to running Kubernetes in production. Cover deployment strategies, monitoring, scaling, security best practices, and troubleshooting common issues in distributed systems.", "thumbnail": "https://images.unsplash.com/photo-1668091257030-6b6c5d4a16b2?w=400&h=225&fit=crop&auto=format&q=80"},
    
    # Backend Blogs
    {"title": "Microservices Architecture: Design Patterns and Best Practices", "subtitle": "Build scalable distributed systems with confidence", "category": "Back-End", "type": "ARTICLE", "url": "", "description": "Comprehensive guide to microservices architecture. Learn about service discovery, API gateways, circuit breakers, distributed tracing, and strategies for managing complex distributed systems.", "thumbnail": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop&auto=format&q=80"},
    {"title": "Database Design Patterns: Scaling from SQL to NoSQL", "subtitle": "Master database architecture for modern applications", "category": "Back-End", "type": "ARTICLE", "url": "", "description": "Master database design patterns for modern applications. Explore SQL vs NoSQL trade-offs, indexing strategies, sharding techniques, and when to use different database technologies.", "thumbnail": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop&auto=format&q=80"},
    
]

def seed_database():
    db = next(get_db())
    
    try:
        # Create categories
        categories = ["Full-Stack", "Front-End", "DevOps", "Back-End"]
        category_objects = {}
        
        for cat_name in categories:
            existing_cat = db.query(Category).filter(Category.name == cat_name).first()
            if not existing_cat:
                category = Category(name=cat_name, description=f"{cat_name} development content")
                db.add(category)
                db.commit()
                db.refresh(category)
                category_objects[cat_name] = category
            else:
                category_objects[cat_name] = existing_cat
        
        # Get admin user
        admin_user = db.query(User).filter(User.email == "admin@techhub.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@techhub.com",
                username="admin",
                full_name="Admin User",
                hashed_password="simple_hash",
                role=RoleEnum.ADMIN,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        
        # Create content
        for item in SEED_CONTENT:
            # Use a simpler query that doesn't require tags column
            existing_content = db.query(Content).filter(Content.title == item["title"]).first()
            if not existing_content:
                content_type = ContentTypeEnum.VIDEO if item["type"] == "VIDEO" else \
                              ContentTypeEnum.PODCAST if item["type"] == "PODCAST" else \
                              ContentTypeEnum.ARTICLE
                
                # Set status to 'review' for articles (blogs) so they need approval, 'published' for others
                status = ContentStatusEnum.REVIEW if content_type == ContentTypeEnum.ARTICLE else ContentStatusEnum.PUBLISHED
                
                content = Content(
                    title=item["title"],
                    subtitle=item.get("subtitle", ""),  # Add subtitle field
                    content_text=item["description"],
                    content_type=content_type,
                    media_url=item["url"],
                    thumbnail_url=item["thumbnail"],
                    status=status,
                    author_id=admin_user.id,
                    category_id=category_objects[item["category"]].id,
                    views_count=0
                )
                db.add(content)
        
        db.commit()
        print(f"Successfully seeded {len(SEED_CONTENT)} content items")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
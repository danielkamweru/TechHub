#!/usr/bin/env python3
"""
Update articles with truly unique content structures and eliminate repetitive patterns
"""
import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """Get database connection from environment"""
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        import re
        match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', database_url)
        if match:
            username, password, host, port, dbname = match.groups()
            return psycopg2.connect(
                host=host, port=port, database=dbname, user=username, password=password
            )
    
    return psycopg2.connect(
        host='localhost', port=5432, database='techhub', user='postgres', password='password'
    )

def update_articles_with_diverse_content():
    """Update articles with diverse content structures"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get current articles
        cursor.execute("""
            SELECT id, title, content_text, category_id 
            FROM content 
            WHERE content_type = 'ARTICLE' 
            ORDER BY id
        """)
        articles = cursor.fetchall()
        
        # Define articles with completely different structures and content
        diverse_articles = [
            {
                "id": articles[0][0],  # React Hooks
                "title": "React Hooks Deep Dive: From Basics to Advanced Patterns",
                "content_text": "React Hooks introduced a paradigm shift in functional components. Starting with useState, you can manage component state without class syntax. The useEffect hook handles side effects like API calls and subscriptions. Custom hooks allow you to extract and share stateful logic between components. For complex state management, useReducer provides a Redux-like pattern. Performance optimization comes from useMemo and useCallback, which prevent unnecessary re-renders. The useRef hook enables direct DOM manipulation and persistent values. Context API combined with useContext eliminates prop drilling. Advanced patterns include useImperativeHandle for parent component communication, useLayoutEffect for synchronous DOM updates, and custom hooks for API integration, form handling, and local storage management."
            },
            {
                "id": articles[1][0],  # Python Backend
                "title": "FastAPI Backend Architecture: Building Production-Ready APIs",
                "content_text": "FastAPI revolutionizes Python backend development with automatic OpenAPI documentation and type hints. Begin with basic route definitions using @app.get() and @app.post() decorators. Pydantic models handle request/response validation automatically. Dependency injection system manages database connections, authentication, and cross-cutting concerns. Async/await patterns enable high-performance concurrent request handling. SQLAlchemy ORM integrates seamlessly for database operations. JWT authentication secures your endpoints with middleware. Background tasks handle long-running operations without blocking responses. WebSocket support enables real-time features. CORS configuration handles cross-origin requests. Error handling with HTTPException provides clear API responses. Testing with TestClient ensures reliability. Docker containerization simplifies deployment. Advanced features include GraphQL integration, rate limiting, and API versioning."
            },
            {
                "id": articles[2][0],  # DevOps
                "title": "Modern DevOps Workflow: From Code to Production",
                "content_text": "DevOps bridges development and operations through automation and collaboration. Containerization with Docker packages applications with dependencies, ensuring consistency across environments. Multi-stage builds optimize image sizes and security. Kubernetes orchestrates containers at scale with self-healing, load balancing, and rolling updates. Infrastructure as Code using Terraform manages cloud resources declaratively. CI/CD pipelines with GitHub Actions automate testing, building, and deployment. Blue-green deployments enable zero-downtime releases. Monitoring with Prometheus collects metrics, while Grafana creates dashboards. Logging with ELK stack centralizes log analysis. Security scanning in pipelines identifies vulnerabilities early. GitOps workflows use Git as the single source of truth for infrastructure. Configuration management with Ansible automates server setup. Network policies and service meshes secure microservice communication. Backup strategies and disaster recovery ensure business continuity."
            },
            {
                "id": articles[3][0],  # Machine Learning
                "title": "Production Machine Learning: From Model Training to Deployment",
                "content_text": "Deploying machine learning models requires robust MLOps practices. Model training begins with data preprocessing, feature engineering, and experiment tracking using MLflow. Model versioning manages different iterations and enables rollback. A/B testing compares model performance in production. Containerization with Docker packages models with dependencies and serving code. Kubernetes scales model inference horizontally. FastAPI serves model predictions through REST endpoints with automatic documentation. Real-time monitoring detects model drift and performance degradation. Automated retraining pipelines update models with fresh data. Feature stores maintain consistent feature engineering between training and inference. Model explainability tools like SHAP provide interpretability. Security measures protect sensitive training data and predictions. Batch processing handles large-scale offline predictions. Edge deployment brings models closer to users for lower latency. Compliance with regulations ensures ethical AI practices."
            },
            {
                "id": articles[4][0],  # Security
                "title": "Web Application Security: Defense Against Modern Threats",
                "content_text": "Web security requires defense-in-depth across all application layers. Frontend security starts with Content Security Policy headers preventing XSS attacks. Input validation and sanitization protect against injection attacks. CSRF tokens prevent cross-site request forgery. HTTPS encryption secures data in transit using TLS. Backend security involves JWT tokens for stateless authentication. Rate limiting prevents brute force attacks and abuse. SQL injection prevention uses parameterized queries and ORM. Password hashing with bcrypt protects user credentials. Session management with secure cookies prevents session hijacking. API gateways provide centralized security policies. OAuth 2.0 enables secure third-party integrations. Database encryption protects sensitive data at rest. Regular security audits and penetration testing identify vulnerabilities. Dependency scanning detects known security issues in libraries. Compliance with GDPR and CCPA ensures privacy regulations are met. Web Application Firewalls provide additional protection against common attacks."
            },
            {
                "id": articles[5][0],  # AWS Cloud
                "title": "AWS Cloud Architecture: Scalable Infrastructure Design",
                "content_text": "AWS provides comprehensive cloud services for modern applications. EC2 instances provide virtual computing capacity with auto-scaling groups handling traffic spikes. Elastic Load Balancers distribute traffic across multiple instances. CloudFront CDN delivers content globally with low latency. S3 stores objects with lifecycle policies for cost optimization. RDS managed databases handle scaling, backups, and patching automatically. DynamoDB offers NoSQL database services with single-digit millisecond performance. Lambda enables serverless computing with automatic scaling and pay-per-use pricing. API Gateway creates, publishes, and secures APIs. CloudFormation manages infrastructure as code with reusable templates. Secrets Manager securely stores credentials and API keys. CloudWatch monitors resources and applications with custom metrics and alarms. VPC provides isolated network environments with security groups and NACLs. ECS and EKS orchestrate containers at scale. SQS and SNS enable message queuing and pub/sub messaging. IAM provides fine-grained access control following least privilege principle."
            },
            {
                "id": articles[6][0],  # JavaScript Frontend
                "title": "Modern JavaScript Ecosystem: Tools and Best Practices",
                "content_text": "JavaScript development has evolved with powerful tools and frameworks. ES6+ features include arrow functions for concise syntax, destructuring for easy data extraction, and template literals for better string handling. Async/await simplifies asynchronous code compared to promises. Modules organize code with import/export statements. Build tools like Webpack bundle and optimize assets, while Vite offers faster development with native ES modules. Package managers npm and yarn handle dependencies efficiently. TypeScript adds static typing for better development experience and error prevention. Testing frameworks like Jest and Cypress ensure code quality. Linting with ESLint maintains code consistency. Frontend frameworks like React use component-based architecture with virtual DOM for performance. Vue offers progressive framework adoption with excellent documentation. Angular provides comprehensive solutions with TypeScript integration. Progressive Web Apps work offline with service workers. Performance optimization includes code splitting, lazy loading, and tree shaking. Accessibility ensures applications work for all users with ARIA standards and semantic HTML."
            },
            {
                "id": articles[7][0],  # Database
                "title": "Database Design Mastery: From SQL to NoSQL and Beyond",
                "content_text": "Database design forms the foundation of scalable applications. SQL databases like PostgreSQL provide ACID compliance with strong consistency. Proper indexing strategies accelerate query performance dramatically. Normalization reduces data redundancy and prevents anomalies. Transactions ensure data integrity with atomic operations. Connection pooling optimizes database connection management. NoSQL databases like MongoDB offer flexible schemas for rapid development. Redis provides in-memory caching for sub-millisecond response times. Database replication creates read replicas for scaling read operations. Sharding distributes data across multiple servers for horizontal scaling. Backup strategies include point-in-time recovery and cross-region replication. Monitoring tools track query performance and resource usage. Migration tools like Alembic manage schema changes safely. ORM frameworks like SQLAlchemy abstract SQL while maintaining performance. Distributed databases handle global scale with eventual consistency. Data warehousing solutions support analytics and business intelligence. Graph databases excel at relationship-heavy data. Search engines like Elasticsearch provide full-text search capabilities."
            }
        ]
        
        # Update each article
        updated_count = 0
        for article_data in diverse_articles:
            update_sql = """
                UPDATE content 
                SET title = %s, content_text = %s 
                WHERE id = %s
            """
            cursor.execute(update_sql, (
                article_data["title"],
                article_data["content_text"],
                article_data["id"]
            ))
            
            updated_count += 1
            print(f"Updated article ID {article_data['id']}: {article_data['title'][:50]}...")
        
        conn.commit()
        print(f"\nSuccessfully updated {updated_count} articles with diverse content structures!")
        return True
        
    except Exception as e:
        print(f"Error updating articles: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    success = update_articles_with_diverse_content()
    if success:
        print("Article diversification completed!")
    else:
        print("Article diversification failed!")

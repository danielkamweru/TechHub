#!/usr/bin/env python3
"""
Create 8 new articles with proper content (no URLs) - fixed version
"""
import psycopg2
import os
from dotenv import load_dotenv
from datetime import datetime

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

def create_articles():
    """Create 8 new articles with proper content"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user ID for content author
        cursor.execute("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1")
        author_result = cursor.fetchone()
        if not author_result:
            print(" No admin user found")
            return False
        author_id = author_result[0]
        
        # Get category ID for Tech Blogs
        cursor.execute("SELECT id FROM categories WHERE name = 'Tech Blogs' LIMIT 1")
        category_result = cursor.fetchone()
        if not category_result:
            print(" Tech Blogs category not found")
            return False
        category_id = category_result[0]
        
        articles = [
            {
                "title": "Getting Started with React Hooks: A Comprehensive Guide",
                "subtitle": "Master modern React development with Hooks",
                "content_text": "React Hooks revolutionized the way we write React components. This guide covers useState, useEffect, and custom hooks. Learn how to use useState for state management, useEffect for side effects, and create custom hooks for reusable logic. Best practices include calling Hooks only at the top level and keeping them focused and reusable.",
                "tags": "react, hooks, javascript, frontend, web development"
            },
            {
                "title": "Python Best Practices: Writing Clean and Maintainable Code",
                "subtitle": "Essential guidelines for professional Python development",
                "content_text": "Writing clean, maintainable Python code is crucial for long-term project success. Follow PEP 8 guidelines: use 4 spaces for indentation, limit lines to 79 characters, use snake_case for variables and functions. Write clear docstrings for all functions, handle specific exceptions rather than broad ones, and use list comprehensions instead of loops for better performance.",
                "tags": "python, best practices, clean code, programming, software development"
            },
            {
                "title": "Understanding Docker Containers: From Basics to Production",
                "subtitle": "Complete guide to containerization with Docker",
                "content_text": "Docker has revolutionized how we develop, ship, and run applications. Docker provides consistency across environments, portability, efficiency, and isolation. Learn basic Dockerfile syntax, essential commands like docker build and docker run, and use Docker Compose for multi-container applications. Production best practices include using specific image tags, running containers as non-root users, and implementing proper security measures.",
                "tags": "docker, containers, devops, deployment, cloud native"
            },
            {
                "title": "Machine Learning Fundamentals: Understanding Neural Networks",
                "subtitle": "Deep dive into artificial neural networks and deep learning",
                "content_text": "Neural networks are the foundation of modern machine learning and AI. They consist of input layers, hidden layers, and output layers. Learn about perceptrons as building blocks, activation functions like ReLU and sigmoid, and implement neural networks using TensorFlow/Keras. Key takeaways: start with simple architectures, understand the mathematics behind backpropagation, practice regularly, and stay updated with rapid field developments.",
                "tags": "machine learning, neural networks, deep learning, AI, python"
            },
            {
                "title": "Web Security Essentials: Protecting Modern Applications",
                "subtitle": "Complete guide to web application security best practices",
                "content_text": "Web security is critical for protecting applications and user data. Prevent SQL injection using parameterized queries, stop XSS attacks by escaping output, implement secure password hashing with bcrypt, and use JWT for authentication. Validate all user input, implement security headers, and use rate limiting to prevent abuse. Key principles: never trust user input, use HTTPS, keep dependencies updated, and monitor for threats.",
                "tags": "security, web development, cybersecurity, best practices, protection"
            },
            {
                "title": "Cloud Computing with AWS: Essential Services and Architecture",
                "subtitle": "Master Amazon Web Services for scalable cloud solutions",
                "content_text": "AWS provides a comprehensive cloud computing platform. Core services include EC2 for virtual servers, Lambda for serverless computing, S3 for object storage, and DynamoDB for NoSQL databases. Use CloudFormation for infrastructure as code, implement proper security with IAM roles, and optimize costs by choosing appropriate instance types. Design for scalability with Auto Scaling and load balancing.",
                "tags": "aws, cloud computing, infrastructure, devops, scalability"
            },
            {
                "title": "Advanced JavaScript: Modern ES6+ Features and Patterns",
                "subtitle": "Master modern JavaScript with ES6+ features and best practices",
                "content_text": "JavaScript has evolved significantly with ES6+ features. Use arrow functions for concise syntax and lexical this binding, master destructuring for cleaner code, leverage template literals for better string handling, and embrace async/await for cleaner asynchronous code. Use ES6 modules for better code organization and apply functional programming patterns for more predictable code.",
                "tags": "javascript, es6, programming, web development, frontend"
            },
            {
                "title": "Database Design Patterns: Scaling from SQL to NoSQL",
                "subtitle": "Complete guide to modern database architecture and optimization",
                "content_text": "Database design is crucial for application performance and scalability. Understand normalization vs denormalization, implement proper indexing strategies, and use connection pooling for better performance. Learn when to use SQL vs NoSQL databases, implement caching with Redis, and design for horizontal scaling. Key concepts include ACID properties, CAP theorem, and eventual consistency in distributed systems.",
                "tags": "database, sql, nosql, architecture, performance, scaling"
            }
        ]
        
        # Insert articles
        for i, article in enumerate(articles):
            sql = "INSERT INTO content (title, subtitle, content_text, content_type, status, author_id, category_id, tags, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"
            values = (
                article["title"],
                article["subtitle"],
                article["content_text"],
                "ARTICLE",
                "REVIEW",
                author_id,
                category_id,
                article["tags"],
                datetime.utcnow()
            )
            
            cursor.execute(sql, values)
            article_id = cursor.fetchone()[0]
            print(f" Created article {i+1}: {article['title']} (ID: {article_id})")
        
        conn.commit()
        print(f"\n Successfully created {len(articles)} articles!")
        return True
        
    except Exception as e:
        print(f" Error creating articles: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    success = create_articles()
    if success:
        print(" Article creation completed!")
    else:
        print(" Article creation failed!")
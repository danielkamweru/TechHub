#!/usr/bin/env python3
"""
Update existing articles with unique cover photos
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

def update_article_thumbnails():
    """Update existing articles with unique cover photos"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all articles
        cursor.execute("""
            SELECT id, title, content_type, thumbnail_url 
            FROM content 
            WHERE content_type = 'ARTICLE' 
            ORDER BY id
        """)
        articles = cursor.fetchall()
        
        print(f"Found {len(articles)} articles to update")
        
        # Define unique cover photos for each article based on topic
        unique_thumbnails = [
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop&auto=format&q=80",  # React Hooks - coding
            "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop&auto=format&q=80",  # Python - professional coding
            "https://images.unsplash.com/photo-1607952586088-4b4d8b2a4f2b?w=800&h=400&fit=crop&auto=format&q=80",  # Docker - containers
            "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&auto=format&q=80",  # Machine Learning - AI/ML
            "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop&auto=format&q=80",  # Security - cybersecurity
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop&auto=format&q=80",  # AWS - cloud
            "https://images.unsplash.com/photo-1579403124614-197f69d8187b?w=800&h=400&fit=crop&auto=format&q=80",  # JavaScript - modern coding
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop&auto=format&q=80",  # Database - data architecture
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&auto=format&q=80",  # Additional - web dev
            "https://images.unsplash.com/photo-1504639725590-78a6c8a9e068?w=800&h=400&fit=crop&auto=format&q=80",  # Additional - tech
        ]
        
        # Update each article with a unique thumbnail
        updated_count = 0
        for i, article in enumerate(articles):
            article_id = article[0]
            title = article[1]
            current_thumbnail = article[3]
            
            # Use unique thumbnail based on index, cycle if more articles than thumbnails
            thumbnail_url = unique_thumbnails[i % len(unique_thumbnails)]
            
            # Update the article
            update_sql = "UPDATE content SET thumbnail_url = %s WHERE id = %s"
            cursor.execute(update_sql, (thumbnail_url, article_id))
            
            print(f"Updated article '{title[:50]}...' with thumbnail: {thumbnail_url}")
            updated_count += 1
        
        conn.commit()
        print(f"\nSuccessfully updated {updated_count} articles with unique cover photos!")
        return True
        
    except Exception as e:
        print(f"Error updating article thumbnails: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    success = update_article_thumbnails()
    if success:
        print("Article thumbnail update completed!")
    else:
        print("Article thumbnail update failed!")

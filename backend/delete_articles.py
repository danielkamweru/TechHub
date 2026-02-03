#!/usr/bin/env python3
"""
Delete all existing articles from database
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
        # Parse DATABASE_URL: postgresql://username:password@localhost:5432/dbname
        import re
        match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', database_url)
        if match:
            username, password, host, port, dbname = match.groups()
            return psycopg2.connect(
                host=host,
                port=port,
                database=dbname,
                user=username,
                password=password
            )
    
    # Fallback to default PostgreSQL settings
    return psycopg2.connect(
        host='localhost',
        port=5432,
        database='techhub',
        user='postgres',
        password='password'
    )

def delete_articles():
    """Delete all articles from the database"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First check how many articles exist
        cursor.execute("SELECT COUNT(*) FROM content WHERE content_type = 'blog'")
        article_count = cursor.fetchone()[0]
        print(f"📊 Found {article_count} articles in database")
        
        if article_count == 0:
            print("✅ No articles to delete")
            return True
        
        # Get article details before deletion
        cursor.execute("SELECT id, title FROM content WHERE content_type = 'blog'")
        articles = cursor.fetchall()
        print("📝 Articles to be deleted:")
        for article in articles:
            print(f"   - ID: {article[0]}, Title: {article[1]}")
        
        # Delete related notifications first
        cursor.execute("""
            DELETE FROM notifications 
            WHERE related_content_id IN (
                SELECT id FROM content WHERE content_type = 'blog'
            )
        """)
        print("🗑️  Deleted related notifications")
        
        # Delete comments on articles
        cursor.execute("""
            DELETE FROM comments 
            WHERE content_id IN (
                SELECT id FROM content WHERE content_type = 'blog'
            )
        """)
        print("💬 Deleted related comments")
        
        # Delete likes on articles
        cursor.execute("""
            DELETE FROM likes 
            WHERE content_id IN (
                SELECT id FROM content WHERE content_type = 'blog'
            )
        """)
        print("👍 Deleted related likes")
        
        # Delete wishlist entries for articles
        cursor.execute("""
            DELETE FROM user_wishlist 
            WHERE content_id IN (
                SELECT id FROM content WHERE content_type = 'blog'
            )
        """)
        print("⭐ Deleted related wishlist entries")
        
        # Finally delete the articles
        cursor.execute("DELETE FROM content WHERE content_type = 'blog'")
        deleted_count = cursor.rowcount
        conn.commit()
        
        print(f"✅ Successfully deleted {deleted_count} articles")
        return True
        
    except Exception as e:
        print(f"❌ Error deleting articles: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    success = delete_articles()
    if success:
        print("🎉 Article deletion completed!")
    else:
        print("💥 Article deletion failed!")

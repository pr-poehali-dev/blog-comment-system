'''
Business: API для управления статьями блога - получение списка, просмотр, создание комментариев и оценок
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: JSON с данными статей, комментариев или статусом операции
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            article_id = params.get('id')
            category = params.get('category')
            search = params.get('search')
            
            if article_id:
                cur.execute('''
                    SELECT a.*, 
                           COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as avg_rating,
                           COUNT(DISTINCT c.id) as comments_count,
                           EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - a.created_at))/60 as minutes_ago
                    FROM articles a
                    LEFT JOIN ratings r ON a.id = r.article_id
                    LEFT JOIN comments c ON a.id = c.article_id
                    WHERE a.id = %s
                    GROUP BY a.id
                ''', (article_id,))
                article = cur.fetchone()
                
                if not article:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Article not found'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    SELECT id, author, author_avatar, content, 
                           created_at,
                           EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at))/60 as minutes_ago
                    FROM comments 
                    WHERE article_id = %s 
                    ORDER BY created_at DESC
                ''', (article_id,))
                comments = cur.fetchall()
                
                result = dict(article)
                result['comments'] = [dict(c) for c in comments]
                result['readTime'] = f"{max(1, int(len(result['content']) / 1000))} мин"
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result, default=str),
                    'isBase64Encoded': False
                }
            
            else:
                query = '''
                    SELECT a.id, a.title, a.excerpt, a.category, a.author, a.image, a.created_at,
                           COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as rating,
                           COUNT(DISTINCT c.id) as comments,
                           EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - a.created_at))/60 as minutes_ago
                    FROM articles a
                    LEFT JOIN ratings r ON a.id = r.article_id
                    LEFT JOIN comments c ON a.id = c.article_id
                '''
                
                conditions = []
                params = []
                
                if category and category != 'Все':
                    conditions.append('a.category = %s')
                    params.append(category)
                
                if search:
                    conditions.append('(a.title ILIKE %s OR a.excerpt ILIKE %s)')
                    search_param = f'%{search}%'
                    params.extend([search_param, search_param])
                
                if conditions:
                    query += ' WHERE ' + ' AND '.join(conditions)
                
                query += ' GROUP BY a.id ORDER BY a.created_at DESC'
                
                cur.execute(query, params)
                articles = cur.fetchall()
                
                result = []
                for article in articles:
                    a = dict(article)
                    a['readTime'] = f"{max(1, int(len(a.get('excerpt', '')) / 100))} мин"
                    result.append(a)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'comment':
                article_id = body_data.get('article_id')
                author = body_data.get('author', 'Гость')
                content = body_data.get('content')
                
                if not article_id or not content:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    INSERT INTO comments (article_id, author, content)
                    VALUES (%s, %s, %s)
                    RETURNING id, author, content, created_at
                ''', (article_id, author, content))
                
                comment = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(comment), default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'rate':
                article_id = body_data.get('article_id')
                user_id = body_data.get('user_id', 'anonymous')
                rating = body_data.get('rating')
                
                if not article_id or not rating or rating < 1 or rating > 5:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid rating data'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    INSERT INTO ratings (article_id, user_id, rating)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (article_id, user_id) 
                    DO UPDATE SET rating = %s
                    RETURNING id
                ''', (article_id, user_id, rating, rating))
                
                conn.commit()
                
                cur.execute('''
                    SELECT ROUND(AVG(rating)::numeric, 1) as avg_rating
                    FROM ratings
                    WHERE article_id = %s
                ''', (article_id,))
                
                result = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'avg_rating': float(result['avg_rating'] or 0)}),
                    'isBase64Encoded': False
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unknown action'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

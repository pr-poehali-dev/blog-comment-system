const API_BASE = 'https://functions.poehali.dev/71865e59-178e-4402-b8cd-676b22df492b';

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  author: string;
  author_avatar?: string;
  image?: string;
  rating: number;
  comments?: number;
  readTime?: string;
  created_at?: string;
}

export interface Comment {
  id: number;
  author: string;
  author_avatar?: string;
  content: string;
  created_at: string;
  minutes_ago?: number;
}

export interface ArticleDetail extends Article {
  comments: Comment[];
  avg_rating?: number;
  comments_count?: number;
}

export const api = {
  async getArticles(params?: { category?: string; search?: string }): Promise<Article[]> {
    const queryParams = new URLSearchParams();
    if (params?.category && params.category !== 'Все') {
      queryParams.append('category', params.category);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    
    const url = queryParams.toString() 
      ? `${API_BASE}?${queryParams.toString()}`
      : API_BASE;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch articles');
    return response.json();
  },

  async getArticle(id: string | number): Promise<ArticleDetail> {
    const response = await fetch(`${API_BASE}?id=${id}`);
    if (!response.ok) throw new Error('Failed to fetch article');
    return response.json();
  },

  async addComment(articleId: number, author: string, content: string): Promise<Comment> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'comment',
        article_id: articleId,
        author,
        content,
      }),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },

  async rateArticle(articleId: number, userId: string, rating: number): Promise<{ avg_rating: number }> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'rate',
        article_id: articleId,
        user_id: userId,
        rating,
      }),
    });
    if (!response.ok) throw new Error('Failed to rate article');
    return response.json();
  },
};

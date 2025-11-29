import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { api, type ArticleDetail } from '@/lib/api';

const Article = () => {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadArticle();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await api.getArticle(id!);
      setArticle(data);
    } catch (error) {
      console.error('Failed to load article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (value: number) => {
    setRating(value);
    try {
      const result = await api.rateArticle(Number(id), 'user_' + Date.now(), value);
      if (article) {
        setArticle({ ...article, rating: result.avg_rating });
      }
    } catch (error) {
      console.error('Failed to rate article:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (comment.trim() && article) {
      try {
        const newComment = await api.addComment(article.id, 'Гость', comment);
        setArticle({
          ...article,
          comments: [newComment, ...article.comments],
        });
        setComment('');
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка статьи...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Статья не найдена</h2>
          <Link to="/" className="text-primary hover:underline">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
              <Icon name="PenLine" size={28} />
              <span>Blog</span>
            </Link>
            <Button variant="outline" size="sm">
              <Icon name="User" size={16} className="mr-2" />
              Войти
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад к статьям
        </Link>

        <article className="animate-fade-in">
          <Badge className="mb-4">{article.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={article.author_avatar || ''} />
                <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{article.author}</span>
            </div>
            <span>•</span>
            <span>{formatDate(article.created_at || '')}</span>
            <span>•</span>
            <span>{article.readTime} чтения</span>
          </div>

          <img
            src={article.image || '/placeholder.svg'}
            alt={article.title}
            className="w-full h-96 object-cover rounded-lg mb-12"
          />

          <div
            className="prose prose-lg max-w-none font-serif"
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
            style={{
              lineHeight: '1.8',
            }}
          />

          <div className="mt-16 pt-8 border-t">
            <h3 className="text-xl font-semibold mb-4">Оцените статью</h3>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Icon
                    name="Star"
                    size={28}
                    className={
                      star <= rating ? 'fill-primary text-primary' : 'text-muted'
                    }
                  />
                </button>
              ))}
              <span className="ml-4 text-muted-foreground">
                {rating > 0 && `Ваша оценка: ${rating}/5`}
              </span>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">
              Комментарии ({article.comments.length})
            </h3>

            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <Textarea
                placeholder="Напишите комментарий..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4 bg-white"
                rows={4}
              />
              <Button onClick={handleCommentSubmit}>
                <Icon name="Send" size={16} className="mr-2" />
                Отправить
              </Button>
            </div>

            <div className="space-y-6">
              {article.comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border rounded-lg p-6 animate-scale-in"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.author_avatar || ''} />
                      <AvatarFallback>{c.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{c.author}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(c.created_at)}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t mt-20 py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Blog. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Article;
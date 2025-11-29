import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const Article = () => {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Анна Петрова',
      avatar: '',
      content: 'Отличная статья! Очень полезная информация, спасибо за детальный разбор.',
      date: '15 ноября 2025',
    },
    {
      id: 2,
      author: 'Михаил Сидоров',
      avatar: '',
      content: 'Интересный подход. Было бы здорово увидеть больше примеров.',
      date: '16 ноября 2025',
    },
  ]);

  const article = {
    id: id || '1',
    title: 'Минимализм в веб-дизайне: искусство создания чистых интерфейсов',
    category: 'Дизайн',
    author: 'Александр Иванов',
    date: '20 ноября 2025',
    readTime: '8 мин',
    image: '/placeholder.svg',
    content: `
      <p class="lead">Минимализм в веб-дизайне — это не просто тренд, а философия создания интуитивно понятных и функциональных интерфейсов.</p>
      
      <h2>Что такое минимализм?</h2>
      <p>Минимализм в дизайне — это подход, при котором убираются все лишние элементы, оставляя только самое необходимое. Это не означает, что дизайн становится скучным — наоборот, каждый элемент получает больше внимания и значимости.</p>
      
      <h2>Основные принципы</h2>
      <p>Белое пространство — ваш лучший друг. Оно помогает контенту дышать и направляет внимание пользователя на важные элементы. Не бойтесь пустоты — она делает дизайн элегантным и профессиональным.</p>
      
      <p>Типографика играет ключевую роль. Выбирайте читаемые шрифты и создавайте четкую иерархию. Хороший выбор — системные шрифты или проверенная классика вроде Inter и Merriweather.</p>
      
      <h2>Цветовая палитра</h2>
      <p>Ограничьте себя 2-3 основными цветами. Монохромная схема с одним акцентным цветом часто работает лучше всего. Это создает визуальное единство и профессиональный вид.</p>
      
      <h2>Практические советы</h2>
      <p>Начните с контента. Определите, что действительно важно для пользователя, и постройте дизайн вокруг этого. Убирайте элементы, пока не останется только необходимое.</p>
      
      <p>Используйте сетку для выравнивания элементов. Это создает ощущение порядка и профессионализма, даже если дизайн очень простой.</p>
    `,
    rating: 4.5,
    commentsCount: 12,
  };

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      setComments([
        {
          id: comments.length + 1,
          author: 'Вы',
          avatar: '',
          content: comment,
          date: 'Только что',
        },
        ...comments,
      ]);
      setComment('');
    }
  };

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
                <AvatarImage src="" />
                <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{article.author}</span>
            </div>
            <span>•</span>
            <span>{article.date}</span>
            <span>•</span>
            <span>{article.readTime} чтения</span>
          </div>

          <img
            src={article.image}
            alt={article.title}
            className="w-full h-96 object-cover rounded-lg mb-12"
          />

          <div
            className="prose prose-lg max-w-none font-serif"
            dangerouslySetInnerHTML={{ __html: article.content }}
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
              Комментарии ({comments.length})
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
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border rounded-lg p-6 animate-scale-in"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.avatar} />
                      <AvatarFallback>{c.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{c.author}</span>
                        <span className="text-sm text-muted-foreground">
                          {c.date}
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

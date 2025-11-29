import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { api, type Article } from '@/lib/api';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [authOpen, setAuthOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Все', 'Дизайн', 'Разработка', 'Маркетинг', 'Бизнес'];

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, searchQuery]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await api.getArticles({
        category: selectedCategory,
        search: searchQuery,
      });
      setArticles(data);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
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
            <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)}>
              <Icon name="User" size={16} className="mr-2" />
              Войти
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6">
              Блог о дизайне и разработке
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Статьи, руководства и вдохновение для создателей цифровых продуктов
            </p>
          </div>

          <div className="mb-12 animate-fade-in">
            <div className="relative max-w-2xl mx-auto mb-8">
              <Icon
                name="Search"
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Поиск статей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="transition-all"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Загрузка статей...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, index) => (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className="group animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-white border rounded-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="relative overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                    />
                    <Badge className="absolute top-4 left-4">{article.category}</Badge>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{article.author}</span>
                      <span>{article.readTime}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={16} className="text-primary" />
                        <span className="text-sm font-medium">{article.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon
                          name="MessageCircle"
                          size={16}
                          className="text-muted-foreground"
                        />
                        <span className="text-sm">{article.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              ))}
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div className="text-center py-20">
              <Icon name="Search" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-2">Статьи не найдены</h3>
              <p className="text-muted-foreground">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t mt-20 py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Blog. Все права защищены.</p>
        </div>
      </footer>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              Добро пожаловать
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Пароль</Label>
                <Input id="login-password" type="password" />
              </div>
              <Button className="w-full">Войти</Button>
            </TabsContent>
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Имя</Label>
                <Input id="register-name" placeholder="Иван Иванов" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input id="register-email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Пароль</Label>
                <Input id="register-password" type="password" />
              </div>
              <Button className="w-full">Зарегистрироваться</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
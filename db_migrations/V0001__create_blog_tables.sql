CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    author VARCHAR(200) NOT NULL,
    author_avatar VARCHAR(500),
    image VARCHAR(500),
    rating DECIMAL(2,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id),
    author VARCHAR(200) NOT NULL,
    author_avatar VARCHAR(500),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id),
    user_id VARCHAR(200) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_ratings_article_id ON ratings(article_id);

INSERT INTO articles (title, excerpt, content, category, author, image, rating) VALUES
('Минимализм в веб-дизайне: искусство создания чистых интерфейсов', 
 'Узнайте, как использовать минималистичный подход для создания элегантных и функциональных веб-сайтов.',
 '<p class="lead">Минимализм в веб-дизайне — это не просто тренд, а философия создания интуитивно понятных и функциональных интерфейсов.</p><h2>Что такое минимализм?</h2><p>Минимализм в дизайне — это подход, при котором убираются все лишние элементы, оставляя только самое необходимое.</p>',
 'Дизайн', 'Александр Иванов', '/placeholder.svg', 4.5),

('React Hooks: полное руководство для начинающих',
 'Погрузитесь в мир React Hooks и научитесь писать более чистый и эффективный код.',
 '<p>React Hooks изменили способ написания компонентов. В этой статье мы разберем основные хуки и их применение.</p>',
 'Разработка', 'Мария Смирнова', '/placeholder.svg', 4.8),

('SEO в 2025: стратегии продвижения нового поколения',
 'Актуальные методы SEO-оптимизации и продвижения сайтов в современных поисковых системах.',
 '<p>SEO продолжает эволюционировать. Рассмотрим актуальные стратегии для успешного продвижения.</p>',
 'Маркетинг', 'Дмитрий Козлов', '/placeholder.svg', 4.3),

('Типографика в веб-дизайне: выбор шрифтов и создание иерархии',
 'Как правильно подобрать шрифты и создать визуальную иерархию для улучшения читабельности.',
 '<p>Типографика — основа хорошего дизайна. Научимся выбирать шрифты и создавать читабельные интерфейсы.</p>',
 'Дизайн', 'Елена Волкова', '/placeholder.svg', 4.6),

('Создание API на Node.js: от идеи до продакшена',
 'Пошаговое руководство по разработке масштабируемого RESTful API с использованием Node.js.',
 '<p>Создание надежного API — ключевой навык backend-разработчика. Разберем весь процесс пошагово.</p>',
 'Разработка', 'Игорь Петров', '/placeholder.svg', 4.9),

('Email-маркетинг: как увеличить конверсию в 3 раза',
 'Проверенные стратегии и тактики для повышения эффективности email-рассылок.',
 '<p>Email-маркетинг остается одним из самых эффективных каналов. Изучим проверенные методы.</p>',
 'Маркетинг', 'Ольга Соколова', '/placeholder.svg', 4.4);

INSERT INTO comments (article_id, author, content) VALUES
(1, 'Анна Петрова', 'Отличная статья! Очень полезная информация, спасибо за детальный разбор.'),
(1, 'Михаил Сидоров', 'Интересный подход. Было бы здорово увидеть больше примеров.');

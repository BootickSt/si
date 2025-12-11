import React from 'react';
import { usePageTracking } from '../hooks/usePageTracking';

const IntroPanel = () => {
  usePageTracking(1); // ID для страницы "Введение"

  return (
    <main className="content">
    <header>
    <h1>Документация по компоненту</h1>
    <p className="lead">
    Краткое введение к странице. Здесь есть примеры заголовков, таблиц, списков, изображений и простые четкие пингвины.
    </p>
    </header>

    <section id="intro">
    <h2 className="section-title">Введение</h2>
    <p>Это пример страницы документации. Боковая панель навигации закреплена слева и не прокручивается вместе с основным содержимым.</p>
    <p>Ниже — изображение с четкими пингвинами.</p>
    <figure>
    <img src="/pic.jpg" alt="Пример изображения" className="animated-img" />
    <figcaption>Иллюстративное изображение</figcaption>
    </figure>
    </section>
    </main>
  );
};

export default IntroPanel;

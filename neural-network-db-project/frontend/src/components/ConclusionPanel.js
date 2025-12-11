import React from 'react';
import { usePageTracking } from '../hooks/usePageTracking';

const ConclusionPanel = () => {
  usePageTracking(3); // ID для страницы "Заключение"

  return (
    <main className="content">
    <header>
    <h1>Документация по компоненту</h1>
    </header>

    <section id="conclusion">
    <h2 className="section-title">Заключение</h2>
    <p>Здесь можно подвести итоги и оставить контакты.</p>
    <p>Спасибо за внимание!</p>
    </section>

    <footer>
    <p>© 2025 — Пример документации</p>
    </footer>
    </main>
  );
};
export default ConclusionPanel;

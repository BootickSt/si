import React from 'react';
import { usePageTracking } from '../hooks/usePageTracking';

const MainPanel = () => {
  usePageTracking(2); // ID для страницы "Описание"

  return (
    <main className="content">
    {/* Только Описание */}
    <section id="description">
    <h2 className="section-title">Описание</h2>
    <p>В этом разделе показаны блочные и строчные элементы:</p>
    <div className="box">Блочный элемент (бокс)</div>
    <p>
    А это <span className="inline">строчный элемент (span)</span> в тексте.
    </p>

    <h3>Таблица с чередованием строк</h3>
    <table className="styled-table">
    <thead>
    <tr>
    <th>Имя</th>
    <th>Роль</th>
    <th>Статус</th>
    </tr>
    </thead>
    <tbody>
    <tr><td>Алексей</td><td>Разработчик</td><td>Активен</td></tr>
    <tr><td>Мария</td><td>Тестировщик</td><td>В отпуске</td></tr>
    <tr><td>Иван</td><td>Дизайнер</td><td>Активен</td></tr>
    <tr><td>Ольга</td><td>PM</td><td>Занята</td></tr>
    </tbody>
    </table>

    <h3>Список задач</h3>
    <ul className="custom-list">
    <li>Написать спецификацию</li>
    <li>Подготовить примеры</li>
    <li>Проверить кроссбраузерность</li>
    </ul>

    <h3>Подзаголовок с появляющимся знаком '#'</h3>
    <h4 className="hover-hash">Как использовать компонент</h4>
    <p>При наведении на подзаголовок появляется символ решётки слева.</p>
    </section>
    </main>
  );
};

export default MainPanel;

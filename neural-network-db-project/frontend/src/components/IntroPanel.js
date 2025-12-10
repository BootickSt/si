import React from 'react';
import { usePageTracking } from '../hooks/usePageTracking';

const IntroPanel = () => {
  usePageTracking(1); // ID для страницы "Введение"

  return (
    <div>
      <h1>Какие бывают нейронные сети</h1>

      <h2 className="section">Введение</h2>
      <p>Нейронные сети — это вычислительные модели, вдохновлённые устройством мозга человека. Они состоят из узлов-«нейронов», соединённых связями, которые передают сигналы.</p>
      <p>История начинается с середины XX века: первые модели были простыми, но дали основу для будущих открытий. Сегодня нейросети активно применяются в самых разных сферах.</p>
      <p>Развитие вычислительной техники и больших данных позволило создавать более сложные архитектуры, такие как свёрточные сети, рекуррентные сети и трансформеры.</p>

      <div className="image-container">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Artificial_neural_network.svg/512px-Artificial_neural_network.svg.png" 
          alt="Схема нейросети" 
        />
      </div>
    </div>
  );
};

export default IntroPanel;

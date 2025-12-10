import React from 'react';
import { usePageTracking } from '../hooks/usePageTracking';

const ConclusionPanel = () => {
  usePageTracking(3); // ID для страницы "Заключение"

  return (
    <div>
      <h1>Какие бывают нейронные сети</h1>

      <h2 className="section">Заключение</h2>
      <p>Нейронные сети стали важнейшим инструментом в развитии искусственного интеллекта. Будущее за новыми архитектурами, которые сделают технологии ещё более доступными и полезными в нашей жизни.</p>

      <div className="image-container">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Artificial_neural_network.svg/512px-Artificial_neural_network.svg.png" 
          alt="Схема нейросети" 
        />
      </div>
    </div>
  );
};

export default ConclusionPanel;

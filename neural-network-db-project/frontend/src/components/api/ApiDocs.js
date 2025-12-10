import React, { useState, useEffect } from 'react';
import { usePageTracking } from '../../hooks/usePageTracking';

const ApiDocs = () => {
  usePageTracking(4); // ID для страницы "API Документация"
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpenApiSpec = async () => {
      try {
        const response = await fetch('http://localhost:8000/openapi.json');
        const data = await response.json();
        setSpec(data);
      } catch (err) {
        setError('Не удалось загрузить документацию API');
      } finally {
        setLoading(false);
      }
    };

    fetchOpenApiSpec();
  }, []);

  if (loading) return <div className="loading">Загрузка документации API...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="api-docs-container">
      <h1>API Документация</h1>
      <p>Спецификация загружена с: http://localhost:8000/openapi.json</p>
      
      <div className="api-info">
        <h2>{spec?.info?.title || 'API'} v{spec?.info?.version}</h2>
        <p>{spec?.info?.description}</p>
      </div>

      <div className="endpoints-list">
        <h3>Доступные эндпоинты:</h3>
        
        {spec && Object.entries(spec.paths || {}).map(([path, methods]) => (
          <div key={path} className="endpoint-card">
            <h4>{path}</h4>
            {Object.entries(methods).map(([method, details]) => (
              <div key={method} className="method-details">
                <span className={`method-badge method-${method}`}>{method.toUpperCase()}</span>
                <p><strong>{details.summary}</strong></p>
                {details.description && (
                  <p className="method-description">{details.description}</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiDocs;

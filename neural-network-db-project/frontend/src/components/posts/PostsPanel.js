import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { usePageTracking } from '../../hooks/usePageTracking';

export default function PostsPanel() {
  // Отслеживаем посещения этой страницы (ID=10)
  usePageTracking(10);

  const [count, setCount] = useState(2);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("fetch");
  const [error, setError] = useState(null);

  // === Загрузка данных с ТВОЕГО сервера ===
  const loadFromYourServer = async (method) => {
    setLoading(true);
    setError(null);
    try {
      let response;

      if (method === "fetch") {
        response = await fetch("http://localhost:8000/posts", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setPosts(data);

      } else if (method === "axios") {
        response = await axios.get("http://localhost:8000/posts", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPosts(response.data);
      }

    } catch (error) {
      console.error(`Ошибка загрузки (${method}):`, error);
      setError(`Не удалось загрузить с localhost:8000. Ошибка: ${error.message}`);

      // Fallback на JSONPlaceholder если твой сервер не работает
      try {
        console.log('Пробуем загрузить с JSONPlaceholder...');
        const fallbackUrl = "https://jsonplaceholder.typicode.com/posts";
        let fallbackData;

        if (method === "fetch") {
          const fallbackResponse = await fetch(fallbackUrl);
          fallbackData = await fallbackResponse.json();
        } else {
          const fallbackResponse = await axios.get(fallbackUrl);
          fallbackData = fallbackResponse.data;
        }

        setPosts(fallbackData);
        setError(`⚠️ Используется JSONPlaceholder (${fallbackUrl})`);

      } catch (fallbackError) {
        console.error('Fallback тоже не сработал:', fallbackError);
        setError('Не удалось загрузить посты ни с одного источника');
      }

    } finally {
      setLoading(false);
    }
  };

  // === Переключение между методами ===
  useEffect(() => {
    loadFromYourServer(mode);
  }, [mode]);

  // === Мемоизация постов ===
  const slicedPosts = useMemo(() => {
    return posts.slice(0, count);
  }, [posts, count]);

  return (
    <main className="content">
    <header>
    <h1>Посты с локального сервера</h1>
    <p className="lead">
    Загрузка данных с <code>localhost:8000/posts</code>
    {error && error.includes('JSONPlaceholder') && ' (fallback на JSONPlaceholder)'}
    </p>
    </header>

    {/* Информация о источнике */}
    {error && (
      <div style={{
        background: error.includes('JSONPlaceholder') ? '#fef3c7' : '#fef2f2',
               padding: '1rem',
               borderRadius: '8px',
               marginBottom: '1rem',
               border: `1px solid ${error.includes('JSONPlaceholder') ? '#fbbf24' : '#fecaca'}`
      }}>
      {error.includes('JSONPlaceholder') ? '⚠️ ' : '❌ '}
      {error}
      </div>
    )}

    <div style={{
      marginBottom: "1rem",
      padding: "0.75rem",
      background: "#f8fafc",
      borderRadius: "8px",
      border: "1px solid #e2e8f0"
    }}>
    <strong>Режим работы:</strong>
    <div style={{ marginTop: "0.5rem" }}>
    <button
    onClick={() => setMode("fetch")}
    style={{
      padding: "0.5rem 1rem",
      marginRight: "0.5rem",
      background: mode === "fetch" ? "#3b82f6" : "#e2e8f0",
      color: mode === "fetch" ? "white" : "#334155",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer"
    }}
    >
    Fetch API
    </button>
    <button
    onClick={() => setMode("axios")}
    style={{
      padding: "0.5rem 1rem",
      background: mode === "axios" ? "#3b82f6" : "#e2e8f0",
      color: mode === "axios" ? "white" : "#334155",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer"
    }}
    >
    Axios
    </button>
    </div>

    <div style={{ marginTop: "1rem" }}>
    <label style={{ display: "block", marginBottom: "0.5rem" }}>
    <strong>Количество постов: {count}</strong>
    </label>
    <input
    type="range"
    min="1"
    max="20"
    value={count}
    onChange={e => setCount(Number(e.target.value))}
    style={{ width: "100%" }}
    />
    </div>
    </div>

    <hr style={{ margin: "1.5rem 0" }} />

    {loading ? (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
      <p>Загрузка с localhost:8000...</p>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e2e8f0',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        margin: '1rem auto',
        animation: 'spin 1s linear infinite'
      }}></div>
      </div>
    ) : (
      <div>
      <p style={{ marginBottom: '1rem', color: '#64748b' }}>
      Отображается {slicedPosts.length} из {posts.length} постов
      {posts[0]?.source && ` (источник: ${posts[0].source})`}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      {slicedPosts.map(post => (
        <div
        key={post.id}
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                                border: "1px solid #e2e8f0"
        }}
        >
        <h3 style={{
          marginBottom: ".75rem",
          color: "#0f172a"
        }}>
        {post.title}
        </h3>
        <p style={{
          color: "#475569",
          lineHeight: 1.6,
          marginBottom: "1rem"
        }}>
        {post.body}
        </p>
        <div style={{
          display: "flex",
          gap: "1.5rem",
          fontSize: "0.875rem",
          color: "#64748b"
        }}>
        <span>Post ID: {post.id}</span>
        <span>User ID: {post.userId}</span>
        {post.source && <span>Source: {post.source}</span>}
        </div>
        </div>
      ))}
      </div>
      </div>
    )}

    <footer style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
    <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
    Задание 4: Работа с локальным FastAPI сервером (localhost:8000)
    </p>
    </footer>

    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      `}</style>
      </main>
  );
}

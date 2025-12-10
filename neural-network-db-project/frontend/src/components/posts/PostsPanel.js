import React, { useState, useEffect } from 'react';
import { usePageTracking } from '../../hooks/usePageTracking';
import * as authApi from '../../services/authApi';

const PostsPanel = () => {
  usePageTracking(5); // ID для страницы "Посты"
  const [posts, setPosts] = useState([]);
  const [postCount, setPostCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authApi.fetchWithAuth('http://localhost:8000/posts');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Убедимся, что data - это массив
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error('Expected array but got:', data);
          setPosts([]); // Устанавливаем пустой массив, если data не массив
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Не удалось загрузить посты. Проверьте авторизацию и попробуйте снова.');
        setPosts([]); // Устанавливаем пустой массив при ошибке
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Убедимся, что posts - это массив перед использованием slice
  const displayedPosts = Array.isArray(posts) ? posts.slice(0, postCount) : [];

  if (loading) {
    return <div className="loading">Загрузка постов...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="posts-panel">
      <h1>Посты</h1>
      
      <div className="controls">
        <div className="slider-container">
          <label htmlFor="post-slider">
            Количество постов: {postCount}
          </label>
          <input
            id="post-slider"
            type="range"
            min="1"
            max={Math.max(posts.length, 10)}
            value={postCount}
            onChange={(e) => setPostCount(parseInt(e.target.value))}
            className="post-slider"
          />
        </div>
      </div>

      <div className="post-list">
        <h3>Отображается {displayedPosts.length} из {posts.length} постов</h3>
        {displayedPosts.length === 0 ? (
          <div className="no-posts">
            <p>Посты не найдены или произошла ошибка при загрузке.</p>
            <p>Проверьте:</p>
            <ul>
              <li>Авторизованы ли вы в системе</li>
              <li>Работает ли бэкенд сервер на localhost:8000</li>
              <li>Доступен ли эндпоинт /posts</li>
            </ul>
          </div>
        ) : (
          displayedPosts.map(post => (
            <div key={post.id} className="post-item">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-body">{post.body}</p>
              <div className="post-meta">
                <span>Post ID: {post.id}</span>
                <span>User ID: {post.userId}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostsPanel;

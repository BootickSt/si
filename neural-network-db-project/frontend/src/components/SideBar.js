import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout(); // очищаем localStorage
    navigate('/login'); // делаем редирект
  };

  return (
    <nav className="sidebar">
      <div className="user-info">
        <p>Добро пожаловать!</p>
        <p>{user?.email}</p>
        <p className="user-role">Роль: {user?.role}</p>
      </div>
      
      <Link to="/">
        <button className={location.pathname === '/' || location.pathname === '/intro' ? 'active' : ''}>
          Введение
        </button>
      </Link>
      
      <Link to="/types">
        <button className={location.pathname === '/types' ? 'active' : ''}>
          Типы сетей
        </button>
      </Link>
      
      <Link to="/posts">
        <button className={location.pathname === '/posts' ? 'active' : ''}>
          Посты
        </button>
      </Link>
      
      <Link to="/image-upload">
        <button className={location.pathname === '/image-upload' ? 'active' : ''}>
          Инверсия изображения
        </button>
      </Link>
      
      <Link to="/api-docs">
        <button className={location.pathname === '/api-docs' ? 'active' : ''}>
          API Документация
        </button>
      </Link>
      
      {isAdmin() && (
        <Link to="/analytics">
          <button className={location.pathname === '/analytics' ? 'active' : ''}>
            Аналитика
          </button>
        </Link>
      )}
      
      <Link to="/conclusion">
        <button className={location.pathname === '/conclusion' ? 'active' : ''}>
          Заключение
        </button>
      </Link>
      
      {user ? (
        <button onClick={handleLogout} className="logout-button">
          Выйти
        </button>
      ) : (
        <Link to="/login">
          <button className={location.pathname === '/login' ? 'active' : ''}>
            Вход
          </button>
        </Link>
      )}
    </nav>
  );
};

export default SideBar;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import './styles.css';
import SideBar from './components/SideBar';
import MainPanel from './components/MainPanel';
import IntroPanel from './components/IntroPanel';
import ConclusionPanel from './components/ConclusionPanel';
import PostsPanel from './components/posts/PostsPanel';
import ImageUpload from './components/image/ImageUpload';
import ApiDocs from './components/api/ApiDocs';
import AnalyticsPanel from './components/analytics/AnalyticsPanel';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Компонент-обертка для защищенных роутов
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Компонент-обертка для админских роутов
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Основной компонент контента
function AppContent() {
  const { user } = useAuth();

  return (
    <div className="container">
      {user && <SideBar />}
      <div className={`content ${!user ? 'full-width' : ''}`}>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Защищенные маршруты */}
          <Route path="/" element={
            <ProtectedRoute>
              <IntroPanel />
            </ProtectedRoute>
          } />
          <Route path="/intro" element={
            <ProtectedRoute>
              <IntroPanel />
            </ProtectedRoute>
          } />
          <Route path="/types" element={
            <ProtectedRoute>
              <MainPanel />
            </ProtectedRoute>
          } />
          <Route path="/posts" element={
            <ProtectedRoute>
              <PostsPanel />
            </ProtectedRoute>
          } />
          <Route path="/image-upload" element={
            <ProtectedRoute>
              <ImageUpload />
            </ProtectedRoute>
          } />
          <Route path="/api-docs" element={
            <ProtectedRoute>
              <ApiDocs />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <AdminRoute>
              <AnalyticsPanel />
            </AdminRoute>
          } />
          <Route path="/conclusion" element={
            <ProtectedRoute>
              <ConclusionPanel />
            </ProtectedRoute>
          } />
          
          {/* Перенаправление для неавторизованных */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </div>
    </div>
  );
}

// Главный компонент приложения
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { usePageTracking } from '../../hooks/usePageTracking';
import * as authApi from '../../services/authApi';

const AnalyticsPanel = () => {
  usePageTracking(8);
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKPI = async () => {
    try {
      const response = await authApi.fetchWithAuth('http://localhost:8000/kpi/');
      const data = await response.json();
      setKpiData(data);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPI();
    const interval = setInterval(fetchKPI, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}м ${remainingSeconds}с`;
  };

  if (loading) {
    return <div className="loading">Загрузка аналитики...</div>;
  }

  return (
    <div className="analytics-panel">
      <h1>Аналитика посещений</h1>
      <p className="admin-note">Доступно только администраторам</p>
      
      <div className="kpi-grid">
        {kpiData.map((item) => (
          <div key={item.page_id} className="kpi-card">
            <h3>{item.page_title}</h3>
            <div className="kpi-stats">
              <div className="stat">
                <span className="stat-label">Посещения:</span>
                <span className="stat-value">{item.visit_count}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Общее время:</span>
                <span className="stat-value">{formatTime(item.total_time_spent)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Среднее время:</span>
                <span className="stat-value">
                  {item.visit_count > 0 ? formatTime(item.avg_time_spent) : '0с'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="kpi-table">
        <h3>Детальная статистика</h3>
        <table>
          <thead>
            <tr>
              <th>Страница</th>
              <th>Посещения</th>
              <th>Общее время</th>
              <th>Среднее время</th>
            </tr>
          </thead>
          <tbody>
            {kpiData.map((item) => (
              <tr key={item.page_id}>
                <td>{item.page_title}</td>
                <td>{item.visit_count}</td>
                <td>{formatTime(item.total_time_spent)}</td>
                <td>{item.visit_count > 0 ? formatTime(item.avg_time_spent) : '0с'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsPanel;

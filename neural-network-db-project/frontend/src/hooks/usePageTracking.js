import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import * as authApi from '../services/authApi';

export const usePageTracking = (pageId) => {
  const location = useLocation();
  const startTime = useRef(null);
  const currentPageId = useRef(null);

  const sendTimeToServer = async (pageId, timeSpent) => {
    try {
      await authApi.fetchWithAuth(`http://localhost:8000/kpi/${pageId}/time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ time_spent: timeSpent }),
      });
    } catch (error) {
      console.error('Error sending time data:', error);
    }
  };

  const recordVisit = async (pageId) => {
    try {
      await authApi.fetchWithAuth(`http://localhost:8000/kpi/${pageId}/visit`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error recording visit:', error);
    }
  };

  useEffect(() => {
    if (pageId && pageId !== currentPageId.current) {
      recordVisit(pageId);
      startTime.current = Date.now();
      currentPageId.current = pageId;
    }

    const handleBeforeUnload = () => {
      if (startTime.current && currentPageId.current) {
        const endTime = Date.now();
        const timeSpent = (endTime - startTime.current) / 1000;
        
        const data = JSON.stringify({ time_spent: timeSpent });
        navigator.sendBeacon(
          `http://localhost:8000/kpi/${currentPageId.current}/time`,
          data
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (startTime.current && currentPageId.current) {
        const endTime = Date.now();
        const timeSpent = (endTime - startTime.current) / 1000;
        sendTimeToServer(currentPageId.current, timeSpent);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname, pageId]);
};

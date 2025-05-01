
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/NotFound.module.css'; 

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  // 이전 페이지로 리다이렉트하는 기능
  useEffect(() => {
    // 이전 페이지가 있으면 이전 페이지로, 없으면 홈으로
    const redirectTo = document.referrer || '/home';
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = redirectTo; 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className={styles.notFoundContainer}>
      <img 
        src="/images/404.png" 
        alt="404 - Page Not Found" 
        className={styles.notFoundImage}
      />
      <h1>죄송합니다! 페이지를 찾을 수 없습니다😭</h1>
      <p>{countdown}초 후 이전 페이지로 돌아갑니다...</p>
      <button 
        onClick={() => window.history.back()}
        className={styles.backButton}
      >
        지금 돌아가기
      </button>
    </div>
  );
};

export default NotFound;
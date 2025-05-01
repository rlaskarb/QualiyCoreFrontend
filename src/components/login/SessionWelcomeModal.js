import React, { useState, useEffect } from 'react';
import styles from '../login/SessionWelcomeModal.module.css';

// 로그인 후 처음 표시되는 세션 안내 모달
const SessionWelcomeModal = () => {
  const [visible, setVisible] = useState(false); // 처음에는 표시 안 함
  const [countdown, setCountdown] = useState(10); // 10초 자동 닫힘 카운트다운
  
  // 로그인 후 5초 동안 가만히 있으면 모달 표시
  useEffect(() => {
    const showTimeout = setTimeout(() => {
      setVisible(true);
    }, 1000); // 여기서 5000은 5초입니다. 원하는 시간으로 변경하세요
    
    return () => clearTimeout(showTimeout);
  }, []);
  
  // 모달이 표시되면 10초 카운트다운 시작
  useEffect(() => {
    let intervalId;
    
    if (visible) {
      intervalId = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setVisible(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [visible]);
  
  // 사용자 활동 감지 시 모달 닫기
  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'touchstart'];
    let eventTimeout;
    
    const handleActivity = () => {
      // 모달이 표시된 상태에서만 활동 감지 시 닫기
      if (visible) {
        // 처음 2초 동안은 모달을 유지 (즉시 닫히지 않도록)
        if (!eventTimeout) {
          eventTimeout = setTimeout(() => {
            setVisible(false);
          }, 2000);
        }
      }
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (eventTimeout) clearTimeout(eventTimeout);
    };
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>세션 보안 안내</h3>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.securityIcon}>🔒</div>
          <p className={styles.welcomeMessage}>
            <strong>환영합니다!</strong> 보안을 위해 다음 사항을 안내해 드립니다.
          </p>
          <ul className={styles.securityInfo}>
            <li>15분 동안 키보드/마우스 입력이 없으면 자동으로 로그아웃됩니다.</li>
            <li>세션 만료 2분 전에 경고 메시지가 표시됩니다.</li>
            <li>중요한 작업을 수행 중일 때는 주기적으로 입력을 해주세요.</li>
          </ul>
          <p className={styles.autoCloseText}>
            이 메시지는 {countdown}초 후에 자동으로 닫힙니다.
          </p>
        </div>
        <div className={styles.modalFooter}>
          <button 
            className={styles.confirmButton}
            onClick={() => setVisible(false)}
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWelcomeModal;
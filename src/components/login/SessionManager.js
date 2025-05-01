import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../login/SessionManager.module.css';
import SessionWelcomeModal from '../login/SessionWelcomeModal';

// 세션 관리자 컴포넌트
const SessionManager = () => {
  const { currentUser, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [counter, setCounter] = useState(0); // 디버깅용 카운터
  
  // 타이머 참조 설정
  const idleTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  
  // 세션 타임아웃 설정 (밀리초)
  // const IDLE_TIMEOUT = 500 * 1000; // 20초 (테스트용)
  // const WARNING_DURATION = 10; // 초 단위로 경고창 표시 시간
  
  // 디버깅 모드 설정
  const DEBUG_MODE = true; // 콘솔 로그 표시 여부
  
  // 로그인 후 웰컴 모달 표시 (한 번만)
  useEffect(() => {
    if (currentUser) {
      // 사용자가 막 로그인한 경우, 세션 시작 시간 확인
      const userLoginTime = new Date(currentUser.loginTime || Date.now()).getTime();
      const currentTime = Date.now();
      const timeSinceLogin = currentTime - userLoginTime;
      
      // 로그인 후 60초 이내인 경우에만 웰컴 모달 표시
      if (timeSinceLogin < 60000) {
        setShowWelcomeModal(true);
      }
    }
  }, [currentUser]);
  
  // 경고창이 표시될 때 카운트다운 시작
  useEffect(() => {
    if (showWarning) {
      if (DEBUG_MODE) console.log("경고창 표시됨, 카운트다운 시작");
      
      // 카운트다운 초기값 설정
      setRemainingTime(WARNING_DURATION);
      
      // 기존 카운트다운 인터벌 정리
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      // 100ms 지연 후 카운트다운 시작 (렌더링 확인용)
      setTimeout(() => {
        countdownIntervalRef.current = setInterval(() => {
          setRemainingTime(prev => {
            if (DEBUG_MODE) console.log("카운트다운:", prev - 1);
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              if (DEBUG_MODE) console.log("카운트다운 완료, 자동 로그아웃 실행");
              logout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 100);
    } else {
      // 경고창이 닫히면 카운트다운 중지
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [showWarning, logout]); // showWarning 상태가 변경될 때마다 실행
  
  // 사용자 활동 감지 및 세션 관리
  useEffect(() => {
    if (!currentUser) return;
    
    if (DEBUG_MODE) console.log("SessionManager 초기화됨");
    
    // 타이머를 시작하는 함수
    const startIdleTimer = () => {
      if (DEBUG_MODE) console.log("활동 타이머 시작...");
      // 이전 타이머가 있으면 제거
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      
      // 새 타이머 설정
      idleTimerRef.current = setTimeout(() => {
        if (DEBUG_MODE) console.log("비활성 시간 초과!");
        setShowWarning(true); // 경고창 표시 (카운트다운은 useEffect에서 처리)
      }, IDLE_TIMEOUT);
    };
    
    // 초기 타이머 시작
    startIdleTimer();
    
    // 일반 활동 감지 시 타이머 재시작
    const resetTimer = () => {
      setCounter(prev => prev + 1); // 디버깅용 카운터
      if (DEBUG_MODE) console.log("활동 감지, 타이머 재설정");
      
      // 경고창이 표시 중이면 숨김
      if (showWarning) {
        if (DEBUG_MODE) console.log("경고창 닫기 (활동 감지)");
        setShowWarning(false);
      }
      
      startIdleTimer();
    };
    
    // mousemove 이벤트 제한을 위한 변수
    let lastMoveTime = 0;
    const MOVE_THRESHOLD = 1000; // 마우스 이동 감지 제한 (1초)
    
    // 마우스 이동 감지 - 제한 적용
    const handleMouseMove = () => {
      const now = Date.now();
      if (now - lastMoveTime > MOVE_THRESHOLD) {
        lastMoveTime = now;
        resetTimer();
      }
    };
    
    // 이벤트 리스너 추가 (일반 이벤트)
    const events = ['mousedown', 'keydown', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    // 마우스 이동 이벤트 별도 추가
    window.addEventListener('mousemove', handleMouseMove);
    
    // 페이지 가시성 변경 감지
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (DEBUG_MODE) console.log("페이지 가시성: 보임");
        resetTimer();
      } else {
        if (DEBUG_MODE) console.log("페이지 가시성: 숨김");
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // 정리
      if (DEBUG_MODE) console.log("SessionManager 정리 중");
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      
      // 마우스 이동 이벤트 리스너 제거
      window.removeEventListener('mousemove', handleMouseMove);
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser, showWarning]); // showWarning 상태 추가
  
  // 세션 연장 처리 (버튼 클릭 시)
  const extendSession = () => {
    if (DEBUG_MODE) console.log("세션 연장 버튼 클릭");
    setShowWarning(false); 
    // 카운트다운은 위의 useEffect에서 자동으로 정리됨
    
    // 타이머 재시작
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    idleTimerRef.current = setTimeout(() => {
      if (DEBUG_MODE) console.log("비활성 시간 초과!");
      setShowWarning(true);
    }, IDLE_TIMEOUT);
  };
  
  // 세션 로그아웃 처리
  const handleLogout = () => {
    if (DEBUG_MODE) console.log("수동 로그아웃");
    logout();
  };
  
  return (
    <>
      {/* 디버깅 정보 - 개발 중에만 표시 (나중에 제거) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', top: 0, right: 0, background: 'white', padding: '5px', zIndex: 9999 }}>
          {/* <div>활동 카운터: {counter}</div> */}
          {showWarning && <div>남은 시간: {remainingTime}초</div>}
        </div>
      )}
      
      {/* 로그인 후 처음 방문 시 표시되는 웰컴 모달 */}
      {showWelcomeModal && <SessionWelcomeModal onClose={() => setShowWelcomeModal(false)} />}
      
      {/* 세션 만료 경고 모달 */}
      {showWarning && currentUser && (
        <div className={styles.sessionWarning}>
          <div className={styles.warningContent}>
            <div className={styles.warningIcon}>⚠️</div>
            <h3 className={styles.warningTitle}>세션 만료 경고</h3>
            <p className={styles.warningText}>
              장시간 활동이 없어 {remainingTime}초 후에 자동으로 로그아웃됩니다.
              <br />
              <span className={styles.warningSubtext}>마우스를 움직이거나 키보드를 누르면 세션이 자동으로 연장됩니다.</span>
            </p>
            <div className={styles.warningActions}>
            
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionManager;
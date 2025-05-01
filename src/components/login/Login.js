import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../login/apiInterceptor';
import styles from "../../styles/Login.module.css";
import PasswordReset from './PasswordReset'; 

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // 이미지 슬라이더 상태
  const [currentImage, setCurrentImage] = useState(0);
  
  // 로그인 폼 상태
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [saveId, setSaveId] = useState(false);
  const [error, setError] = useState('');
  
  // 비밀번호 찾기 모달 상태 추가
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  // Castoro Titling 폰트 로드
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Castoro+Titling&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // 저장된 ID 불러오기
  useEffect(() => {
    const savedId = secureLocalStorage.getItem('savedEmployeeId');
    if (savedId) {
      setEmployeeId(savedId);
      setSaveId(true);
    }
  }, []);
  
  // 슬라이더 이미지 데이터
  const images = [
    {
      url: process.env.PUBLIC_URL + '/images/login001.png',
    },
    {
      url: process.env.PUBLIC_URL + '/images/login002.png',
    },
    {
      url: process.env.PUBLIC_URL + '/images/JO.png',
    },
  ];
  
  // 자동 슬라이드 효과
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3500); // 초마다 이미지 변경
    
    return () => clearInterval(interval);
  }, [images.length]);
  
  // 이전 이미지로 이동
  const prevImage = () => {
    setCurrentImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  // 다음 이미지로 이동
  const nextImage = () => {
    setCurrentImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  // 특정 이미지로 이동
  const goToImage = (index) => {
    setCurrentImage(index);
  };
  
  // 가상 사용자 데이터
  const [mockUsers, setMockUsers] = useState(() => {
    // 로컬 스토리지에서 기존 사용자 데이터 가져오기 (없으면 초기값 설정)
    const storedUsers = JSON.parse(localStorage.getItem('mockUsers'));
    return storedUsers || [
      { id: 'admin', password: '123', name: '시스템관리자', role: 'ADMIN', department: '정보시스템부', permissions: ['all'] },
      { id: 'plan', password: '123', name: '문관리', role: 'PRODUCTION_MANAGER', department: '생산관리부', permissions: ['production.read', 'production.write', 'production.approve', 'work.read', 'work.write'] },
      { id: 'work', password: '1234', name: '김작업', role: 'WORK_MANAGER', department: '작업관리팀', permissions: ['work.read', 'work.write', 'work.approve', 'production.read'] },
      { id: 'EMP001', password: '123', name: '장사원', role: 'EMPLOYEE', department: '생산1팀', permissions: ['production.read', 'work.read'] },
      { id: 'iu', password: '123', name: '아이유', role: 'EMPLOYEE', department: '생산2팀', permissions: ['production.read', 'work.read', 'work.execute'] }
    ];
  });
  

  // 비밀번호 업데이트 함수
  const updateUserPassword = (userId, newPassword) => {
    setMockUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => 
        user.id === userId ? { ...user, password: newPassword } : user
      );
  
      // 변경된 사용자 정보를 localStorage에 저장
      localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));

      return updatedUsers;
    });
  };
  
  // 로그인 처리 함수
  const handleLogin = () => {
    if (!employeeId || !password) {
      setError('사번과 비밀번호를 모두 입력해주세요.');
      return;
    }
  
    // 최신 mockUsers 데이터 가져오기
    const storedUsers = JSON.parse(localStorage.getItem('mockUsers')) || mockUsers;
    const user = storedUsers.find(u => u.id === employeeId);
  
    if (!user) {
      setError('존재하지 않는 사번입니다.');
      return;
    }
  
    if (user.password !== password) {
      setError('비밀번호가 올바르지 않습니다.');
      return;
    }
  
    // 로그인 성공
    const userData = {
      id: user.id,
      name: user.name,
      role: user.role,
      department: user.department,
      permissions: user.permissions,
      isLoggedIn: true,
      // 보안 강화: 로그인 시간 기록 (세션 관리용)
      loginTime: new Date().toISOString()
    };
  
    login(userData);
  
    if (saveId) {
      secureLocalStorage.setItem('savedEmployeeId', employeeId);
    } else {
      secureLocalStorage.removeItem('savedEmployeeId');
    }
  
    navigate('/home');
  };
  
  // 비밀번호 찾기 기능 - 모달 표시로 변경
  const handlePasswordReset = () => {
    setShowPasswordReset(true);
  };
  
  // 비밀번호 찾기 모달 닫기 핸들러
  const handleClosePasswordReset = () => {
    setShowPasswordReset(false);
  };
  
  return (
    <div className={styles.loginContainer}>
      {/* 최상단 헤더 영역 */}
      <div className={styles.headerSection}>
        <h2 className={styles.companyName}>BräuHaus</h2>
      </div>
      
      {/* 상단 슬라이더 영역 */}
      <div className={styles.sliderSection}>
        {images.map((image, index) => (
          <div 
            key={index}
            className={`${styles.slide} ${index === currentImage ? styles.active : ''}`}
            style={{ 
              backgroundImage: `url(${image.url})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#f8f9fa'  
            }}
          >
            <div className={styles.slideOverlay}></div>
            <div className={styles.slideContent}>
              <h2 className={styles.slideTitle}>{image.title}</h2>
              <p className={styles.slideDescription}>{image.description}</p>
            </div>
          </div>
        ))}
        
        {/* 좌우 네비게이션 */}
        <button className={`${styles.sliderNav} ${styles.prev}`} onClick={prevImage}>❮</button>
        <button className={`${styles.sliderNav} ${styles.next}`} onClick={nextImage}>❯</button>
        
        {/* 인디케이터 */}
        <div className={styles.sliderIndicators}>
          {images.map((_, index) => (
            <span 
              key={index}
              className={`${styles.indicator} ${index === currentImage ? styles.active : ''}`}
              onClick={() => goToImage(index)}
            ></span>
          ))}
        </div>
      </div>
      
      {/* 하단 로그인 영역 */}
      <div className={styles.loginSection}>
        <div className={styles.loginForm}>
          <div className={styles.formGroup}>
            <input 
              type="text" 
              className={styles.inputField} 
              placeholder="사번"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>
          
          <div className={styles.formGroup}>
            <input 
              type="password" 
              className={styles.inputField} 
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <label className={styles.checkboxGroup}>
            <input 
              type="checkbox"
              checked={saveId}
              onChange={(e) => setSaveId(e.target.checked)}
            /> 
            사번 저장
          </label>
          
          <span 
            className={styles.passwordReset}
            onClick={handlePasswordReset}
          >
            비밀번호 찾기
          </span>
          
          <button 
            className={styles.loginButton} 
            onClick={handleLogin}
          >
            로그인
          </button>
        </div>
        
        {/* 에러 메시지 표시 */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
      </div>
      
      {/* 비밀번호 찾기 모달 */}
      {showPasswordReset && (
        <PasswordReset 
          onClose={handleClosePasswordReset} 
          onPasswordChange={updateUserPassword}
        />
      )}
    </div>
  );
};

export default Login;
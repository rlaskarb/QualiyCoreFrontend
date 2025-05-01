
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';

// 인증 컨텍스트 생성
const AuthContext = createContext(null);

// 인증 제공자 컴포넌트
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 로드
  useEffect(() => {
    const loadUser = () => {
      const storedUser = secureLocalStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
        } catch (error) {
          console.error('저장된 사용자 정보를 파싱하는 중 오류 발생:', error);
          secureLocalStorage.removeItem('currentUser');
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // 로그인 함수
  const login = (userData) => {
    secureLocalStorage.setItem('currentUser', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  // 로그아웃 함수
  const logout = () => {
    secureLocalStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/login'); // 로그아웃 후 로그인 페이지로 이동
  };

  // 권한 확인 함수
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    
    // 관리자는 모든 권한을 가짐
    if (currentUser.role === 'ADMIN' || 
        (currentUser.permissions && currentUser.permissions.includes('all'))) {
      return true;
    }
    
    // 특정 권한 확인
    return currentUser.permissions && currentUser.permissions.includes(permission);
  };

  // 제공할 값
  const value = {
    currentUser,
    login,
    logout,
    loading,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 인증 컨텍스트 사용을 위한 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
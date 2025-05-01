// src/components/login/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredPermission, excludedUsers = [], adminOnly = false }) => {
  const { currentUser, loading, hasPermission } = useAuth();

  // 로딩 중이면 로딩 표시
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 접근 제한된 사용자 확인
  if (excludedUsers.includes(currentUser.id)) {
    return <Navigate to="/access-denied" replace />;
  }

  // admin 전용 페이지 확인
  if (adminOnly && currentUser.role !== 'ADMIN') {
    return <Navigate to="/access-denied" replace />;
  }

  // 권한 확인이 필요한 경우
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // 권한이 없는 경우 접근 거부 페이지로 리다이렉트
    return <Navigate to="/access-denied" replace />;
  }

  // 모든 조건 충족 시 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;
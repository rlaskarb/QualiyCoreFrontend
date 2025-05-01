
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AccessDenied = () => {
  const { currentUser } = useAuth();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '0 20px'
    }}>
      <h1>접근 권한이 없습니다</h1>
      <p>
        죄송합니다, {currentUser?.name}님은 이 페이지에 접근할 권한이 없습니다.
      </p>
      <p>
        접근 권한이 필요하시면 관리자에게 문의하세요.
      </p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/home" style={{ 
          padding: '10px 20px', 
          backgroundColor: '#3182CE', 
          color: 'white', 
          borderRadius: '5px',
          textDecoration: 'none',
          marginRight: '10px'
        }}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
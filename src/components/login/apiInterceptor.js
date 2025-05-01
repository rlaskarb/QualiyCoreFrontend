import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';

// 가짜 API 기본 URL
const API_BASE_URL = '/api';

// 기본 axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 요청 전에 실행되는 코드
    
    // 로컬 스토리지에서 토큰 가져오기
    const token = secureLocalStorage.getItem('authToken');
    
    // 토큰이 있으면 요청 헤더에 추가
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 응답 성공 시 실행되는 코드
    return response;
  },
  async (error) => {
    // 응답 오류 시 실행되는 코드
    const originalRequest = error.config;
    
    // 401 Unauthorized 오류이고 재시도하지 않은 경우
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 여기서는 실제로 서버에 토큰 갱신 요청을 하지 않고 가짜로 처리
        console.log('토큰 만료 감지, 자동 로그아웃 처리');
        
        // 로컬 스토리지에서 토큰 및 사용자 정보 제거
        secureLocalStorage.removeItem('authToken');
        secureLocalStorage.removeItem('currentUser');
        
        // 로그인 페이지로 리다이렉트
        window.location.href = '/login?session=expired';
        
        return Promise.reject(error);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

// 가짜 API 요청 모듈
const apiService = {
  // 사용자 로그인 (가짜)
  login: async (employeeId, password) => {
    try {
      // 실제로는 서버에 요청을 보내지만, 여기서는 가짜 응답 반환
      const mockResponse = {
        success: true,
        data: {
          token: "fake_jwt_token", // 실제로는 서버에서 받은 토큰
          user: {
            id: employeeId,
            // 다른 사용자 정보는 실제 구현에서 서버로부터 받음
          }
        }
      };
      
      // 실제 API 호출을 하는 것처럼 잠시 지연
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockResponse;
    } catch (error) {
      console.error('로그인 API 호출 실패:', error);
      throw error;
    }
  },
  
  // 사용자 로그아웃 (가짜)
  logout: async () => {
    try {
      // 실제로는 서버에 로그아웃 요청을 보내지만, 여기서는 가짜 응답 반환
      const mockResponse = {
        success: true,
        message: "로그아웃 성공"
      };
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return mockResponse;
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
      throw error;
    }
  },
  
  // 비밀번호 재설정 (가짜)
  resetPassword: async (employeeId, newPassword) => {
    try {
      // 실제로는 서버에 비밀번호 재설정 요청을 보내지만, 여기서는 가짜 응답 반환
      const mockResponse = {
        success: true,
        message: "비밀번호가 성공적으로 재설정되었습니다."
      };
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return mockResponse;
    } catch (error) {
      console.error('비밀번호 재설정 API 호출 실패:', error);
      throw error;
    }
  },
  
  // 보호된 리소스 요청 (가짜)
  fetchProtectedResource: async () => {
    try {
      // 실제로는 서버에 보호된 리소스 요청을 보내지만, 여기서는 가짜 응답 반환
      const mockResponse = {
        success: true,
        data: {
          // 보호된 리소스 데이터
        }
      };
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return mockResponse;
    } catch (error) {
      console.error('보호된 리소스 요청 실패:', error);
      throw error;
    }
  }
};

export default apiService;
// src/api/WortVolumeApi.js

import axios from 'axios';

// API 기본 설정
const API_BASE_URL = 'http://localhost:8080/api/v1';

// 워트량 조회 API
export const fetchWortVolumes = async (lotNo = '') => {
  try {
    
    const response = await axios.get(`${API_BASE_URL}/wort`, {
      params: { lotNo }
    });
    
    // 응답 구조 검증
    if (!response.data) {
      throw new Error('API 응답에 데이터가 없습니다');
    }
    
    // 서버에서 전달하는 데이터 구조에 따라 적절히 처리
    const resultData = response.data.wortVolumes || 
                      response.data.data?.wortVolumes || 
                      response.data.result?.wortVolumes ||
                      response.data;
    
    if (!resultData || !Array.isArray(resultData)) {
      throw new Error('유효한 워트량 데이터를 찾을 수 없습니다');
    }
    
    return resultData;
  } catch (error) {
    console.error('워트량 조회 중 오류 발생:', error);
    
    // API 요청 실패 정보 상세 로깅
    if (error.response) {
      // 서버가 응답은 했으나 2xx 상태 코드가 아닌 경우
      console.error('API 응답 상태:', error.response.status);
      console.error('API 응답 데이터:', error.response.data);
    } else if (error.request) {
      // 요청은 전송되었지만 응답은 받지 못한 경우
      console.error('응답을 받지 못했습니다:', error.request);
    } else {
      // 요청 설정 자체에 오류가 있는 경우
      console.error('요청 오류:', error.message);
    }
    
    throw error; // 오류를 다시 던져서 컴포넌트에서 처리하도록 함
  }
};
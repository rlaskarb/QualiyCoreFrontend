// src/apis/production-process/carbonation-process/carbonationProcessApi.js

const API_BASE = 'http://localhost:8080/carbonationprocess';

// 작업지시 ID 목록 조회
export const fetchLineMaterial = async () => {
  try {
    const response = await fetch(`${API_BASE}/linematerial`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.result.lineMaterials || [];
  } catch (error) {
    console.error('작업지시 ID 목록 조회 실패:', error);
    throw error;
  }
};

// 탄산 조정 공정 등록
export const createCarbonationProcess = async (carbonationProcessDTO) => {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carbonationProcessDTO),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('탄산 조정 공정 등록 실패:', error);
    throw error;
  }
};

// 실제 종료시간 업데이트
export const completeEndTime = async (carbonationId) => {
  try {
    const response = await fetch(`${API_BASE}/update/${carbonationId}`, {
      method: 'PUT',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('탄산 조정 공정 종료시간 업데이트 실패:', error);
    throw error;
  }
};

// 탄산 조정 공정 상태 업데이트
export const updateCarbonationProcessStatus = async (carbonationProcessDTO) => {
  try {
    const response = await fetch(`${API_BASE}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carbonationProcessDTO),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('탄산 조정 공정 상태 업데이트 실패:', error);
    throw error;
  }
};

// API 모듈 export
export const carbonationProcessApi = {
  fetchLineMaterial,
  createCarbonationProcess,
  completeEndTime,
  updateCarbonationProcessStatus,
};

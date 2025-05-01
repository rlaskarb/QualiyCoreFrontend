// src/apis/production-process/maturation-detail/maturationDetailApi.js

const API_BASE = 'http://localhost:8080/maturationdetails';

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

// 숙성 상세 공정 등록
export const createMaturationDetails = async (maturationDetailsDTO) => {
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(maturationDetailsDTO),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('숙성 상세 공정 등록 실패:', error);
        throw error;
    }
};

// 실제 종료시간 업데이트
export const completeEndTime = async (maturationId) => {
    try {
        const response = await fetch(`${API_BASE}/update/${maturationId}`, {
            method: 'PUT',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('숙성 상세 공정 종료시간 업데이트 실패:', error);
        throw error;
    }
};

// 숙성 상세 공정 상태 업데이트
export const updateMaturationDetailsStatus = async (maturationDetailsDTO) => {
    try {
        const response = await fetch(`${API_BASE}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(maturationDetailsDTO),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('숙성 상세 공정 상태 업데이트 실패:', error);
        throw error;
    }
};

// 숙성 상세 공정 ID 목록 조회
export const fetchMaturationIds = async () => {
    try {
        const response = await fetch('http://localhost:8080/maturationtimedlog/maturation-ids');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.result.maturationIds || [];
    } catch (error) {
        console.error('숙성 상세 공정 ID 목록 조회 실패:', error);
        throw error;
    }
};

// API 모듈 export
export const maturationDetailApi = {
    fetchLineMaterial,
    createMaturationDetails,
    completeEndTime,
    updateMaturationDetailsStatus,
    fetchMaturationIds,
};

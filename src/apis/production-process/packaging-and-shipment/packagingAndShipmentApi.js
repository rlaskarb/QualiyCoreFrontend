const API_BASE = 'http://localhost:8080/packagingandshipment';

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

// 패키징 및 출하 공정 등록
export const createPackagingAndShipment = async (packagingAndShipmentDTO) => {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(packagingAndShipmentDTO),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('패키징 및 출하 공정 등록 실패:', error);
    throw error;
  }
};

// 패키징 및 출하 공정 상태 업데이트
export const updatePackagingAndShipmentStatus = async (packagingAndShipmentDTO) => {
  try {
    const response = await fetch(`${API_BASE}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(packagingAndShipmentDTO),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('패키징 및 출하 공정 상태 업데이트 실패:', error);
    throw error;
  }
};

// API 모듈 export
export const packagingAndShipmentApi = {
  fetchLineMaterial,
  createPackagingAndShipment,
  updatePackagingAndShipmentStatus,
};

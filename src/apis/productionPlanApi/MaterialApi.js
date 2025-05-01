// materialApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1/materials';

export const getStockStatus = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error('자재 재고 현황 조회 실패:', error);
    throw error;
  }
};

export const getMaterialRequests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/requests`);
    return response.data;
  } catch (error) {
    console.error('자재 구매 신청 내역 조회 실패:', error);
    throw error;
  }
};

export const requestMaterial = async (requestData) => {
  try {
    // ✅ 기존 자재 요청 (planMaterialId가 있는 경우)
    if (requestData.planMaterialId) {
      const response = await axios.post(`${BASE_URL}/request`, requestData);
      return response.data;
    } 
    // ✅ 신규 자재 요청 (planMaterialId가 없는 경우)
    else {
      const newRequestData = {
        materialId: requestData.materialId, // 신규 자재 ID
        materialName: requestData.materialName, // 신규 자재명
        requestQty: requestData.requestQty,
        deliveryDate: requestData.deliveryDate,
        reason: requestData.reason,
        note: requestData.note,
      };
      const response = await axios.post(`${BASE_URL}/request`, newRequestData);
      return response.data;
    }
  } catch (error) {
    console.error('자재 구매 신청 실패:', error);
    throw error;
  }
};

export const updateMaterialRequestStatus = async (requestId, status) => {
  try {
    const response = await axios.put(`${BASE_URL}/request/${requestId}/status?status=${status}`);

    return response.data;
  } catch (error) {
    console.error('자재 구매 신청 상태 변경 실패:', error);
    throw error;
  }
};


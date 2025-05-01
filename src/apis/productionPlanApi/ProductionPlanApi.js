import axios from 'axios';

// ⭐productionPlanApi.js (API 호출)⭐
// 🔵 생산 계획 조회 (GET)
export const fetchProductionPlans = async (planYm, status) => {
  try {
    const response = await axios.get('http://localhost:8080/api/v1/plans', {
      params: {
        planYm: planYm,
        status: status,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("서버 응답 에러:", error.response.status, error.response.data);
    } else {
      console.error("API 호출 중 네트워크 오류:", error.message);
    }
    return [];
  }
};


export const updatePlanStatus = async (planId, status) => {
  try {
      const response = await axios.post(`http://localhost:8080/api/v1/statusUpdate/${planId}`, null, {
          params: { status }
      });
      return response.data;
  } catch (error) {
      console.error('상태 업데이트 실패:', error);
      throw error;
  }
};


import axios from "axios";

const FERMENTATION_DETAILS_API_BASE_URL = "http://localhost:8080/fermentationdetails";

const fermentationDetailsApi = {
  
  // ✅ 작업지시 ID 목록 조회
  getWorkOrderList: async () => {
    try {
      const response = await axios.get(`${FERMENTATION_DETAILS_API_BASE_URL}/linematerial`);
      return response.data.result.lineMaterials;
    } catch (error) {
      console.error("❌ 작업지시 ID 목록 조회 실패:", error);
      throw error;
    }
  },

  // ✅ 특정 LOT_NO에 대한 자재 정보 조회
  getMaterialsByLotNo: async (lotNo) => {
    try {
      const response = await axios.get(`${FERMENTATION_DETAILS_API_BASE_URL}/ferment/${lotNo}`);
      return response.data.result.materials;
    } catch (error) {
      console.error(`❌ LOT_NO=${lotNo} 자재 정보 조회 실패:`, error);
      throw error;
    }
  },

  // ✅ 발효 상세 공정 등록
  createFermentationDetails: async (fermentationDetailsData) => {
    try {
      const response = await axios.post(`${FERMENTATION_DETAILS_API_BASE_URL}/register`, fermentationDetailsData);
      return response.data;
    } catch (error) {
      console.error("❌ 발효 상세 공정 등록 실패:", error);
      throw error;
    }
  },

  // ✅ 특정 발효 공정 완료 (최종 당도 및 종료 시간 업데이트)
  completeFermentationDetails: async (fermentationId, finalSugarContent) => {
    try {
      const response = await axios.put(`${FERMENTATION_DETAILS_API_BASE_URL}/update/${fermentationId}`, {
        finalSugarContent,
      });
      return response.data;
    } catch (error) {
      console.error(`❌ 발효 공정 완료 실패 - ID: ${fermentationId}`, error);
      throw error;
    }
  },

  // ✅ 특정 LOT_NO의 발효 공정 상태 업데이트
  updateFermentationDetailsStatus: async (fermentationDetailsData) => {
    try {
      const response = await axios.put(`${FERMENTATION_DETAILS_API_BASE_URL}/update`, fermentationDetailsData);
      return response.data;
    } catch (error) {
      console.error(`❌ 발효 공정 상태 업데이트 실패 - LOT_NO: ${fermentationDetailsData.lotNo}`, error);
      throw error;
    }
  },

  // ✅ 발효 시간대별 전체 데이터 조회
  getAllTimedLogs: async (fermentationId) => {
    try {
      const url = fermentationId
        ? `${FERMENTATION_DETAILS_API_BASE_URL}/timed-logs?fermentationId=${fermentationId}`
        : `${FERMENTATION_DETAILS_API_BASE_URL}/timed-logs`;
      
      const response = await axios.get(url);
      return response.data.result.logs;
    } catch (error) {
      console.error("❌ 발효 시간대별 전체 데이터 조회 실패:", error);
      throw error;
    }
  }
};

export default fermentationDetailsApi;

import axios from "axios";

const COOLING_PROCESS_API_BASE_URL = "http://localhost:8080/coolingprocess";

const coolingProcessApi = {
  
  // ✅ 작업지시 ID 목록 조회
  getWorkOrderList: async () => {
    try {
      const response = await axios.get(`${COOLING_PROCESS_API_BASE_URL}/linematerial`);
      return response.data.result.lineMaterials;
    } catch (error) {
      console.error("❌ 작업지시 ID 목록 조회 실패:", error);
      throw error;
    }
  },

  // ✅ 특정 LOT_NO에 대한 자재 정보 조회
  getMaterialsByLotNo: async (lotNo) => {
    try {
      const response = await axios.get(`${COOLING_PROCESS_API_BASE_URL}/status/${lotNo}`);
      return response.data.result.materials;
    } catch (error) {
      console.error(`❌ LOT_NO=${lotNo} 자재 정보 조회 실패:`, error);
      throw error;
    }
  },

  // ✅ 냉각 공정 등록
  createCoolingProcess: async (coolingProcessData) => {
    try {
      const response = await axios.post(`${COOLING_PROCESS_API_BASE_URL}/register`, coolingProcessData);
      return response.data;
    } catch (error) {
      console.error("❌ 냉각 공정 등록 실패:", error);
      throw error;
    }
  },

  // ✅ 특정 냉각 공정 완료 (실제 종료 시간 업데이트)
  completeEndTime: async (coolingId) => {
    try {
      const response = await axios.put(`${COOLING_PROCESS_API_BASE_URL}/update/${coolingId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ 냉각 공정 완료 실패 - ID: ${coolingId}`, error);
      throw error;
    }
  },

  // ✅ 특정 LOT_NO의 냉각 공정 상태 업데이트
  updateCoolingProcessStatus: async (coolingProcessData) => {
    try {
      const response = await axios.put(`${COOLING_PROCESS_API_BASE_URL}/update`, coolingProcessData);
      return response.data;
    } catch (error) {
      console.error(`❌ 냉각 공정 상태 업데이트 실패 - LOT_NO: ${coolingProcessData.lotNo}`, error);
      throw error;
    }
  }
};

export default coolingProcessApi;

import axios from "axios";

const BASE_URL = "http://localhost:8080/filtrationprocess";

const filtrationProcessApi = {

    
  // 📌 작업지시 ID 목록 조회
  getWorkOrderList: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/linematerial`);
      return response.data.result?.lineMaterials || [];
    } catch (error) {
      console.error("❌ 작업지시 ID 목록 조회 실패:", error);
      throw error;
    }
  },




  // 📌 특정 LOT_NO에 대한 자재 정보 조회
  getMaterialsByLotNo: async (lotNo) => {
    try {
      const response = await axios.get(`${BASE_URL}/${lotNo}`);
      return response.data.result?.materials || [];
    } catch (error) {
      console.error(`❌ 자재 정보 조회 실패 (LOT_NO: ${lotNo}):`, error);
      throw error;
    }
  },


   // 📌 여과 공정 전체 조회
   getAllFiltrationProcesses: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/all`);
      return response.data.result?.data || [];
    } catch (error) {
      console.error("❌ 여과 공정 전체 조회 실패:", error);
      throw error;
    }
  },

  // 📌 특정 LOT_NO의 여과 공정 상세 조회
  getFiltrationProcessesByLotNo: async (lotNo) => {
    try {
      const response = await axios.get(`${BASE_URL}/filtration/${lotNo}`);
      return response.data.result?.data || [];
    } catch (error) {
      console.error(`❌ 여과 공정 상세 조회 실패 (LOT_NO: ${lotNo}):`, error);
      throw error;
    }
  },



  // 📌 여과공정 데이터 저장 (CREATE)
  saveFiltrationProcess: async (filtrationRequestData) => {
    try {
      const response = await axios.post(`${BASE_URL}/register`, filtrationRequestData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("❌ 여과공정 데이터 저장 실패:", error);
      throw error;
    }
  },



  // 📌 특정 FiltrationID의 회수된 워트량, 손실량 및 실제 종료시간 업데이트
  updateFiltrationProcess: async (filtrationId, updatePayload) => {
    console.log("updatePayload : ", updatePayload)
    if (!filtrationId) {
      console.error("❌ updateFiltrationProcess 요청 실패: filtrationId가 없습니다.");
      throw new Error("Filtration ID is required");
    }

    try {

      const response = await axios.put(
        `${BASE_URL}/update/${filtrationId}`,
        {
          recoveredWortVolume: updatePayload.recoveredWortVolume ? Number(updatePayload.recoveredWortVolume) : 0,
          lossVolume: updatePayload.lossVolume ? Number(updatePayload.lossVolume) : 0,
          actualEndTime: updatePayload.actualEndTime ? new Date(updatePayload.actualEndTime).toISOString() : new Date().toISOString(),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`❌ 여과공정 업데이트 실패 (FiltrationID: ${filtrationId}):`, error);
      throw error;
    }
  },



  // 📌 특정 LOT_NO의 공정 상태 업데이트
  updateFiltrationStatus: async (lotNo, processTrackingUpdate) => {
    try {
      const response = await axios.put(`${BASE_URL}/update`, processTrackingUpdate, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error(`❌ 공정 상태 업데이트 실패 (LOT_NO: ${lotNo}):`, error);
      throw error;
    }
  },
};

export default filtrationProcessApi;

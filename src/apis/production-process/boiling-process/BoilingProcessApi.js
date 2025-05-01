import axios from "axios";

const BASE_URL = "http://localhost:8080/boilingprocess";

const boilingProcessApi = {
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
      const response = await axios.get(`${BASE_URL}/boiling/${lotNo}`);
      return response.data.result?.materials || [];
    } catch (error) {
      console.error(`❌ 자재 정보 조회 실패 (LOT_NO: ${lotNo}):`, error);
      throw error;
    }
  },

  
   // 📌 끓임 공정 데이터 저장 (CREATE)
   saveBoilingProcess: async (boilingRequestData) => {
    try {
      const response = await axios.post(`${BASE_URL}/register`, boilingRequestData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("❌ 끓임 공정 데이터 저장 실패:", error);
      throw error;
    }
  },




 // 📌 끓임 공정 업데이트 (끓임 후 워트량, 끓임 손실량 및 실제 종료시간 수정)
 updateBoilingProcessByLotNo: async (lotNo, updatePayload) => {
  if (!lotNo) {
    console.error("❌ updateBoilingProcess 요청 실패: lotNo가 없습니다.");
    throw new Error("Lot No is required");
  }

  try {

    const response = await axios.put(
      `${BASE_URL}/update/lot/${lotNo}`,
      updatePayload,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error(`❌ 끓임 공정 업데이트 실패 (Lot No: ${lotNo}):`, error);
    throw error;
  }
},


// 📌 특정 LOT_NO에 대한 끓임 공정 데이터 조회
getBoilingProcessByLotNo: async (lotNo) => {
  try {
    const response = await axios.get(`${BASE_URL}/lot/${lotNo}`);
    return response.data.result || null;
  } catch (error) {
    console.error(`❌ 끓임 공정 데이터 조회 실패 (LOT_NO: ${lotNo}):`, error);
    throw error;
  }
},




  // 📌 홉 투입 정보 업데이트
  updateHopInfo: async (boilingId, hopPayload) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/hop/${boilingId}`,
        hopPayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ 홉 투입 정보 업데이트 실패 (BoilingID: ${boilingId}):`,
        error
      );
      throw error;
    }
  },

  // 📌 특정 LOT_NO의 끓임 공정 상태 업데이트
  updateBoilingStatus: async (lotNo, processTrackingUpdate) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update`,
        processTrackingUpdate,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ 끓임 공정 상태 업데이트 실패 (LOT_NO: ${lotNo}):`,
        error
      );
      throw error;
    }
  },
};

export default boilingProcessApi;

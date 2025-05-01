import axios from "axios";

const BASE_URL = "http://localhost:8080/mashingprocess";

const mashingProcessApi = {
  // 📌 당화 데이터 저장 (CREATE)
  saveMashingData: async (mashingRequestData) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/register`,
        mashingRequestData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ 당화 데이터 저장 실패:", error);
      throw error;
    }
  },

  // 📌 특정 LOT_NO에 대한 분쇄공정 상태 업데이트
  updateMashingStatus: async (lotNo, mashingStatusUpdate) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update`,
        mashingStatusUpdate,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ 분쇄공정 상태 업데이트 실패 (LOT_NO: ${lotNo}):`,
        error
      );
      throw error;
    }
  },


  
 // 📌 당화공정 pH 값 및 실제 종료시간 업데이트
updateMashingProcess: async (mashingId, mashingUpdatePayload) => {
  if (!mashingId) {
    console.error("❌ updateMashingProcess 요청 실패: mashingId가 없습니다.");
    throw new Error("Mashing ID is required");
  }

  try {

    const response = await axios.put(
      `${BASE_URL}/update/${mashingId}`,
      {
        phValue: mashingUpdatePayload.phValue || null, 
        actualEndTime: mashingUpdatePayload.actualEndTime || new Date().toISOString(),
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(
        `❌ 당화공정 업데이트 실패 (MashingID: ${mashingId}):`,
        error.response.data
      );
    } else {
      console.error(`❌ 당화공정 업데이트 실패 (MashingID: ${mashingId}):`, error);
    }
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
      return [];
    }
  },

  // 📌 작업지시 ID 목록 조회
  getWorkOrderList: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/linematerial`);

      const workOrderList = response.data;
      return workOrderList;
    } catch (error) {
      console.error("❌ 작업지시 ID 목록 조회 실패:", error);
      throw error;
    }
  },
};

export default mashingProcessApi;

import axios from 'axios';

const BASE_URL = 'http://localhost:8080/productionprocess';

const materialGrindingApi = {
     // ✅ 전체 분쇄공정 데이터 조회 (추가된 기능)
     getMaterialGrindingList: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/materialgrinding`);
            return response.data;
        } catch (error) {
            console.error("❌ 분쇄공정 데이터 전체 조회 실패:", error);
            throw error;
        }
    },

    // ✅ 특정 LOT_NO의 분쇄공정 데이터 조회
    getGrindingByLotNo: async (lotNo) => {
        try {
            const apiUrl = `${BASE_URL}/materialgrinding/${lotNo}`;

            const response = await axios.get(apiUrl);

            return response.data || [];  
        } catch (error) {
            console.error("❌ 주원료 불러오기 실패:", error);
            return [];  
        }
    },
 
    //  분쇄 데이터 저장 (CREATE)
    saveGrindingData: async (data) => {
        try {
            const response = await axios.post(`${BASE_URL}/materialgrinding`, data, {
                headers: { "Content-Type": "application/json" }
            });
            return response.data;
        } catch (error) {
            console.error("❌ 분쇄 데이터 저장 실패:", error);
            throw error;
        }
    },


     // ✅ 분쇄 공정 상태 업데이트 (UPDATE)
     updateProcessStatus: async (data) => {
        try {
            const response = await axios.put(`${BASE_URL}/update`, data, {
                headers: { "Content-Type": "application/json" }
            });
            return response.data;
        } catch (error) {
            console.error("❌ 공정 상태 업데이트 실패:", error);
            throw error;
        }
    },


    getLineMaterial: async () => {
        try {
            const url = `${BASE_URL}/linematerial`;
            console.log("📌 실제 요청 URL:", url);  // ✅ 요청 URL 로그 확인
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("❌ 작업지시 목록 불러오기 실패:", error);
            throw error;
        }
    },


      // ✅ 특정 LOT_NO의 주원료 데이터 조회
     getRawMaterialByLotNo: async (lotNo) => {
        try {
            const apiUrl = `${BASE_URL}/${lotNo}`;

            const response = await axios.get(apiUrl);

            return response.data || [];  // ✅ null 대신 빈 배열 반환
        } catch (error) {
            console.error("❌ 주원료 불러오기 실패:", error);
            return [];  // ✅ 오류 시 빈 배열 반환하여 UI 오류 방지
        }
    }
};



export default materialGrindingApi;





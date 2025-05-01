import axios from "axios";

export const routingApi = {
    getProcessTracking: async (params) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/v1/processTracking`,
                {
                    params: {
                        lotNo: params.lotNo || '',
                        processStatus: params.processStatus || ''
                    }
                }
            );
            return response.data.result.trackingList;
        } catch (error) {
            // 에러 상세 정보 로깅
            console.error("공정 현황 조회 중 오류:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    }
};
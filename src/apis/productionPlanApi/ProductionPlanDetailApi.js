import axios from 'axios';

// 생산 계획 상세 정보 조회 API
export const fetchProductionPlanDetail = async (planId) => {
  try {
    console.log(`API 호출: http://localhost:8080/api/v1/detail/${planId}`);

    const response = await axios.get(`http://localhost:8080/api/v1/detail/${planId}`);
    
    if (response.status === 200) {
   
      if (response.data.code === 200) {
        console.log("- response.data.result:", response.data.result);
        
        if (response.data.result && response.data.result.planDetail) {
          const planDetail = response.data.result.planDetail;

          // 데이터 구조 확인 및 가공
          if (planDetail.planMst) {
            // 중첩된 planProducts 구조 간소화
            const simplifiedPlanDetail = {
              ...planDetail,
              planProducts: planDetail.planProducts.map(product => ({
                ...product,
                planMst: undefined // 중복된 참조 제거
              }))
            };

            return simplifiedPlanDetail;
          }
        }
      }
      
      // 예외 처리: 유효한 데이터가 없는 경우
      throw new Error('유효한 생산 계획 데이터를 찾을 수 없습니다.');
    } else {
      throw new Error(response.data?.message || '생산 계획 상세 정보 로드 실패');
    }
  } catch (error) {
    console.error('생산 계획 상세 정보 API 호출 오류:', error);
    
    // 상세 에러 로깅
    if (error.response) {
      console.error('응답 에러 데이터:', error.response.data);
      console.error('응답 에러 상태:', error.response.status);
    }
    
    throw error;
  }
};


import axios from 'axios';

export const productionPlanStep1Api = async (planData) => {
    try{
      const response = await axios.post(`http://localhost:8080/api/v1/plans/step1`, planData);

        return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };
  
  // 🚨 API 오류 핸들링 함수
  const handleApiError = (error) => {
    if (error.response) {
      console.error("❌ 서버 응답 에러:", error.response.status, error.response.data);
    } else {
      console.error("🚨 네트워크 오류:", error.message);
    }
  };

  // 제품선택하면 제품에맞는 상세
  export const fetchProductBOM = async (productId) =>{
    try{
      const response = await axios.get(`http://localhost:8080/api/v1/productBom/${productId}`);
      return response.data; // BOM 데이터 반환
    }catch(error){
      console.log("❌ BOM 데이터를 불러오는 중 오류 발생:",error);
      return [];
    }
  };

  //드롭다운에 표시될 제품이름목록
  export const fetchProducts = async () => {
    try{
      const response = await axios.get("http://localhost:8080/api/v1/products");
      return response.data;
    }catch(error){
      console.log("❌ 제품 목록을 불러오는 중 오류 발생:", error);
      return[];

    }
  } 
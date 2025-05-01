import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/standardinformation/workplaces';

// 작업장 목록 가져오기
export const fetchWorkplaces = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/find`);
    return response.data;
  } catch (error) {
    console.error("작업장 조회 연결 실패:", error);
    throw error;
  }
};

// 작업장 추가
export const createWorkplace = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/regist`,formData,{
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  }catch(error){
    console.error("작업장 등록 연결 실패",error);
    throw error;
  }
};


// 작업장 수정
export const updateWorkplace = async (workplaceId, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${workplaceId}`,updatedData,{
        headers: { "Content-Type": "application/json" }
      });
    return response.data;
  } catch (error) {
    console.error("작업장 수정 연결 실패:", error);
    throw error;
  }
};


// 작업장 삭제
export const deleteWorkplace = async (workplaceId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${workplaceId}`);
    return response.data;
  } catch (error) {
    console.error("작업장 삭제 연결 실패:", error);
    throw error;
  }
};






import axios from "axios";

export const fetchProductionLines = async (planProductId) =>{
    try{
    const response = await axios.get(`http://localhost:8080/api/v1/plans/lines/${planProductId}`)
    return response.data
    }catch(error){
        console.log("생산제품 데이터 불러오는도중 에러",error);
        return[];
    }
}


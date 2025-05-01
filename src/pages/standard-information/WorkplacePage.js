import { useEffect, useState } from "react";
import { fetchWorkplaces , createWorkplace } from "../../apis/standard-information/WorkplaceApi";
import WorkplaceForm from "../../components/standard-information/WorkplaceForm";
import WorkplaceTable  from "../../components/standard-information/WorkplaceTable";
import "../../styles/standard-information/workplace-form.css";
import "../../styles/standard-information/workplace-table.css";



const WorkplacePage = () => {
  const [workplaces,setWorkplaces] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/standardinformation";


  //백엔드 에서 데이터 보내기
  useEffect(()=> {
    const getData = async () =>{
      try{
        const data = await fetchWorkplaces();
        setWorkplaces(data);
      }catch(error){
        console.error("데이터 불러오기 실패 ", error);
      }
    };
    getData();
  },[]);


  //작업장 추가
  const addWorkplace = async (newWorkplace) =>{
    try{
      const savedWorkplace = await createWorkplace(newWorkplace);
      setWorkplaces([...workplaces,savedWorkplace]); // 상태 업데이트
    }catch(error){
      console.error("작업장 정보 등록 실패 ",error);
    }
    };


      return(
        <div className="workplace-page">
          {/* ✅ apiUrl을 WorkplaceForm에 전달 */}
          <WorkplaceForm onAddWorkplace={addWorkplace} apiUrl={apiUrl} />
          <WorkplaceTable workplaces={workplaces} apiUrl={apiUrl} />

        </div>
      );
  };

export default WorkplacePage;
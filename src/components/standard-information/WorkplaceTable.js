import { useState , useEffect } from "react";
import axios from "axios";
import ConfirmModal from "./common/ConfirmModal";
import SuccessModal from "./common/SuccessfulModal";
import ErrorModal from "./common/ErrorModal";
import DeleteConfirmModal from "./common/DeleteConfirmModal";
import "../../styles/standard-information/workplace-table.css";
  /*
    -렌더링 : React가 화면을 다시 그리는과정
    -최초 렌더링 : 컴포넌트가 처음 나타날 때 실행
    -재 렌더링 : useState 값이 변경될때, props가 변경될 때 실행
    -렌더링 최적화 : useMemo() , useCallback(), React.memo 사용
  */


  /*
    --useState 는 React에서 상태를 관리하는 함수
      컴포넌트가 변경되어야 할 값을 저장하 는 역활
      React 컴포넌트가 상태를 변경하면 화면이 자동으로 다시 렌더링됨
      const[현재상태값(초기값:0),상태를변경하는함수] = useState(0);
  */

      

  const WorkplaceTable = ({workplaces,apiUrl}) => {
    
    // 수정 상태 관리

    // 현재 선택된 작업장의 데이터를 저장하는 상태
    const[selectedWorkplace, setSelectedWorkplace] =useState(null);

    // 수정할 작업장의 데이터를 저장하는 상태
    const[updatedData , setUpdatedData] = useState({});

    // 수정 폼이 열려 있는지 여부 (true = 열림, false = 닫힘)
    const[showEditForm , setShowEditForm] = useState(false);

    // 수정 확인 모달이 열려 있는지 여부 (true = 열림, false = 닫힘)
    const[showConfirmModal , setShowConfirmModal] =useState(false);
 
    // 수정 완료 후 성공 메시지를 표시하는 모달 상태 (true = 열림, false = 닫힘)
    const[showSuccessModal , setShowSuccessModal] = useState(false);

    // 오류 모달창 상태
    const[showErrorModal , setShowErrorModal] = useState(false);

    // API 요청 중 오류 발생 시 저장하는 메시지
    const[errorMessage , setErrorMessage] = useState("");

    useEffect(()=>{},[showEditForm]);

    /* 
     --useEffect 사용 이유--
     showEditForm 값이 변경될 때마다 자동으로 실행되는 함수
     주로 컴포넌트가 처음 렌더링 될때 또는 특정 값이 바뀔때 실행됨
     console.log 를 사용해서 showEditForm 값이 언제 변경되는지 확인 가능
     
     --useEffect 효과--
      - 처음 컴포넌트가 렌더링 될때 실행된다.
      - showEditForm 값이 true 또는 false 로 변경될 때마다 실행됨
      - console.log 를 통해 값이 변경될 떄마다 로그 확인 기능
     */


   


    // 오류 모달 닫기
    const handleErrorClose = () => {
      setShowErrorModal(false);
      setErrorMessage("");
    };

    // 수정 버튼 클릭 시 해당 장업장 정보 불러오기
    //workplaceId 가 없으면 console.error 로 오류 표시 후 함수실행을 중단
    //기존 updatedData(prev)를 유지하면서 새 데이터 추가
    // 데이터 변경이 일어나도 기존값이 사라지지 않도록 방지지
    const handleEditClick = (workplace) => {
      if(!workplace|| !workplace.workplaceId){
        console.error("Error: 선택된 작업장의 ID가 없습니다!");
        return;
      }
      setSelectedWorkplace(workplace);
      //기존값이 날아가는 것을 방지
      setUpdatedData((prev)=>({
        ...prev,...workplace,
      }));
      setShowEditForm(true);
    };


    // 입력 필드 값 변경 핸들러러
    // 기존데이터(prev)를 유지하면서 변경된 값만 업데이트
    // 값이 undefined이면 문자열("")을 기본값으로 설정
    // 예상치 못한 undefined 값으로 인해 오류 발생을 방지   
    const handleChange = (e) => {
      setUpdatedData((prev)=>({
        ...prev,[e.target.name]:e.target.value||prev[e.target.name]||"",
      }));
    };


    // 수정하기 버튼 클릭 시 확인 모달 표시
    const handleUpdateClick = () => {
      setShowConfirmModal(true);
    };


    const handleRefresh = () => {
      setShowSuccessModal(false); // 모달 닫기
      window.location.reload(); // 새로고침 실행
    };

    // API 호출하여 수정 요청 실행
    /*
      --어떤 상황에서 사용?
      - API 요청을 보낼때 (데이터를 서버에서 받아올 때)
      - 비동기 코드 실행후 결과를 기달려야 할때

      -- async 는 함수선언 앞에 위치!
      -- await 은 비동기 요청 앞에 위치!
      */

      const confirmUpdate  = async ()=>{
      const workplaceId = (selectedWorkplace?.workplaceId|| updatedData?.workplaceId||"").trim();
      const newWorkplaceCode = updatedData?.workplaceCode?.trim();

      // workplaceId 가 undefined일 경우 API 요청 방지
      if(!workplaceId){
        setErrorMessage("Error: workplaceId가 없습니다! API 요청 중단.");
        setShowErrorModal(true);
        console.error("Error: workplaceId가 없습니다! API 요청 중단.");
        return;
      }

      if(!apiUrl){
        setErrorMessage("Error: API URL이 설정되지 않았습니다!");
        setShowErrorModal(true);
        console.error("Error: API URL이 설정되지 않았습니다!");
        return;
      }

       //  중복 코드 체크
       const isCodeDuplicate = workplaces.some(
        (workplace) => workplace.workplaceCode === newWorkplaceCode && workplace.workplaceId !== workplaceId
       );

        if (isCodeDuplicate) {
        setErrorMessage("이미 사용 중인 작업장 코드입니다. 다른 코드를 입력해주세요.");
        setShowErrorModal(true);
        return;
        }

        // 중복이 없을 경우 API 호출
        const putUrl = `${apiUrl}/workplaces/${workplaceId}`;

        try{
            const response = await axios.put(putUrl,updatedData);

          if(response.status === 200){
            setShowSuccessModal(true);  // 성공 모달 표시
            setShowConfirmModal(false); // 확인 모달 닫기
            setShowEditForm(false); // 수정 폼 닫기
          }
        }catch(error){
          const errorMsg = error.response?.data?.message || "수정하는데 문제가 발생했어요"
          setErrorMessage(errorMsg);
          setShowErrorModal(true); // 오류 모달 표시
          setShowSuccessModal(false);
        }
      };


    // ================================================================================================================================================
    
    //삭제 관련 상태 관리!
    
    // 삭제할 작업장의 ID 를 저장하는 상태
    const[deleteTargetId , setDeleteTargetId] = useState(null);

    // 삭제할 작업장의 이름을 저장하는 상태 
    const [deleteTargetName, setDeleteTargetName] = useState("");

    //삭제 확인 모달(첫번째) (true = 열림 , false = 닫힘)
    const[showDeleteModal , setShowDeleteModal] = useState(false); 

    // 삭제 성공 모달 상태 추가
    const [showDeleteSuccessModal , setShowDeleteSuccessModal] = useState(false);

    const deleteWorkplace = async(workplaceId) => {
      try{
        const response = await axios.delete(`http://localhost:8080/standardinformation/workplaces/${workplaceId}`);

        return response.data;
      
      }catch(error){console.error("!!!작업장 삭제 실패!!!!" ,error);
        throw error;
      }
    };

    // 삭제 버튼 클릭시 모달 열기기
     const handleDeleteClick = (workplaceId, workplaceName) => {
      if (!workplaceId) return; // workplaceId가 없으면 실행 안 함
      setDeleteTargetId(workplaceId);
      setDeleteTargetName(workplaceName);
      setShowDeleteModal(true);
    };


     //모달 닫기 및 상태 초기화화
     const closeModal = () => {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      setDeleteTargetName("");
    };


    // 삭제 성공시 모달상태 추가
    const handleDeleteSuccessClose = () =>{
      setShowDeleteSuccessModal(false);
      window.location.reload() // 새로고침
    };


    // 최종 삭제 실행행
    const confirmDelete = async () => {
      if (!deleteTargetId){console.error("삭제 대상 ID가 설정되지 않았습니다.");
        return;
      }   

      try {
        
        await deleteWorkplace(deleteTargetId); // API 호출
        closeModal(); // 모달 닫기 및 상태 초기화
        setShowDeleteSuccessModal(true); // 삭제 성공시 모달표시시
      } catch (error) {
        console.error("삭제 실패:", error);
      }
    };
  

//===============================================================================================================================================

  return (
    <div>
      <table className="workplace-table">
        <thead>
          <tr>
            <th>작업장 이름</th>
            <th>작업장 코드</th>
            <th>작업장 위치</th>
            <th>작업장 타입</th>
            <th>LINE 정보</th>
            <th>작업장 상태</th>
            <th>작업 담당자</th>
            <th>생산가능 용량</th>
            <th>용량단위</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {workplaces.sort((a,b)=>{
            const numA = parseInt(a.workplaceName.match(/\d+/)?.[0] || "0", 10);
            const numB = parseInt(b.workplaceName.match(/\d+/)?.[0] || "0", 10);
            return numA - numB;
          }).map((item, index) => (
              <tr key={index}>
                <td>{item.workplaceName}</td>
                <td>{item.workplaceCode}</td>
                <td>{item.workplaceLocation}</td>
                <td>{item.workplaceType}</td>
                <td>{item.lineId}</td>
                <td>{item.workplaceStatus}</td>
                <td>{item.managerName}</td>
                <td>{item.workplaceCapacity}</td>
                <td>{item.workplaceCapacityUnit}</td>
              <td>
                <button className="workplace-edit-btn" onClick={()=>handleEditClick(item)}>수정</button>
                <button className="workplace-delete-btn" onClick={() => handleDeleteClick(item.workplaceId, item.workplaceName)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 수정 폼 팝업*/}
        {showEditForm &&(
          <div className="place-edit-form-container">
            <div className="place-edit-form">
              <h3> 작업장 정보 수정</h3>
             
              <div className="place-edit-row">
                  <div className="place-edit-field">
                    <label for="workplaceName">작업장 이름</label>
                      <input id="workplaceName" type="text" name="workplaceName" value={updatedData.workplaceName} onChange={handleChange}/>
                  </div>
                  <div className="place-edit-field">
                    <label for="workplaceType">작업장 타입</label>
                     <select id="workplaceType" name="workplaceType" value={updatedData.workplaceType} onChange={handleChange}> {/*수정!*/}
                        <option value="분쇄">분쇄</option>
                        <option value="당화">당화</option>
                        <option value="여과">여과</option>
                        <option value="끓임">끓임</option>
                        <option value="냉각">냉각</option>
                        <option value="발효">발효</option>
                        <option value="숙성">숙성</option>
                        <option value="숙성후여과">숙성 후 여과</option>
                        <option value="탄산조정">탄산조정</option>
                        <option value="패키징 및 출하">패키징 및 출하</option>
                     </select>          
                  </div>
                </div>

              <div className="place-edit-row">
                <div className="place-edit-field">
                  <label for="workplaceCode">작업장 코드</label>
                    <input id="workplaceCode" type="text" name="workplaceCode" value={updatedData.workplaceCode} onChange={handleChange} />
                </div>    
                <div className="place-edit-field">
                  <label for="workplaceStatus">작업장 상태</label>
                    <select id="workplaceStatus" name="workplaceStatus" value={updatedData.workplaceStatus} onChange={handleChange}>
                      <option value="가동">가동</option>
                      <option value="정지">정지</option>
                      <option value="고장">고장</option>
                      <option value="수리">수리</option>
                    </select>
                </div>
              </div>
        
              <div className="place-edit-row">
                <div className="place-edit-field">
                  <label for="workplaceLocation" >작업장위치</label>
                    <input id="workplaceLocation" type="text" name="workplaceLocation" value={updatedData.workplaceLocation} onChange={handleChange}/>
                </div>
              <div className="place-edit-field">
                <label for="lineId">LINE 정보</label>
                  <select id="lineId" name="lineId" value={updatedData.lineId} onChange={handleChange}>
                    <option value="LINE001">LINE001</option>
                    <option value="LINE002">LINE002</option>
                    <option value="LINE003">LINE003</option>
                    <option value="LINE004">LINE004</option>
                    <option value="LINE005">LINE005</option>
                  </select>
              </div>
            </div>


            <div className="place-edit-row">
              <div className="place-edit-field">
                <label for="managerName">작업담당자</label>  
                  <input id="managerName" type="text" name="managerName" value={updatedData.managerName} onChange={handleChange}/>
              </div>
              
              <div className="place-edit-field">
               <label for="workplaceCapacity">생산가능용량</label>
                <div className="place-capacity-container">
                    <input id="workplaceCapacity" type="text" name="workplaceCapacity" value={updatedData.workplaceCapacity} onChange={handleChange}/>
                    
                    <select id="workplaceCapacityUnit" name="workplaceCapacityUnit" value={updatedData.workplaceCapacityUnit} onChange={handleChange}>
                      <option value="L">L</option>  
                      <option value="kg">kg</option>  
                    </select>
                  </div>
              </div>
            </div>  

              {/* 버튼 */}
              <div className="place-edit-buttons">
                <button className="place-cancel-btn" onClick={()=>setShowEditForm(false)}>취소</button>
                <button className="place-update-btn" onClick={handleUpdateClick}>수정하기</button>
               
              </div>             
            </div>
          </div>
          
        )}


          {/*수정 확인 모달*/}
          <ConfirmModal
           isOpen={showConfirmModal}
           onClose={()=>setShowConfirmModal(false)}
           onConfirm={confirmUpdate}
           message="작업장 정보를 수정하시겠습니까?"
          />
          
          {/*수정완료 모달*/}
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={handleRefresh}  // "확인" 버튼 클릭 시 새로고침 실행
            message="작업장 정보가 성공적으로 수정되었습니다."
          />

          {/* 오류 발생시 오류모달 */}
          <ErrorModal
            isOpen={showErrorModal}
            onClose={handleErrorClose}
            message={errorMessage}
          />


          {/*삭제 확인 모달 */}
          {showDeleteModal && (
            <DeleteConfirmModal
              isOpen={showDeleteModal}
              onClose={closeModal}
              onConfirm={confirmDelete}
              itemName={deleteTargetName}
              />
          )}

          {/* 삭제 성공시 모달 */}
          <SuccessModal
            isOpen={showDeleteSuccessModal}
            onClose={handleDeleteSuccessClose}
            message="작업장이 성공적으로 삭제 되었습니다."
          />
      </div>  
    );
  }
  



export default WorkplaceTable;

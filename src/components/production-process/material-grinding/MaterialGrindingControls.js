import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import materialGrindingApi from "../../../apis/production-process/material-grinding/MaterialGrindingApi";
import ConfirmModal from "../../standard-information/common/ConfirmModal";
import SuccessfulModal from "../../standard-information/common/SuccessfulModal";
import ErrorModal from "../../standard-information/common/ErrorModal";
import CompleteModal from "../../standard-information/common/CompleteModal";
import styles from "../../../styles/production-process/MaterialGrindingControls.module.css";

const MaterialGrindingControls = ({ grindingData, setGrindingData, lineMaterial, setLineMaterial }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const [buttonLabel, setButtonLabel] = useState("등록하기");
  
  
  
  useEffect(() => {
    if (grindingData?.lotNo) {
      localStorage.setItem("selectedLotNo", grindingData.lotNo);
    }
  }, [grindingData?.lotNo]);





  


  // 🔹 타이머 설정: 공정 완료까지 남은 시간 카운트다운
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval); // ✅ 메모리 누수 방지
    } else if (timer === 0 && timerStarted) {
      setShowCompleteModal(true);
      setTimerStarted(false); // 모달이 뜬 후 타이머 상태 리셋
    }
  }, [timer, timerStarted]); // 상태체크



  
  const startTimer = () => {
    setTimerStarted(true); // ✅ 타이머 실행됨을 명확히 설정
    const totalTime =
      process.env.NODE_ENV === "development"
        ? 5
        : Number(grindingData.grindDuration) * 60;
    setTimer(totalTime);

    // ✅ 부모 상태 업데이트
    setGrindingData((prev) => ({ ...prev, processStatus: "진행 중" }));
  };




  const handleSave = async () => {
  
    if (!grindingData || !grindingData.lotNo) {
      alert("⚠️ LOT_NO를 입력해야 합니다!");
      return;
    }
  
    try {
      // ✅ 분쇄 공정 등록 여부 확인
      const checkLotResponse = await materialGrindingApi.getGrindingByLotNo(grindingData.lotNo);
  
      if (checkLotResponse?.result?.data && Array.isArray(checkLotResponse.result.data) && checkLotResponse.result.data.length > 0) {     
        alert(`⚠️ 작업지시 ID (${grindingData.lotNo})는 이미 분쇄 공정에 등록되었습니다!`);
        return;
      }
  
      // ✅ 데이터 저장
      const savedData = { ...grindingData };

      await materialGrindingApi.saveGrindingData(savedData);
  
      // ✅ 상태 업데이트 (진행 중으로 변경)
      const updatedData = {
        lotNo: grindingData.lotNo,
        processTracking: { processStatus: "진행 중" },
      };

      const response = await materialGrindingApi.updateProcessStatus(updatedData);
  
      if (response.status === 200 || response.status === 201) {
        setGrindingData((prev) => ({ ...prev, processStatus: "진행 중" }));
        setShowSuccessModal(true);
  
        // ✅ 등록된 작업지시 ID가 리스트에서 보이지 않도록 상태 업데이트
        setLineMaterial((prev) => prev.filter((item) => item.lotNo !== grindingData.lotNo));
      }
    } catch (error) {
      console.error("❌ 저장 실패:", error);
      setShowErrorModal(true);
    }
  };
  




  const handleConfirmClick = () => {
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  const handleButtonClick = () => {
    if (buttonLabel === "등록하기") {
      setShowConfirmModal(true);
    } else if (buttonLabel === "다음공정 이동") {
      setGrindingData((prev) => ({
        ...prev,
        processStatus: "대기 중",
      }));
      navigate("/mashing-process");
    }
  };
  return (
    <form
      className={styles.materialGrindingForm}
      onSubmit={(event) => event.preventDefault()}
    >
 {timer > 0 && (
  <div className={styles.timerContainer}>
    <img 
      src="/images/clock-un.gif" 
      alt="타이머 시계" 
      className={styles.timerGif}
    />
    <p className={styles.timerDisplay}>
      남은시간: <strong>{Math.floor(timer / 60)}</strong>분 <strong>{timer % 60}</strong>초
    </p>
  </div>
)}
  
  <div className={styles.grindingButtonContainer}>
  <button
    onClick={handleButtonClick}
    className={
      buttonLabel === "다음공정 이동" 
        ? styles.nextProcessButton 
        : styles.grindingSaveButton
    }
  >
    {buttonLabel}
  </button>
</div>

      <ConfirmModal
        isOpen={showConfirmModal}
        message=" 등록하시겠습니까?"
        onConfirm={() => {
          handleConfirmClick();
          setTimeout(handleSave, 100);
        }}
        onClose={() => setShowConfirmModal(false)}
      />

      <SuccessfulModal
        isOpen={showSuccessModal}
        message="데이터가 성공적으로 저장되었습니다!"
        onClose={() => {
          setShowSuccessModal(false);
          setTimerStarted(true); // 타이머 실행됨을 명확히 설정
          startTimer(); // 확인눌렀을때 타이머 시작
        }}
      />

      <ErrorModal
        isOpen={showErrorModal}
        message="데이터 저장에 실패했습니다. 다시 시도해주세요."
        onClose={() => setShowErrorModal(false)}
      />

      <CompleteModal
        isOpen={showCompleteModal}
        message={[
          "원재료 투입 및 분쇄 공정이 완료되었습니다.",
          "다음 공정으로 이동하시길 바랍니다.",
        ]}
        onClose={() => {
          console.log("완료 모달 닫힘");
          setShowCompleteModal(false);
          setButtonLabel("다음공정 이동");
        }}
      />
    </form>
  );
};

export default MaterialGrindingControls;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/production-process/CoolingProcessControls.module.css";
import coolingProcessApi from "../../../apis/production-process/cooling-process/CoolingProcessApi";
import ConfirmModal from "../../standard-information/common/ConfirmModal";
import SuccessfulModal from "../../standard-information/common/SuccessfulModal";
import ErrorModal from "../../standard-information/common/ErrorModal";
import CompleteModal from "../../standard-information/common/CompleteModal";

const CoolingProcessControls = ({ workOrder }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCoolingCompleteModal, setShowCoolingCompleteModal] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("등록하기");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCooling, setIsCooling] = useState(false);
  const [temperature, setTemperature] = useState(100); // 🔥 초기 온도 100°C
  const [timeLeft, setTimeLeft] = useState(0);
  const [tempAnimation, setTempAnimation] = useState(false); // 온도 변화 애니메이션 상태
  const navigate = useNavigate();
  const [coolingData, setCoolingData] = useState({
    lotNo: workOrder?.lotNo || "",
    coolingTime: 120, // 냉각 시간
    targetTemperature: 5, //  목표 온도 (°C)
    coolantTemperature: 2, //  냉각수 온도 (°C)
    notes: "",
    processStatus: "진행 중",
  }); 

  // workOrder가 변경될 때 lotNo 업데이트
 useEffect(() => {
    const savedLotNo = localStorage.getItem("selectedLotNo");
    if (savedLotNo) {
      setCoolingData((prev) => ({ ...prev, lotNo: savedLotNo }));
    }
  }, []);

  // LOT_NO가 변경되면 데이터 로드
  useEffect(() => {
    const savedLotNo = localStorage.getItem("selectedLotNo");
    if (savedLotNo) {
      setCoolingData((prev) => ({ ...prev, lotNo: savedLotNo }));
    }
  }, []);

  // LOT_NO가 변경되면 자재 정보 및 냉각 공정 데이터 조회 실행
  useEffect(() => {
    if (coolingData.lotNo) {
      fetchCoolingData(coolingData.lotNo);
    }
  }, [coolingData.lotNo]);
    
  // 냉각 공정 데이터 가져오기
  const fetchCoolingData = async (lotNo) => {
    try {
      const response = await coolingProcessApi.getCoolingProcessByLotNo(lotNo);
      console.log("📌 냉각 공정 API 응답:", response);
  
      if (response && response.result) {
        setCoolingData((prev) => ({
          ...prev,
          coolingTime: response.result.coolingTime || prev.coolingTime,
          targetTemperature: response.result.targetTemperature || prev.targetTemperature,
          coolantTemperature: response.result.coolantTemperature || prev.coolantTemperature,
          notes: response.result.notes || prev.notes,
          processStatus: response.result.processStatus || prev.processStatus,
        }));
      } else {
        console.warn("⚠️ 서버에서 받은 냉각 공정 데이터가 없음:", response);
      }
    } catch (error) {
      console.error("❌ 냉각 공정 데이터 불러오기 실패:", error);
    }
  };
  
  // ✅ 온도 감소 애니메이션 시작 - 개선된 버전
  const startCooling = () => {
    if (isCooling) return; // 이미 실행 중이면 중복 실행 방지

    setIsCooling(true);
    
    // 단계적으로 온도 감소
    const coolingInterval = setInterval(() => {
      setTemperature((prevTemp) => {
        // 온도 변화 애니메이션 트리거
        setTempAnimation(true);
        setTimeout(() => setTempAnimation(false), 400);
        
        // 비선형적인 냉각 속도 (초반에 빠르게, 나중에 천천히)
        const remainingTemp = prevTemp - coolingData.targetTemperature;
        const decrementAmount = Math.max(0.5, (remainingTemp / 10));
        
        const newTemp = prevTemp - decrementAmount;
        
        // 목표 온도에 도달하거나 거의 도달했을 때
        if (newTemp <= coolingData.targetTemperature + 0.5) {
          clearInterval(coolingInterval);
          setShowCoolingCompleteModal(true);
          setIsCooling(false);
          return coolingData.targetTemperature;
        }
        return Math.round(newTemp * 10) / 10; // 소수점 첫째 자리까지
      });
    }, 500); // 0.5초마다 업데이트 (더 자연스러운 감소)
  };

  // ✅ 타이머 실행 함수 - 당화 공정과 동일하게
  const startTimer = () => {
    setIsTimerRunning(true);
    setIsProcessing(true);
    const totalTime =
      process.env.NODE_ENV === "development"
        ? 5
        : Number(coolingData.coolingTime) * 60;
    setTimeLeft(totalTime);

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(countdown);
          setIsProcessing(false);
          setIsTimerRunning(false);
          setShowCompleteModal(true);
          setButtonLabel("다음 공정 이동");
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      await coolingProcessApi.createCoolingProcess(coolingData);
      setShowSuccessModal(true);
      setButtonLabel("다음 공정 이동");    
    } catch (error) {
      setShowErrorModal(true);
      setIsProcessing(false);
    }
  };

  const handleNextProcess = async () => {
    try {
      navigate("/fermentation-details");
    } catch (error) {
      setShowErrorModal(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCoolingData((prev) => ({ ...prev, [name]: value }));
  };

  // 타이머 표시 형식 변환 함수
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // 온도에 따른 색상 클래스 계산
  const getTemperatureClass = () => {
    const percentage = (temperature - coolingData.targetTemperature) / (100 - coolingData.targetTemperature);
    
    if (percentage > 0.7) return styles.tempHot;
    if (percentage > 0.4) return styles.tempWarm;
    if (percentage > 0.1) return styles.tempCool;
    return styles.tempCold;
  };

  return (
    <form
      className={`${styles.coolingProcessForm} ${isCooling ? styles.cooling : ''}`}
      onSubmit={(e) => e.preventDefault()}
    >
      <h2 className={styles.title}>냉각 공정</h2>

      <div className={styles.formGrid}>
        <div className={styles.gridItem}>
          <label className={styles.cLabel01}>작업지시 ID</label>
          <input
            className={styles.cItem01}
            type="text"
            name="lotNo"
            value={coolingData.lotNo}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.cLabel02}>냉각 소요 시간 (분):</label>
          <input
            className={styles.cItem02}
            type="number"
            name="coolingTime"
            value={coolingData.coolingTime}
            onChange={handleChange}
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.cLabel03}>냉각 온도 (°C):</label>
          <div 
            className={`${styles.tempDisplay} ${getTemperatureClass()} ${tempAnimation ? styles.tempPulse : ''}`}
          >
            <span className={styles.currentTemp}>{temperature}</span>
            <span className={styles.tempDivider}>/</span>
            <span className={styles.targetTemp}>{coolingData.targetTemperature}</span>
            <span className={styles.tempUnit}>°C</span>
          </div>
        </div>

        <div className={styles.gridItem}>
          <label className={styles.cLabel04}>냉각수 온도 (°C):</label>
          <input
            className={styles.cItem04}
            type="number"
            name="coolantTemperature"
            value={coolingData.coolantTemperature}
            onChange={handleChange}
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.cLabel05}>공정 상태:</label>
          <input
            className={styles.cItem05}
            type="text"
            name="processStatus"
            value={coolingData.processStatus}
            onChange={handleChange}
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.cLabel06}>메모 사항:</label>
          <input
            className={styles.cItem06}
            type="text"
            name="notes"
            value={coolingData.notes}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* 타이머 표시 - 당화 공정과 동일하게 */}
      {timeLeft > 0 && (
        <div className={styles.controlsContainer}>
          <div className={styles.timerContainer}>
            <div className={styles.timerLabel}>냉각 공정 진행 중</div>
            <div className={styles.timerDisplay}>
              <img src="/images/clock-un.gif" alt="타이머" className={styles.timerIcon} />
              <div className={styles.timerValue}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className={styles.timerStatus}>
              {isTimerRunning ? "공정이 진행 중입니다" : ""}
            </div>
          </div>
        </div>
      )}

      <div className={styles.buttonContainer}>
        <button
          className={styles.fSaveButton}
          onClick={() => {
            if (buttonLabel === "등록하기") {
              setShowConfirmModal(true);
            } else {
              handleNextProcess();
            }
          }}
          disabled={isProcessing}
        >
          {buttonLabel}
        </button>
      </div>

      {/* 모달 처리 */}
      <ConfirmModal
        isOpen={showConfirmModal}
        message="등록하시겠습니까?"
        onConfirm={() => {
          setShowConfirmModal(false);
          handleSave();
        }}
        onClose={() => setShowConfirmModal(false)}
      />

      <SuccessfulModal
        isOpen={showSuccessModal}
        message="데이터가 성공적으로 저장되었습니다!"
        onClose={() => { setShowSuccessModal(false); startCooling(); }} />
      <ErrorModal
        isOpen={showErrorModal}
        message="데이터 저장에 실패했습니다. 다시 시도해주세요."
        onClose={() => setShowErrorModal(false)}
      />
      <CompleteModal
        isOpen={showCompleteModal}
        message={["냉각 공정이 완료되었습니다.", "다음 공정으로 이동하세요."]}
        onClose={() => setShowCompleteModal(false)}
      />

      <ConfirmModal 
        isOpen={showCoolingCompleteModal} 
        message="설정한 온도에 도달하여 작업을 시작합니다." 
        onConfirm={() => { setShowCoolingCompleteModal(false); startTimer(); }} 
        onClose={() => { setShowCoolingCompleteModal(false); startTimer(); }}
      />
    </form>
  );
};

export default CoolingProcessControls;
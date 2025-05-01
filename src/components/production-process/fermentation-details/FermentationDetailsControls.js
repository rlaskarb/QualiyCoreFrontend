import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/production-process/FermentationDetailsControls.module.css";
import fermentationDetailsApi from "../../../apis/production-process/fermentation-details/FermentationDetailsApi";
import ConfirmModal from "../../standard-information/common/ConfirmModal";
import SuccessfulModal from "../../standard-information/common/SuccessfulModal";
import ErrorModal from "../../standard-information/common/ErrorModal";
import CompleteModal from "../../standard-information/common/CompleteModal";

const FermentationDetailsControls = ({ workOrder }) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showTempReachedModal, setShowTempReachedModal] = useState(false); // 온도 도달 모달
  const [buttonLabel, setButtonLabel] = useState("등록하기");
  const [startTemperature, setStartTemperature] = useState(5); // 🔥 초기 온도 5°C
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isHeating, setIsHeating] = useState(false); // 온도 상승 여부
  const [tempAnimation, setTempAnimation] = useState(false); // 온도 변화 애니메이션 상태
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [fermentationData, setFermentationData] = useState({
    lotNo: workOrder?.lotNo || "",
    fermentationTime: 336, // 발효 시간 (시간)
    startTemperature: 20, // 발효 온도 (°C)
    initialSugarContent: 15.5, // 초기당도
    finalSugarContent: "", // 최종당도
    yeastType: "", // 효모 종류
    yeastAmount: "", // 효모 투입량
    notes: "",
    processStatus: "진행 중",
  });

  // ✅ workOrder가 변경될 때 lotNo 업데이트
  useEffect(() => {
     const savedLotNo = localStorage.getItem("selectedLotNo");
     if (savedLotNo) {
       setFermentationData((prev) => ({ ...prev, lotNo: savedLotNo }));
     }
   }, []);
  
  // ✅ LOT_NO 가져오기 (이전 공정과 연동)
  useEffect(() => {
    const savedLotNo = localStorage.getItem("selectedLotNo");
    if (savedLotNo) {
      setFermentationData((prev) => ({ ...prev, lotNo: savedLotNo }));
    }
  }, []);

  const handleCompleteFermentation = async () => {
    try {
      if (!fermentationData.lotNo || !fermentationData.finalSugarContent) {
        console.warn(
          "⚠️ 필수 데이터 누락: lotNo, finalSugarContent, actualEndTime 확인 필요"
        );
        return;
      }
      const response = await fermentationDetailsApi.completeFermentationDetails(
        fermentationData.lotNo,
        fermentationData.finalSugarContent
      );
      if (response && response.success) {
      } else {
        console.warn("⚠️ 발효 공정 완료 실패:", response);
      }
    } catch (error) {
      console.error("❌ 발효 공정 완료 API 호출 중 오류 발생:", error);
    }
  };

  // 발효 공정 상세 정보 조회 (효모 데이터 포함)
  const fetchFermentationMaterials = async (lotNo) => {
    try {
      const materials = await fermentationDetailsApi.getMaterialsByLotNo(lotNo);
      const yeast = materials.find(
        (item) =>
          item.materialName === "에일 효모" || item.materialName === "라거 효모"
      );

      setFermentationData((prev) => ({
        ...prev,
        yeastType: yeast ? yeast.materialName : "", // 효모 종류
        yeastAmount: yeast ? yeast.totalQty : 0, // 효모 투입량
      }));
    
    } catch (error) {
      console.error(`❌ 발효 공정 자재 조회 실패 (LOT_NO: ${lotNo}):`, error);
    }
  };

  // ✅ LOT_NO가 설정되면 효모 데이터 조회
  useEffect(() => {
    if (fermentationData.lotNo) {
      fetchFermentationMaterials(fermentationData.lotNo);
    }
  }, [fermentationData.lotNo]);

  // 개선된 온도 상승 함수
  const startHeating = () => {
    if (isHeating) return; // 이미 실행 중이면 중복 실행 방지
    setIsHeating(true);

    const heatingInterval = setInterval(() => {
      setStartTemperature((prevTemp) => {
        // 온도 변화 애니메이션 트리거
        setTempAnimation(true);
        setTimeout(() => setTempAnimation(false), 400);
        
        // 비선형적인 상승 속도 (처음에 빠르게, 나중에 천천히)
        const remainingTemp = fermentationData.startTemperature - prevTemp;
        const incrementAmount = Math.max(0.5, (remainingTemp / 5));
        
        const newTemp = prevTemp + incrementAmount;
        
        // 목표 온도에 도달하거나 거의 도달했을 때
        if (newTemp >= fermentationData.startTemperature - 0.5) {
          clearInterval(heatingInterval);
          setShowTempReachedModal(true);
          setIsHeating(false);
          return fermentationData.startTemperature;
        }
        return Math.round(newTemp * 10) / 10; // 소수점 첫째 자리까지
      });
    }, 500); // 0.5초마다 업데이트
  };

  // ✅ 타이머 실행 함수 - 개선된 버전
  const startFermentationTimer = () => {
    setIsTimerRunning(true);
    setIsProcessing(true);
    
    // 개발 환경에서는 5초만 실행, 그 외에는 설정된 시간(시간)을 분으로 변환
    const totalTime =
      process.env.NODE_ENV === "development"
        ? 5
        : Number(fermentationData.fermentationTime) * 60;
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

  // ✅ 등록 & 저장
  const handleSave = async () => {
    try {
      setIsProcessing(true);
      await fermentationDetailsApi.createFermentationDetails(fermentationData);
      setShowSuccessModal(true);
      setButtonLabel("다음 공정 이동");
    } catch (error) {
      setShowErrorModal(true);
      setIsProcessing(false);
    }
  };

  const handleNextProcess = async () => {
    try {
      // ✅ 최종 당도가 입력되지 않은 경우 오류 모달 표시
      if (!fermentationData.finalSugarContent) {
        console.warn("⚠️ 최종 당도 입력이 필요합니다.");
        setShowErrorModal(true);
        return;
      }
  
      // ✅ 발효 공정 완료 API 호출
      await handleCompleteFermentation();
  
      // ✅ 다음 공정 페이지로 이동
      navigate("/maturation-details");
    } catch (error) {
      console.error("❌ 다음 공정 이동 중 오류 발생:", error);
      setShowErrorModal(true);
    }
  };

  useEffect(() => {
    if (fermentationData.startTemperature === undefined) {

      setFermentationData((prev) => ({ ...prev, startTemperature: 20 }));
    }
    if (startTemperature === undefined) {
      
      setStartTemperature(5); // 기본 5°C 설정
    }
  }, [fermentationData.startTemperature, startTemperature]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFermentationData((prev) => ({ ...prev, [name]: value }));
  };

  // 타이머 표시 형식 변환 함수
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // 온도에 따른 색상 클래스 계산
  const getTemperatureClass = () => {
    const percentage = (startTemperature - 5) / (fermentationData.startTemperature - 5);
    
    if (percentage < 0.3) return styles.tempCold;
    if (percentage < 0.6) return styles.tempCool;
    if (percentage < 0.9) return styles.tempWarm;
    return styles.tempHot;
  };

  return (
    <form
      className={`${styles.fermentationProcessForm} ${isHeating ? styles.heating : ''}`}
      onSubmit={(e) => e.preventDefault()}
    >
      <h2 className={styles.title}>발효 공정</h2>

      <div className={styles.formGrid}>
        <div className={styles.gridItem}>
          <label className={styles.feLabel01}>작업지시 ID</label>
          <input
            className={styles.feItem01}
            type="text"
            name="lotNo"
            value={fermentationData.lotNo}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.feLabel02}>발효 시간 (시간):</label>
          <input
            className={styles.feItem02}
            type="number"
            name="fermentationTime"
            value={fermentationData.fermentationTime}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.feLabel03}>발효 온도 (°C):</label>
          <div 
            className={`${styles.tempDisplay} ${getTemperatureClass()} ${tempAnimation ? styles.tempPulse : ''}`}
          >
            <span className={styles.currentTemp}>{startTemperature}</span>
            <span className={styles.tempDivider}>/</span>
            <span className={styles.targetTemp}>{fermentationData.startTemperature}</span>
            <span className={styles.tempUnit}>°C</span>
          </div>
        </div>

        <div className={styles.gridItem}>
          <label className={styles.feLabel04}>초기 당도:</label>
          <input
            className={styles.feItem04}
            type="number"
            name="initialSugarContent"
            value={fermentationData.initialSugarContent}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.feLabel05}>최종 당도:</label>
          <input
            className={styles.feItem05}
            type="number"
            name="finalSugarContent"
            value={fermentationData.finalSugarContent}
            onChange={handleChange}
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.feLabel06}>효모 종류:</label>
          <input
            className={styles.feItem06}
            type="text"
            name="yeastType"
            value={fermentationData.yeastType}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.feLabel07}>효모 투입량:</label>
          <input
            className={styles.feItem07}
            type="text"
            name="yeastAmount"
            value={fermentationData.yeastAmount}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.feLabel08}>공정 상태:</label>
          <input
            className={styles.feItem08}
            type="text"
            name="processStatus"
            value={fermentationData.processStatus}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.feLabel09}>메모 사항:</label>
          <input
            className={styles.feItem09}
            type="text"
            name="notes"
            value={fermentationData.notes}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* 타이머 표시 - 당화/냉각 공정과 동일한 스타일 */}
      {timeLeft > 0 && (
        <div className={styles.controlsContainer}>
          <div className={styles.timerContainer}>
            <div className={styles.timerLabel}>발효 공정 진행 중</div>
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
        onClose={() => {
          setShowSuccessModal(false);
          startHeating(); // ✅ 온도 상승 시작
        }}
      />

      <ConfirmModal
        isOpen={showTempReachedModal}
        message="설정한 온도에 도달하여 작업을 시작합니다."
        onConfirm={() => {
          setShowTempReachedModal(false);
          startFermentationTimer(); // ✅ 타이머 시작
        }}
        onClose={() => {
          setShowTempReachedModal(false);
          startFermentationTimer();
        }}
      />

      <CompleteModal
        isOpen={showCompleteModal}
        message={["발효 공정이 완료되었습니다.", "다음 공정으로 이동하세요."]}
        onClose={() => setShowCompleteModal(false)}
      />
      
      <ErrorModal
        isOpen={showErrorModal}
        message={
          fermentationData.finalSugarContent
            ? "데이터 저장에 실패했습니다. 다시 시도해주세요."
            : "최종 당도를 입력해야 합니다."
        }
        onClose={() => setShowErrorModal(false)}
      />
    </form>
  );
};

export default FermentationDetailsControls;
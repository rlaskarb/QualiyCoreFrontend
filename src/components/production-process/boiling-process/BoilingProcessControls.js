import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import boilingProcessApi from "../../../apis/production-process/boiling-process/BoilingProcessApi";
import filtrationProcessApi from "../../../apis/production-process/filtration-process/FiltrationProcessApi";
import ConfirmModal from "../../standard-information/common/ConfirmModal";
import SuccessfulModal from "../../standard-information/common/SuccessfulModal";
import ErrorModal from "../../standard-information/common/ErrorModal";
import CompleteModal from "../../standard-information/common/CompleteModal";
import styles from "../../../styles/production-process/BoilingProcessControls.module.css";

const BoilingProcessControls = ({ workOrder }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showTempReachedModal, setShowTempReachedModal] = useState(false); // 온도 도달 모달
  const [buttonLabel, setButtonLabel] = useState("등록하기");
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [temperature, setTemperature] = useState(20); // 초기 온도
  const [isHeating, setIsHeating] = useState(false); // 온도 상승 여부
  const [tempAnimation, setTempAnimation] = useState(false); // 온도 변화 애니메이션 상태
  const navigate = useNavigate();

  const [boilingData, setBoilingData] = useState({
    lotNo: "",
    boilingTime: 60,
    temperature: 100,
    initialWortVolume: "",
    postBoilWortVolume: "",
    boilLossVolume: "",
    firstHopName: "마그넘 홉",
    firstHopAmount: "",
    secondHopName: "",
    secondHopAmount: "",
    processStatus: "진행 중",
    notes: "",
  });

  // 로컬스토리지에서 LOT_NO를 불러와 상태에 저장
  useEffect(() => {
    const savedLotNo = localStorage.getItem("selectedLotNo");
    if (savedLotNo) {
      setBoilingData((prev) => ({ ...prev, lotNo: savedLotNo }));
    }
  }, []);

  // LOT_NO가 변경되면 자재 정보 및 여과 공정 데이터 조회 실행
  useEffect(() => {
    if (boilingData.lotNo) {
      fetchMaterials(boilingData.lotNo);
      fetchFiltrationData(boilingData.lotNo);
    }
  }, [boilingData.lotNo]);

  // 여과 공정 데이터 조회 함수
  const fetchFiltrationData = async (lotNo) => {
    try {
      const filtrationData =
        await filtrationProcessApi.getFiltrationProcessesByLotNo(lotNo);
      if (filtrationData.length > 0) {
        setBoilingData((prev) => ({
          ...prev,
          initialWortVolume: filtrationData[0].recoveredWortVolume || "",
        }));
      }
    } catch (error) {
      console.error(`❌ 여과 공정 데이터 조회 실패 (LOT_NO: ${lotNo}):`, error);
    }
  };

  // 자재 정보 조회 함수 (API 주소를 참고하여 수정)
  const fetchMaterials = async (lotNo) => {
    try {
      // boilingProcessApi의 getMaterialsByLotNo 메서드를 사용하여 자재 정보를 조회
      const materials = await boilingProcessApi.getMaterialsByLotNo(lotNo);

      // 첫 번째 홉: "마그너 홉" "캐스케이드 홉" 또는 "아마릴로 홉" 중 조회
      const firstHop = materials.find(
        (item) =>
          item.materialName === "마그넘 홉" ||
          item.materialName === "캐스케이드 홉" ||
          item.materialName === "아마릴로 홉"
      );

      // 두 번째 홉: "캐스케이드 홉" 또는 "아마릴로 홉" 중 조회
      const secondHop = materials.find(
        (item) =>
          item.materialName === "캐스케이드 홉" ||
          item.materialName === "아마릴로 홉"
      );

      // 상태 업데이트: 각 홉의 이름과 totalQty 값을 반영
      setBoilingData((prev) => ({
        ...prev,
        firstHopName: firstHop ? firstHop.materialName : "",
        firstHopAmount: firstHop ? firstHop.totalQty : 0,
        secondHopName: secondHop ? secondHop.materialName : "",
        secondHopAmount: secondHop ? secondHop.totalQty : 0,
      }));
    } catch (error) {
      console.error(`❌ 자재 정보 조회 실패 (LOT_NO: ${lotNo}):`, error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoilingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      await boilingProcessApi.saveBoilingProcess(boilingData);
      setShowSuccessModal(true);
      setButtonLabel("다음 공정 이동");
    } catch (error) {
      setShowErrorModal(true);
    }
  };

  // 온도에 따른 색상 클래스 계산 함수 추가
  const getTemperatureClass = () => {
    const percentage = (temperature - 20) / (boilingData.temperature - 20);
    
    if (percentage < 0.3) return styles.tempCold;
    if (percentage < 0.6) return styles.tempWarm;
    if (percentage < 0.9) return styles.tempHot;
    return styles.tempBoiling;
  };

  // 개선된 온도 상승 함수
  const startHeating = () => {
    if (isHeating) return; // 이미 실행 중이면 중복 실행 방지
    setIsHeating(true);

    const heatingInterval = setInterval(() => {
      setTemperature((prevTemp) => {
        // 온도 변화 애니메이션 트리거
        setTempAnimation(true);
        setTimeout(() => setTempAnimation(false), 400);
        
        // 비선형적인 상승 속도 (처음에 빠르게, 나중에 천천히)
        const remainingTemp = boilingData.temperature - prevTemp;
        const incrementAmount = Math.max(0.5, (remainingTemp / 5));
        
        const newTemp = prevTemp + incrementAmount;
        
        // 목표 온도에 도달하거나 거의 도달했을 때
        if (newTemp >= boilingData.temperature - 0.5) {
          clearInterval(heatingInterval);
          setShowTempReachedModal(true); // ✅ 목표 온도 도달 시 모달 표시
          setIsHeating(false);
          return boilingData.temperature;
        }
        return Math.round(newTemp * 10) / 10; // 소수점 첫째 자리까지
      });
    }, 500); // 0.5초마다 업데이트
  };

  // ✅ 타이머 실행 함수
  const startTimer = () => {
    setIsProcessing(true);
    const totalTime =
      process.env.NODE_ENV === "development"
        ? 5
        : Number(boilingData.boilingTime) * 60;
    setTimer(totalTime);

    const countdown = setInterval(() => {
      setTimer((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(countdown);
          setIsProcessing(false);
          setShowCompleteModal(true); // ✅ 완료 모달 표시
          setButtonLabel("다음 공정 이동");
          calculateLoss();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  // ✅ 끓임 손실량 및 끓임 후 워트량 계산
  const calculateLoss = () => {
    const initialVolume = Number(boilingData.initialWortVolume);
    const lossVolume = (initialVolume * 0.05).toFixed(2);
    const postBoilVolume = (initialVolume - lossVolume).toFixed(2);
    setBoilingData((prev) => ({
      ...prev,
      boilLossVolume: Number(lossVolume), // 🔹 반드시 숫자로 변환
      postBoilWortVolume: Number(postBoilVolume),
    }));
  };

  const handleNextProcess = async () => {
    try {
      const postBoilWortVolume = Number(boilingData.postBoilWortVolume) || 0; 
      const boilLossVolume = Number(boilingData.boilLossVolume) || 0;
  
      await boilingProcessApi.updateBoilingProcessByLotNo(boilingData.lotNo, {
        postBoilWortVolume,
        boilLossVolume,
        actualEndTime: new Date().toISOString(),
      });
  
      navigate("/cooling-process");
    } catch (error) {
      console.error("❌ 다음 공정 이동 중 오류 발생:", error);
      setShowErrorModal(true);
    }
  };
  
  // 타이머 형식 변환 함수
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <form
      className={styles.boilingProcessForm}
      onSubmit={(e) => e.preventDefault()}
    >
      <h2 className={styles.boilingTitle}>끓임 공정</h2>

      <div className={styles.formGrid}>
        <div className={styles.gridItem}>
          <label className={styles.bLabel01}>작업지시 ID</label>
          <input
            className={styles.bItem01}
            type="text"
            name="lotNo"
            value={boilingData.lotNo}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.bLabel02}>끓임 시간 (분)</label>
          <input
            className={styles.bItem02}
            type="number"
            name="boilingTime"
            value={boilingData.boilingTime}
            onChange={handleChange}
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.bLabel03}>끓임 온도 (°C)</label>
          <div 
            className={`${styles.tempDisplay} ${getTemperatureClass()} ${tempAnimation ? styles.tempPulse : ''}`}
          >
            <span className={styles.currentTemp}>{temperature}</span>
            <span className={styles.tempDivider}>/</span>
            <span className={styles.targetTemp}>{boilingData.temperature}</span>
            <span className={styles.tempUnit}>°C</span>
          </div>
        </div>

        <div className={styles.gridItem}>
          <label className={styles.bLabel04}>초기 워트량 (L)</label>
          <input
            className={styles.bItem04}
            type="number"
            name="initialWortVolume"
            value={boilingData.initialWortVolume}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.bLabel05}>끓임 후 워트량 (L)</label>
          <input
            className={styles.bItem05}
            type="number"
            name="postBoilWortVolume"
            value={boilingData.postBoilWortVolume}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.bLabel06}>끓임 손실량 (L)</label>
          <input
            className={styles.bItem06}
            type="number"
            name="boilLossVolume"
            value={boilingData.boilLossVolume}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.bLabel07}>첫 번째 홉</label>
          <input
            className={styles.bItem07}
            type="text"
            name="firstHopName"
            value={boilingData.firstHopName}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.bLabel08}>첫 번째 홉 투입량 (g)</label>
          <input
            className={styles.bItem08}
            type="number"
            name="firstHopAmount"
            value={boilingData.firstHopAmount}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.bLabel09}>두 번째 홉</label>
          <input
            className={styles.bItem09}
            type="text"
            name="secondHopName"
            value={boilingData.secondHopName}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.bLabel10}>두 번째 홉 투입량 (g)</label>
          <input
            className={styles.bItem10}
            type="number"
            name="secondHopAmount"
            value={boilingData.secondHopAmount}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.bLabel11}>공정 상태</label>
          <input
            className={styles.bItem11}
            type="text"
            name="processStatus"
            value={boilingData.processStatus}
            readOnly
          />
        </div>

        <div className={styles.gridItem}>
          <label className={styles.bLabel12}>메모 사항</label>
          <input
            className={styles.bItem12}
            type="text"
            name="notes"
            value={boilingData.notes}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* 타이머와 버튼을 포함하는 컨테이너 */}
      <div className={styles.controlsContainer}>
        {/* 타이머 영역 - 타이머가 있을 때만 표시 */}
        {timer > 0 ? (
          <div className={styles.timerContainer}>
            <div className={styles.timerLabel}>끓임 공정 진행 중</div>
            <div className={styles.timerDisplay}>
              <img
                src="/images/clock-un.gif"
                alt="타이머"
                className={styles.timerIcon}
              />
              <div className={styles.timerValue}>
                {formatTime(timer)}
              </div>
            </div>
            <div className={styles.timerStatus}>
              {isProcessing ? "공정이 진행 중입니다" : ""}
            </div>
          </div>
        ) : (
          <div></div> /* 타이머가 없을 때 빈 공간 생성 */
        )}

        {/* 버튼 영역 - 항상 오른쪽에 배치 */}
        <div className={styles.buttonContainer}>
          <button
            className={styles.bSaveButton}
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
          startTimer(); // ✅ 타이머 시작
        }}
      />

      <ErrorModal
        isOpen={showErrorModal}
        message="데이터 저장에 실패했습니다. 다시 시도해주세요."
        onClose={() => setShowErrorModal(false)}
      />

      <CompleteModal
        isOpen={showCompleteModal}
        message={["끓임 공정이 완료되었습니다.", "다음 공정으로 이동하세요."]}
        onClose={() => setShowCompleteModal(false)}
      />
    </form>
  );
};

export default BoilingProcessControls;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import filtrationProcessApi from "../../../apis/production-process/filtration-process/FiltrationProcessApi";
import ConfirmModal from "../../standard-information/common/ConfirmModal";
import SuccessfulModal from "../../standard-information/common/SuccessfulModal";
import ErrorModal from "../../standard-information/common/ErrorModal";
import CompleteModal from "../../standard-information/common/CompleteModal";
import styles from "../../../styles/production-process/FiltrationProcessControls.module.css";

const FiltrationProcessControls = ({ workOrder }) => {
  const [filtrationData, setFiltrationData] = useState({
    lotNo: "", // 작업지시 ID 자동 불러오기
    filtrationTime: "45",
    grainAbsorption: " ",
    recoveredWortVolume: "",
    lossVolume: "",
    processStatus: "진행 중",
    notes: "",
  });

  const [timer, setTimer] = useState(0); // 단일 타이머 상태 사용
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [filtrationId, setFiltrationId] = useState(null);
  const [buttonLabel, setButtonLabel] = useState("등록하기");
  const navigate = useNavigate();

  useEffect(() => {
    const savedLotNo = localStorage.getItem("selectedLotNo");
    if (savedLotNo) {
      setFiltrationData((prev) => ({ ...prev, lotNo: savedLotNo }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltrationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const saveData = {
        ...filtrationData,
        processStatus: "진행중",
      };

      const response = await filtrationProcessApi.saveFiltrationProcess(saveData);
      
      // ✅ 서버 응답에서 filtrationId를 받아서 저장해야 함
      if (response?.result?.saveFiltrationProcess?.filtrationId) {
        setFiltrationId(response.result.saveFiltrationProcess.filtrationId);
      } else {
        console.warn("⚠️ 서버 응답에 filtrationId가 없습니다.");
      }
  
      setFiltrationData((prev) => ({...prev, processStatus: "진행 중"}));
      setShowSuccessModal(true);
      setButtonLabel("다음 공정 이동");
    } catch (error) {
      setShowErrorModal(true);
    }
  };

  // ✅ 타이머 실행 함수
  const startTimer = () => {
    setIsProcessing(true);

    const totalTime =
      process.env.NODE_ENV === "development"
        ? 5
        : Number(filtrationData.filtrationTime) * 60;

    
    setTimer(totalTime); // 타이머 상태 설정

    const countdown = setInterval(() => {
      setTimer((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(countdown);
          setIsProcessing(false);
          setShowCompleteModal(true); // ✅ 완료 모달 표시
          setButtonLabel("다음 공정 이동");
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };


  const handleNextProcess = async () => {
    if (!filtrationData.recoveredWortVolume || isNaN(Number(filtrationData.recoveredWortVolume))) {
      console.error("❌ 회수된 워트량 값이 입력되지 않았거나 잘못된 값입니다.");
      setShowErrorModal(true);
      return;
    }

    if (!filtrationData.lossVolume || isNaN(Number(filtrationData.lossVolume))) {
      console.error("❌ 손실량 값이 입력되지 않았거나 잘못된 값입니다.");
      setShowErrorModal(true);
      return;
    }

    if(!filtrationId){
      setShowErrorModal(true);
      return;
    }

    try {
      await filtrationProcessApi.updateFiltrationProcess(filtrationId, {
        recoveredWortVolume: Number(filtrationData.recoveredWortVolume),
        lossVolume: Number(filtrationData.lossVolume),
        actualEndTime: new Date().toISOString(),
      });

      navigate("/boiling-process");
    } catch (error) {
      console.error(`❌ 여과공정 업데이트 실패 (FiltrationID: ${filtrationId}):`, error);
      setShowErrorModal(true);
    }
  };

  useEffect(() => {
  }, [filtrationId]);

  useEffect(() => {
    const savedMashingData = sessionStorage.getItem("mashingData");

    if (savedMashingData) {
      const parsedData = JSON.parse(savedMashingData);

      // ✅ 곡물 흡수량 계산 (곡물 흡수량 * 0.14)
      const calculatedAbsorption = parsedData.waterInputVolume
        ? parsedData.waterInputVolume * 0.14
        : 0;

      // ✅ 회수된 워트량 설정 (waterInputVolume 사용)
      const wortVolume = parsedData.waterInputVolume
        ? parsedData.waterInputVolume - calculatedAbsorption
        : 0;

      setFiltrationData((prev) => ({
        ...prev,
        lotNo: parsedData.lotNo || prev.lotNo,
        grainAbsorption: calculatedAbsorption.toFixed(1),
        recoveredWortVolume: wortVolume.toFixed(1), // 소수점 1자리 고정
      }));
    }
  }, []);

  useEffect(() => {
    if (!showCompleteModal) return; // ✅ 타이머가 끝난 후 실행
  
    setFiltrationData((prev) => {
      const lossVolume = prev.recoveredWortVolume
        ? (prev.recoveredWortVolume * 0.05).toFixed(1) // ✅ 5% 계산 (소수점 1자리)
        : 0;
  
      const updatedWortVolume = prev.recoveredWortVolume
        ? (Number(prev.recoveredWortVolume) - Number(lossVolume)).toFixed(1) // ✅ 손실량 반영한 회수된 워트량
        : 0;
  
      return { ...prev, lossVolume, recoveredWortVolume: updatedWortVolume };
    });
  }, [showCompleteModal]); // ✅ 완료 모달이 열릴 때 실행

  return (
    <form
      className={styles.filtrationProcessForm}
      onSubmit={(e) => e.preventDefault()}
    >
      <h2 className={styles.filtrationTitle}>여과 공정</h2>

      <div className={styles.fFormGrid}>
        <div className={styles.fGridItem}>
          <label className={styles.fLabel01}>작업지시 ID</label>
          <input
            className={styles.fItem01}
            type="text"
            value={filtrationData.lotNo}
            readOnly
          />
        </div>

        <div className={styles.fGridItem}>
          <label className={styles.fLabel02}>여과 소요 시간 (분)</label>
          <input
            className={styles.fItem02}
            type="number"
            name="filtrationTime"
            value={filtrationData.filtrationTime}
            onChange={handleChange}
          />
        </div>

        <div className={styles.fGridItem}>
          <label className={styles.fLabel03}>곡물 흡수량 (L)</label>
          <input
            className={styles.fItem03}
            type="number"
            name="grainAbsorption"
            value={filtrationData.grainAbsorption}
            onChange={handleChange}
          />
        </div>

        <div className={styles.fGridItem}>
          <label className={styles.fLabel04}>회수된 워트량 (L)</label>
          <input
            className={styles.fItem04}
            type="number"
            name="recoveredWortVolume"
            value={filtrationData.recoveredWortVolume}
            onChange={handleChange}
          />
        </div>

        <div className={styles.fGridItem}>
          <label className={styles.fLabel05}>손실량 (L)</label>
          <input
            className={styles.fItem05}
            type="number"
            name="lossVolume"
            value={filtrationData.lossVolume}
            onChange={handleChange}
          />
        </div>

        <div className={styles.fGridItem}>
          <label className={styles.fLabel07}>공정 상태</label>
          <input
            className={styles.fItem07}
            type="text"
            value={filtrationData.processStatus}
            readOnly
          />
        </div>

        <div className={styles.fGridItem}>
          <label className={styles.fLabel08}>메모 사항</label>
          <input
            className={styles.fItem08}
            type="text"
            name="notes"
            value={filtrationData.notes}
            onChange={handleChange}
          />
        </div>

        {/* 타이머와 버튼을 포함하는 컨테이너 */}
        <div className={styles.controlsContainer}>
          {/* 타이머 영역 - 타이머가 있을 때만 표시 */}
          {timer > 0 ? (
            <div className={styles.timerContainer}>
              <div className={styles.timerLabel}>여과 공정 진행 중</div>
              <div className={styles.timerDisplay}>
                <img src="/images/clock-un.gif" alt="타이머" className={styles.timerIcon} />
                <div className={styles.timerValue}>
                  {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
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
        </div>
        
        {/* 모달 처리 */}
        <ConfirmModal
          isOpen={showConfirmModal}
          message="등록하시겠습니까?"
          onConfirm={() => {
            setShowConfirmModal(false);
            setTimeout(() => {
              handleSave();
            }, 100);
          }}
          onClose={() => setShowConfirmModal(false)}
        />

        <SuccessfulModal
          isOpen={showSuccessModal}
          message="데이터가 성공적으로 저장되었습니다!"
          onClose={() => {
            setShowSuccessModal(false);
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
          message={["여과 공정이 완료되었습니다.", "다음 공정으로 이동하세요."]}
          onClose={() => setShowCompleteModal(false)}
        />
      </div>
    </form>
  );
};

export default FiltrationProcessControls;
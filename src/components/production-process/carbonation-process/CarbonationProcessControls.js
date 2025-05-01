import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { carbonationProcessApi } from "../../../apis/production-process/carbonation-process/carbonationProcessApi";
import ConfirmModal from "../../standard-information/common/ConfirmModal";
import SuccessfulModal from "../../standard-information/common/SuccessfulModal";
import ErrorModal from "../../standard-information/common/ErrorModal";
import CompleteModal from "../../standard-information/common/CompleteModal";
import styles from "../../../styles/production-process/CarbonationProcess.module.css";

const CarbonationProcessControls = () => {
    const [carbonationData, setCarbonationData] = useState({
        lotNo: "",
        carbonationTime: "120",
        co2CarbonationPercent: "12",
        processTemperature: "1",
        processPressure: "1.4",
        notes: "",
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [buttonLabel, setButtonLabel] = useState("등록하기");
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isProcessStarted, setIsProcessStarted] = useState(false);
    const [confirmModalShown, setConfirmModalShown] = useState(false);
    const [isNextProcessEnabled, setIsNextProcessEnabled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedLotNo = localStorage.getItem("selectedLotNo");
        if (savedLotNo) {
            setCarbonationData((prev) => ({ ...prev, lotNo: savedLotNo }));
        }
    }, []);

    useEffect(() => {
        if (isTimerRunning && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft <= 0 && isTimerRunning) {
            setIsTimerRunning(false);
            setButtonLabel("공정 완료");
            setShowCompleteModal(true);

        }
    }, [isTimerRunning, timeLeft]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCarbonationData(prev => ({ ...prev, [name]: value }));
    };

    const formatDateToISOStringWithoutMs = (date) => {
        return date.toISOString().split(".")[0];
    };

    const handleSave = async () => {
        try {
            setIsProcessing(true);

            if (!carbonationData.carbonationTime) {
                alert("탄산화 시간을 입력해주세요.");
                setIsProcessing(false);
                return;
            }

            const startTime = formatDateToISOStringWithoutMs(new Date());
            //테스트용으로 5초만 되게하고, 해제하면 입력한 시간대로 설정되도록 주석 처리
            const totalSeconds = 5;
            //const totalSeconds = carbonationData.carbonationTime * 60;
            const expectedEndTime = formatDateToISOStringWithoutMs(
                new Date(Date.now() + totalSeconds * 1000)
            );

            const response = await carbonationProcessApi.createCarbonationProcess({
                ...carbonationData,
                startTime,
                expectedEndTime
            });

            setCarbonationData(prev => ({
                ...prev,
                carbonationId: response?.carbonationId
            }));

            setShowSuccessModal(true);
            setButtonLabel("공정 진행 중");
            setTimeLeft(totalSeconds);
            setIsTimerRunning(true);
            setIsProcessStarted(true);
            setConfirmModalShown(true);
        } catch (error) {
            console.error("공정 등록 실패:", error);
            setShowErrorModal(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCompleteProcess = async () => {
        try {
            const actualEndTime = formatDateToISOStringWithoutMs(new Date());

            const response = await carbonationProcessApi.completeEndTime(carbonationData.carbonationId, {
                actualEndTime,
                co2CarbonationPercent: Number(carbonationData.co2CarbonationPercent),
                processTemperature: Number(carbonationData.processTemperature),
                processPressure: Number(carbonationData.processPressure),
                notes: carbonationData.notes
            });

        } catch (error) {
            console.error("공정 완료 처리 실패:", error);
            setShowErrorModal(true);
        }
    };

    const handleNextProcess = () => {
        navigate("/packaging_and-shipment");
    };

    const handleCloseCompleteModal = () => {

        setShowCompleteModal(false);
        setIsNextProcessEnabled(true)
        setButtonLabel("다음 공정 이동");
    };

    return (
        <form className={styles.carbonationForm} onSubmit={(e) => e.preventDefault()}>
            <h2 className={styles.carbonationTitle}>탄산 조정 공정</h2>

            <div className={styles.formGrid}>
                {/* 작업지시 ID */}
                <div className={styles.gridItem}>
                    <label>작업지시 ID</label>
                    <input
                        type="text"
                        value={carbonationData.lotNo}
                        readOnly
                    />
                </div>

                {/* 탄산 조정 소요 시간 */}
                <div className={styles.gridItem}>
                    <label>탄산 조정 소요 시간 (분)</label>
                    <input
                        type="number"
                        name="carbonationTime"
                        value={carbonationData.carbonationTime}
                        onChange={handleChange}
                        disabled={isProcessStarted}
                    />
                </div>

                {/* CO2 농도 */}
                <div className={styles.gridItem}>
                    <label>CO2 농도 (%)</label>
                    <input
                        type="number"
                        name="co2CarbonationPercent"
                        value={carbonationData.co2CarbonationPercent}
                        onChange={handleChange}
                    />
                </div>

                {/* 탄산 공정 온도 */}
                <div className={styles.gridItem}>
                    <label>탄산 공정 온도 (°C)</label>
                    <input
                        type="number"
                        name="processTemperature"
                        value={carbonationData.processTemperature}
                        onChange={handleChange}
                    />
                </div>

                {/* 공정 중 압력 */}
                <div className={styles.gridItem}>
                    <label>공정 중 압력 (bar)</label>
                    <input
                        type="number"
                        name="processPressure"
                        value={carbonationData.processPressure}
                        onChange={handleChange}
                    />
                </div>

                {/* 메모 */}
                <div className={styles.gridItem}>
                    <label>메모</label>
                    <input
                        type="text"
                        name="notes"
                        value={carbonationData.notes}
                        onChange={handleChange}
                    />
                </div>

             {/* 타이머 표시 */}
                    <div className={styles.gridItem} style={{ gridColumn: "1 / -1" }}>
                    {timeLeft > 0 ? (
                        <div className={styles.controlsContainer}>
                        <div className={styles.timerContainer}>
                            <div className={styles.timerLabel}>탄산 조정 공정 진행 중</div>
                            <div className={styles.timerDisplay}>
                            <img src="/images/clock-un.gif" alt="타이머" className={styles.timerIcon} />
                            <div className={styles.timerValue}>
                                {Math.floor(timeLeft / 60)}분 {timeLeft % 60}초
                            </div>
                            </div>
                            <div className={styles.timerStatus}>
                            {isTimerRunning ? "공정이 진행 중입니다" : ""}
                            </div>
                            <div className={styles.progressBar}>
                            <div 
                                className={styles.progressBarFill} 
                                style={{ 
                                width: `${(1 - timeLeft / (Number(carbonationData.carbonationTime) * 60)) * 100}%` 
                                }}
                            ></div>
                            </div>
                        </div>
                        
                        <div className={styles.buttonContainer}>
                            <button
                            className={styles.submitButton}
                            onClick={() => {
                                if (buttonLabel === "등록하기" && !confirmModalShown) {
                                setShowConfirmModal(true);
                                } else if (buttonLabel === "다음 공정 이동") {
                                handleNextProcess();
                                } else if (buttonLabel === "공정 진행 중" && !isTimerRunning) {
                                handleCompleteProcess();
                                }
                            }}
                            disabled={isProcessing || (buttonLabel === "공정 진행 중" && isTimerRunning) || !isNextProcessEnabled && buttonLabel === "다음 공정으로 이동"}
                            >
                            {buttonLabel === "등록하기"
                                ? "등록하기"
                                : buttonLabel === "공정 진행 중"
                                ? `공정 진행 중 (${Math.floor(timeLeft / 60)}분 ${timeLeft % 60}초)`
                                : "다음 공정 이동"}
                            </button>
                        </div>
                        </div>
                    ) : (
                        <div className={styles.buttonContainer} style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                            className={styles.submitButton}
                            onClick={() => {
                            if (buttonLabel === "등록하기" && !confirmModalShown) {
                                setShowConfirmModal(true);
                            } else if (buttonLabel === "다음 공정 이동") {
                                handleNextProcess();
                            } else if (buttonLabel === "공정 완료") {
                                handleCompleteProcess();
                            }
                            }}
                            disabled={isProcessing || !isNextProcessEnabled && buttonLabel === "다음 공정으로 이동"}
                        >
                            {buttonLabel}
                        </button>
                        </div>
                    )}
                    </div>
            </div>

            {/* 모달 처리 */}
            <ConfirmModal
                isOpen={showConfirmModal && !confirmModalShown}
                message="공정을 시작하시겠습니까?"
                onConfirm={() => {
                    handleSave();
                    setShowConfirmModal(false);
                }}
                onClose={() => setShowConfirmModal(false)}
            />

            <SuccessfulModal
                isOpen={showSuccessModal}
                message="데이터가 성공적으로 저장되었습니다!"
                onClose={() => setShowSuccessModal(false)}
            />

            <CompleteModal
                isOpen={showCompleteModal}
                message="공정이 완료되었습니다."
                onClose={() => {
                    handleCloseCompleteModal()
                }}
            />

            <ErrorModal
                isOpen={showErrorModal}
                message="처리 중 오류가 발생했습니다."
                onClose={() => setShowErrorModal(false)}
            />
        </form>
    );
};

export default CarbonationProcessControls;

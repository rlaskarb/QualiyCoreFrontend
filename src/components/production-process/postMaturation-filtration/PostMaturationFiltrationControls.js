import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postMaturationFiltrationApi } from "../../../apis/production-process/postMaturation-filtration/PostMaturationApi";
import ConfirmModal from "../../standard-information/common/ConfirmModal";
import SuccessfulModal from "../../standard-information/common/SuccessfulModal";
import ErrorModal from "../../standard-information/common/ErrorModal";
import CompleteModal from "../../standard-information/common/CompleteModal";
import styles from "../../../styles/production-process/PostMaturationFiltration.module.css";

const PostMaturationFiltrationControls = () => {
    const [filtrationData, setFiltrationData] = useState({
        lotNo: "",
        filtrationTime: "120",
        turbidity: "",
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
    const [isCompleteModalConfirmed, setIsCompleteModalConfirmed] = useState(false); // 완료 모달 확인 여부 상태
    const navigate = useNavigate();

    useEffect(() => {
        const savedLotNo = localStorage.getItem("selectedLotNo");
        if (savedLotNo) {
            setFiltrationData((prev) => ({ ...prev, lotNo: savedLotNo }));
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
            setShowCompleteModal(true); // 타이머 종료 시 모달 표시
            setButtonLabel("다음 공정 이동");
        }
    }, [isTimerRunning, timeLeft]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFiltrationData(prev => ({ ...prev, [name]: value }));
    };

    const formatDateToISOStringWithoutMs = (date) => {
        return date.toISOString().split(".")[0];
    };

    const handleSave = async () => {
        try {
            setIsProcessing(true);

            if (!filtrationData.filtrationTime) {
                alert("여과 시간을 입력해주세요.");
                setIsProcessing(false);
                return;
            }

            const startTime = formatDateToISOStringWithoutMs(new Date());
            //테스트용으로 5초만 되게하고, 해제하면 입력한 시간대로 설정되도록 주석 처리
            const totalSeconds = 5;
            //const totalSeconds = filtrationData.filtrationTime * 60;
            const expectedEndTime = formatDateToISOStringWithoutMs(
                new Date(Date.now() + totalSeconds * 1000)
            );

            const response = await postMaturationFiltrationApi.createPostMaturationFiltration({
                ...filtrationData,
                filtrationTime: totalSeconds / 60,
                startTime,
                expectedEndTime
            });

            if (!response?.result?.savePostMaturationFiltration?.mfiltrationId) {
                throw new Error("서버 응답 오류");
            }

            setFiltrationData(prev => ({
                ...prev,
                mfiltrationId: response.result.savePostMaturationFiltration.mfiltrationId
            }));

            setShowSuccessModal(true);
            setButtonLabel("공정 진행 중");
            setTimeLeft(totalSeconds);
            setIsTimerRunning(true);
            setIsProcessStarted(true);
            setConfirmModalShown(true);
        } catch (error) {
            setShowErrorModal(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCompleteProcess = async () => {
        try {
            const actualEndTime = formatDateToISOStringWithoutMs(new Date());
            await postMaturationFiltrationApi.updatePostMaturationFiltration(
                filtrationData.mfiltrationId,
                {
                    actualEndTime,
                    turbidity: Number(filtrationData.turbidity),
                    notes: filtrationData.notes
                }
            );
        } catch (error) {
            setShowErrorModal(true);
        }
    };

    const handleNextProcess = () => {

        navigate("/carbonation-process");
    };

    const handleCompleteModalClose = () => {
        setShowCompleteModal(false);
        setIsCompleteModalConfirmed(true);
    }

    return (
        <form className={styles.filtrationForm} onSubmit={(e) => e.preventDefault()}>
            <h2 className={styles.filtrationTitle}>숙성 후 여과 공정</h2>

            <div className={styles.formGrid}>
                {/* 작업지시 ID */}
                <div className={styles.gridItem}>
                    <div className={styles.fGridItem}>
                        <label className={styles.fLabel01}>작업지시 ID</label>
                        <input
                            className={styles.fItem01}
                            type="text"
                            value={filtrationData.lotNo}
                            readOnly
                        />
                    </div>
                </div>

                {/* 여과 시간 입력 */}
                <div className={styles.gridItem}>
                    <label className={styles.label}>여과 시간 (분)</label>
                    <input
                        className={styles.inputField}
                        type="number"
                        step="0.1"
                        name="filtrationTime"
                        value={filtrationData.filtrationTime}
                        onChange={handleChange}
                        placeholder="0.0"
                        disabled={isProcessStarted}
                    />
                </div>

                {/* 탁도 측정 */}
                <div className={styles.gridItem}>
                    <label className={styles.label}>탁도 (NTU)</label>
                    <input
                        className={styles.inputField}
                        type="number"
                        name="turbidity"
                        value={filtrationData.turbidity}
                        onChange={handleChange}
                    />
                </div>

                {/* 메모 입력 */}
                <div className={styles.gridItem}>
                    <label className={styles.label}>메모 사항</label>
                    <input
                        className={styles.inputField}
                        type="text"
                        name="notes"
                        value={filtrationData.notes}
                        onChange={handleChange}
                    />
                </div>

 {/* 타이머 표시 및 버튼 */}
                        <div className={styles.gridItem} style={{ gridColumn: "1 / -1" }}>
                        {timeLeft > 0 ? (
                            <div className={styles.controlsContainer}>
                            <div className={styles.timerContainer}>
                                <div className={styles.timerLabel}>여과 공정 진행 중</div>
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
                                    width: `${(1 - timeLeft / (Number(filtrationData.filtrationTime) * 60)) * 100}%` 
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
                                    } else if (buttonLabel === "다음 공정 이동" && isCompleteModalConfirmed) {
                                    handleNextProcess();
                                    } else if (buttonLabel === "공정 진행 중" && !isTimerRunning) {
                                    handleCompleteProcess();
                                    }
                                }}
                                disabled={isProcessing || (buttonLabel === "공정 진행 중" && isTimerRunning) || !isCompleteModalConfirmed && buttonLabel === "다음 공정으로 이동"}
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
                                } else if (buttonLabel === "다음 공정 이동" && isCompleteModalConfirmed) {
                                    handleNextProcess();
                                }
                                }}
                                disabled={isProcessing || !isCompleteModalConfirmed && buttonLabel === "다음 공정 이동"}
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
                message="공정이 성공적으로 시작되었습니다!"
                onClose={() => setShowSuccessModal(false)}
            />

            <CompleteModal
                isOpen={showCompleteModal}
                message="공정이 완료되었습니다."
                onClose={() => {
                    handleCompleteModalClose();
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

export default PostMaturationFiltrationControls;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { packagingAndShipmentApi } from "../../../apis/production-process/packaging-and-shipment/packagingAndShipmentApi";
import ConfirmModal from "../../standard-information/common/ConfirmModal";
import SuccessfulModal from "../../standard-information/common/SuccessfulModal";
import ErrorModal from "../../standard-information/common/ErrorModal";
import CompleteModal from "../../standard-information/common/CompleteModal";
import styles from "../../../styles/production-process/PackagingAndShipment.module.css";

const PackagingAndShipmentControls = () => {
    const [shipmentData, setShipmentData] = useState({
        lotNo: "",
        cleaningAndSanitation: "양호",
        labelingAndCoding: "양호",
        fillingStatus: "정상",
        sealingStatus: "양호",
        packagingStatus: "양호",
        shipmentDate: new Date().toISOString().split("T")[0],
        productName: "아이유맥주",
        shipmentQuantity: 10000, // Double 타입
        destination: "",
        notes: "", // 메모 필드 추가
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [buttonLabel, setButtonLabel] = useState("등록하기");
    const [confirmModalShown, setConfirmModalShown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedLotNo = localStorage.getItem("selectedLotNo");
        if (savedLotNo) {
            setShipmentData((prev) => ({ ...prev, lotNo: savedLotNo }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShipmentData(prev => ({ ...prev, [name]: value }));
    };

    // 폼 초기화 함수
    const resetForm = () => {
        setShipmentData({
            lotNo: "", // lotNo 초기화
            cleaningAndSanitation: "양호",
            labelingAndCoding: "양호",
            fillingStatus: "정상",
            sealingStatus: "양호",
            packagingStatus: "양호",
            shipmentDate: new Date().toISOString().split("T")[0],
            productName: "아이유맥주",
            shipmentQuantity: 5000,
            destination: "",
            notes: "",
        });
    };

    const handleSave = async () => {
        try {
            setIsProcessing(true);

            // 1. 데이터 변환 및 유효성 검증
            const { productName, destination, shipmentQuantity, shipmentDate } = shipmentData;

            if (!productName || !destination || shipmentQuantity === null || shipmentQuantity === undefined) {
                console.error('⛔ 필수 필드 누락:', { productName, destination, shipmentQuantity });
                alert("제품명, 목적지, 출하 수량은 필수 입력 항목입니다.");
                setIsProcessing(false);
                return;
            }

            const parsedQuantity = Number(shipmentQuantity);
            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                console.error('⛔ 유효하지 않은 출하 수량:', shipmentQuantity);
                alert("출하 수량은 숫자로 입력해야 합니다.");
                setIsProcessing(false);
                return;
            }

            // 2. API 호출을 위한 데이터 준비
            const transformedData = {
                ...shipmentData,
                shipmentQuantity: parsedQuantity, // shipmentQuantity를 숫자로 변환
            };

            const response = await packagingAndShipmentApi.createPackagingAndShipment(transformedData);

            setShowSuccessModal(true);
            setButtonLabel("공정 완료");
           

        } catch (error) {
            console.error('💥 저장 실패 상세:', {
                errorMessage: error.message,
                errorStack: error.stack,
                originalData: shipmentData
            });
            setShowErrorModal(true);
        } finally {
            setIsProcessing(false);
            console.groupEnd();
        }
    };

    const handleCompleteProcess = async () => {
        setShowCompleteModal(true);
        setButtonLabel("작업지시 관리 이동");
    };

    const handleCloseCompleteModal = () => {
        setShowCompleteModal(false);
    };


    const handleNextProcess = async () => {
        try {      
          navigate('/work/orders');
        } catch (error) {
          setShowErrorModal(true);
        }
      };





      
    return (
        <form className={styles.packagingForm} onSubmit={(e) => e.preventDefault()}>
            <h2 className={styles.packagingTitle}>포장 및 출하 공정</h2>

            <div className={styles.formGrid}>
                {/* 작업지시 ID */}
                <div className={styles.gridItem}>
                    <label>작업지시 ID</label>
                    <input
                        type="text"
                        name="lotNo"
                        value={shipmentData.lotNo}
                        readOnly
                    />
                </div>
                {/* 세척 및 살균 */}
                <div className={styles.gridItem}>
                    <label>세척 및 살균</label>
                    <select
                        name="cleaningAndSanitation"
                        value={shipmentData.cleaningAndSanitation}
                        onChange={handleChange}
                    >
                        <option value="양호">양호</option>
                        <option value="불량">불량</option>
                    </select>
                </div>

                {/* 충전 */}
                <div className={styles.gridItem}>
                    <label>충전</label>
                    <select
                        name="fillingStatus"
                        value={shipmentData.fillingStatus}
                        onChange={handleChange}
                    >
                        <option value="정상">정상</option>
                        <option value="과충전">과충전</option>
                    </select>
                    <p className={styles.subLabel}>산소 농도 0.05% 이하</p>
                </div>

                {/* 밀봉 */}
                <div className={styles.gridItem}>
                    <label>밀봉</label>
                    <select
                        name="sealingStatus"
                        value={shipmentData.sealingStatus}
                        onChange={handleChange}
                    >
                        <option value="양호">양호</option>
                        <option value="불량">불량</option>
                    </select>
                    <p className={styles.subLabel}>밀봉 압력 1.0~1.5 bar</p>
                </div>

                {/* 라벨링 및 코딩 */}
                <div className={styles.gridItem}>
                    <label>라벨링 및 코딩</label>
                    <select
                        name="labelingAndCoding"
                        value={shipmentData.labelingAndCoding}
                        onChange={handleChange}
                    >
                        <option value="양호">양호</option>
                        <option value="불량">불량</option>
                    </select>
                    <p className={styles.subLabel}>라벨 부착 여부, 날짜, 배치번호 확인</p>
                </div>

                {/* 포장 */}
                <div className={styles.gridItem}>
                    <label>포장</label>
                    <select
                        name="packagingStatus"
                        value={shipmentData.packagingStatus}
                        onChange={handleChange}
                    >
                        <option value="양호">양호</option>
                        <option value="불량">불량</option>
                    </select>
                    <p className={styles.subLabel}>부족 갯수 확인, 팔레트단위 포장</p>
                </div>

                {/* 출하 날짜 */}
                <div className={styles.gridItem}>
                    <label>출하 날짜</label>
                    <input
                        type="date"
                        name="shipmentDate"
                        value={shipmentData.shipmentDate}
                        onChange={handleChange}
                    />
                </div>
           
           

                {/* 제품명 */}
                <div className={styles.gridItem}>
                    <label>제품명</label>
                    <select
                        name="productName"
                        value={shipmentData.productName}
                        onChange={handleChange}
                    >
                    <option value="">제품명 선택</option>
                    <option value="아이유맥주">아이유맥주</option>
                    <option value="카리나맥주">카리나맥주</option>
                    <option value="장원영맥주">장원영맥주</option>
                    </select>
                </div>


                {/* 목적지 */}
                <div className={styles.gridItem}>
                    <label>목적지</label>
                    <input
                        type="text"
                        name="destination"
                        value={shipmentData.destination}
                        onChange={handleChange}
                        placeholder="목적지"
                    />
                </div>

                {/* 출하 수량 */}
                <div className={styles.gridItem}>
                    <label>출하 수량</label>
                    <input
                        type="number"
                        name="shipmentQuantity"
                        value={shipmentData.shipmentQuantity}
                        onChange={handleChange}
                        placeholder="수량"
                    />
                </div> 
                {/* 메모 */}
                <div className={styles.gridItem}>
                    <label>메모</label>
                    <textarea
                        name="notes"
                        value={shipmentData.notes}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* 등록 버튼 */}
                <div className={styles.gridItem}>
                    <button
                        className={styles.submitButton}
                        onClick={() => {
                            if (buttonLabel === "등록하기" && !confirmModalShown) {
                                setShowConfirmModal(true);
                            } else if (buttonLabel === "공정 완료") {
                                handleCompleteProcess();
                            } else if (buttonLabel === "작업지시 관리 이동") {
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
                isOpen={showConfirmModal && !confirmModalShown}
                message="등록하시겠습니까?"
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

            <ErrorModal
                isOpen={showErrorModal}
                message="처리 중 오류가 발생했습니다."
                onClose={() => setShowErrorModal(false)}
            />

            <CompleteModal
                isOpen={showCompleteModal}
                message="출하 준비가 완료되었습니다."
                onClose={() => handleCloseCompleteModal()}
            />
        </form>
    );
};

export default PackagingAndShipmentControls;

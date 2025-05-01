import React, { useState, useEffect, useRef } from "react";
import workCreate from "../../styles/work/workCreate.module.css";
import { getBeerRecipes, getPlanInfo, createWorkOrder } from "../../apis/workOrderApi/workOrdersApi";
import SuccessAnimation from "../../lottie/SuccessNotification";
import WarningAnimation from "../../lottie/WarningNotification";
import Modal from "react-modal";
import JSConfetti from "js-confetti";
import { FaCheck, FaClipboardList } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const jsConfetti = new JSConfetti();

function WorkCreate() {
    const [beerRecipes, setBeerRecipes] = useState({});
    const [workOrders, setWorkOrders] = useState([]);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [isSuccessModal, setIsSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isWarningModal, setIsWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [etcText, setEtcText] = useState("");
    const etcRef = useRef();
    const { currentUser } = useAuth();
    

    // 생산계획 가져오기
    const fetchWorkOrders = async () => {
        try {
            const workOrdersData = await getPlanInfo();
            if (Array.isArray(workOrdersData) && workOrdersData.length) {
                setWorkOrders(workOrdersData);
            }
        } catch (error) {
            console.error("생산계획 데이터 로드 에러:", error);
        }
    };

    // 맥주레시피 가져오기
    const fetchBeerRecipes = async () => {
        try {
            const recipesResponse = await getBeerRecipes();
            if (recipesResponse && typeof recipesResponse === 'object' && Object.keys(recipesResponse).length > 0) {
                setBeerRecipes(recipesResponse);
            }
        } catch (error) {
            console.error("레시피 데이터 로드 에러:", error);
        }
    };

    // 작업 지시서 생성
    const handleCreateWorkOrder = async () => {
        if (!selectedWorkOrder) {
            setWarningMessage("생산 계획을 선택하세요.");
            setIsWarningModal(true);
            return;
        }

        const { planId, planLineId, planProductId } = selectedWorkOrder;
        if (!planId || !planLineId || !planProductId) {
            setWarningMessage("작업에 필요한 정보가 부족합니다.");
            setIsWarningModal(true);
            return;
        }

        const workOrderData = {
            workProgress: "0%",
            workEtc: etcRef.current.value,
            empId: currentUser ? currentUser.id : null,
            planId,
            planLineId,
            planProductId,
            trackingId: selectedWorkOrder.trackingId,
            lineMaterials: mergedRecipe.map((material) => ({
                materialName: material.materialName,
                materialType: material.materialType,
                unit: material.unit,
                requiredQtyPerUnit: material.quantity,
                processStep: material.processStep,
                totalQty: Math.round(material.quantity * selectedWorkOrder.planQty),
            }))
        };

        try {
            const response = await createWorkOrder(workOrderData);
            if (response && response.status === 201) {
                setIsSuccessModal(true);
                setModalMessage("작업 지시서가 성공적으로 생성되었습니다.");

                jsConfetti.addConfetti({
                    emojis: ["🍺", "🍻", "🥂"],
                    emojiSize: 100,
                    confettiNumber: 70,
                });

                setWorkOrders((prevOrders) => prevOrders.filter(order =>
                    !(order.planId === planId &&
                        order.planLineId === planLineId &&
                        order.planProductId === planProductId)
                ));
                setSelectedWorkOrder(null);
                setEtcText("");
                etcRef.current.value = "";
                await fetchWorkOrders();
            } else {
                setWarningMessage("작업 지시서 생성에 실패했습니다.");
                setIsWarningModal(true);
            }
        } catch (error) {
            setWarningMessage("작업 지시서 생성 중 오류가 발생했습니다.");
            setIsWarningModal(true);
        }
    };

    // 생산계획 선택 핸들러
    const handleWorkOrderSelect = (e) => {
        const [selectedPlanId, selectedPlanLineId, selectedPlanProductId] = e.target.value.split("|");
        const selectedOrder = workOrders.find(order =>
            order.planId === selectedPlanId &&
            order.planLineId === selectedPlanLineId &&
            order.planProductId === selectedPlanProductId
        );
        setSelectedWorkOrder(selectedOrder || null);
    };

    useEffect(() => {
        fetchWorkOrders();
        fetchBeerRecipes();
    }, []);

    // 자동으로 생산계획과 일치하는 레시피 매칭
    const matchRecipeWithWorkOrder = (workOrder, beerRecipes) => {
        return beerRecipes[workOrder.productName] || null;
    };

    const matchedRecipe = selectedWorkOrder ? matchRecipeWithWorkOrder(selectedWorkOrder, beerRecipes) : null;

    const processOrder = ["분쇄", "끓임", "발효", "포장 및 패키징출하"];

    // 맥주레시피와 생산계획 이름 매칭
    const mergeRecipeData = (processSteps) => {
        if (!processSteps || typeof processSteps !== 'object') return [];

        let merged = [];
        Object.keys(processSteps).forEach((processStep) => {
            const steps = processSteps[processStep];
            if (Array.isArray(steps)) {
                merged.push(...steps);
            }
        });

        merged.sort((a, b) => processOrder.indexOf(a.processStep) - processOrder.indexOf(b.processStep));

        return merged;
    };

    const mergedRecipe = matchedRecipe ? mergeRecipeData(matchedRecipe) : [];

    const closeSuccessModal = () => setIsSuccessModal(false);
    const closeWarningModal = () => setIsWarningModal(false);

    // 날짜변환
    function convertUTCToKST(dateString) {
        return new Date(dateString).toLocaleDateString("ko-KR");
    }

    return (
        <div className={workCreate.mainBar}>
            <div className={workCreate.planInfoName}>
                <h3 className={workCreate.planH3}>생산계획</h3>
                <select
                    onChange={handleWorkOrderSelect}
                    className={workCreate.planSelect}
                    value={selectedWorkOrder ? `${selectedWorkOrder.planId}|${selectedWorkOrder.planLineId}|${selectedWorkOrder.planProductId}` : ""}
                >
                    <option value="">생산 계획 선택</option>
                    {workOrders.map((order) => (
                        <option
                            key={`${order.planId}-${order.planLineId}-${order.planProductId}`}
                            value={`${order.planId}|${order.planLineId}|${order.planProductId}`}
                        >
                            ({order.productName}) 시작일 : {convertUTCToKST(order.startDate)}
                        </option>
                    ))}
                </select>
            </div>

            <table className={workCreate.workTable}>
                <tbody>
                    <tr>
                        <th>생산라인</th>
                        <td>{selectedWorkOrder ? `${selectedWorkOrder.lineNo} LINE` : "-"}</td>
                        <th>제품명</th>
                        <td>{selectedWorkOrder ? selectedWorkOrder.productName : "-"}</td>
                    </tr>
                    <tr>
                        <th>생산예정일</th>
                        <td>
                            {selectedWorkOrder
                                ? convertUTCToKST(selectedWorkOrder.startDate)
                                : "-"}
                        </td>
                        <th>생산종료일</th>
                        <td>
                            {selectedWorkOrder
                                ? convertUTCToKST(selectedWorkOrder.endDate)
                                : "-"}
                        </td>
                    </tr>
                    <tr>
                        <th>지시수량</th>
                        <td>{selectedWorkOrder ? selectedWorkOrder.planQty : "-"}</td>
                        <th>작성자</th>
                        <td>{selectedWorkOrder && currentUser ? currentUser.name : "-"}</td>
                    </tr>
                </tbody>
            </table>

            {mergedRecipe.length > 0 && (
                <table className={workCreate.bomTable}>
                    <thead>
                        <tr>
                            <th>공정 단계</th>
                            <th>자재 종류</th>
                            <th>자재명</th>
                            <th>맥주 1개당 투입 수량</th>
                            <th>생산총 투입 수량</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mergedRecipe.map((material, index) => (
                            <tr key={`${material.materialName}-${index}`}>
                                <td>{material.processStep}</td>
                                <td>{material.materialType}</td>
                                <td>{material.materialName}</td>
                                <td>{material.quantity}{material.unit}</td>
                                <td>{selectedWorkOrder ? Math.round(material.quantity * selectedWorkOrder.planQty) : 0}{material.unit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <h3 className={workCreate.footName}>특이사항</h3>
            <textarea
                ref={etcRef}
                className={workCreate.etc}
                value={etcText}
                onChange={(e) => setEtcText(e.target.value)}
                placeholder="작업 진행 시 특이사항이나 추가 지시 사항을 입력하세요."
            ></textarea>

            <button className={workCreate.createButton} onClick={handleCreateWorkOrder}>
                <FaClipboardList /> 작업지시서 등록
            </button>

            {/* 성공모달 */}
            <Modal
                isOpen={isSuccessModal}
                onRequestClose={closeSuccessModal}
                className={workCreate.successModal}
                overlayClassName="modal-overlay1"
            >
                <div className={workCreate.successModalHeader}>
                    <button className={workCreate.successCloseButton} onClick={closeSuccessModal}>×</button>
                </div>
                <div className={workCreate.successModalContent}>
                    <SuccessAnimation />
                    <p className={workCreate.successMessage}>{modalMessage}</p>
                </div>
            </Modal>

            {/* 경고모달 */}
            <Modal
                isOpen={isWarningModal}
                onRequestClose={closeWarningModal}
                className={workCreate.warningModal}
                overlayClassName={workCreate.warningModalOverlay}
            >
                <div className={workCreate.warningModalHeader}>
                    <button className={workCreate.warningCloseButton} onClick={closeWarningModal}>×</button>
                </div>
                <div className={workCreate.warningModalContent}>
                    <WarningAnimation />
                    <p className={workCreate.warningMessage}>{warningMessage}</p>
                </div>
            </Modal>
        </div>
    );
}

export default WorkCreate;
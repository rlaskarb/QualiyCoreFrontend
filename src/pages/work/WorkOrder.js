// 아이콘 임포트 수정
import React, { useState, useEffect } from "react";
import { findAllWorkOrders, fetchWorkOrderByLotNo, workOrderDelete } from "../../apis/workOrderApi/workOrdersApi";
import workOrder from "../../styles/work/workOrders.module.css";
import Pagination from "../../Pagination/Pagination";
import Modal from "react-modal";
import SuccessAnimation from "../../lottie/SuccessNotification";
import generatePDF from "../../common/PDF/generatePDF";
import { FaSearch, FaFileExport, FaTrashAlt, FaSync } from "react-icons/fa";
import WarningAnimation from "../../lottie/WarningNotification";


Modal.setAppElement('#root');

function WorkOrder() {
    // 작업지시서 상태관리
    const [workOrders, setWorkOrders] = useState([]);
    const [pageInfo, setPageInfo] = useState({
        page: 0, totalPages: 1, first: true, last: true
    });
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [noResults, setNoResults] = useState(false);

    // 모달 상태관리
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isWarningModal, setIsWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    // 검색조건 상태관리
    const [workTeam, setWorkTeam] = useState('');
    const [productName, setProductName] = useState('');
    const [lineNo, setLineNo] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [lotNo, setLotNo] = useState('');

    // 진행률
    const getWorkProgress = (statusCode) => {
        const statusProgressMap = {
            SC001: 10, SC002: 20, SC003: 30, SC004: 40, SC005: 50,
            SC006: 60, SC007: 70, SC008: 80, SC009: 90, SC010: 100
        };
        return statusProgressMap[statusCode] || 0;
    };

    // 진행률 색상
    const getProgressBarColor = (progress) => {
        return "#5E4BFF";
    };

    const fetchData = async (page = 0, filterParams = {}) => {
        try {
            const { workTeam, productName, lotNo, lineNo, startDate, endDate } = filterParams;
            let lineNoParam = lineNo ? parseInt(lineNo, 10) : undefined;

            const data = await findAllWorkOrders(page, 13, workTeam, productName, lotNo, lineNoParam, startDate, endDate);

            if (data && data.work && Array.isArray(data.work.content)) {
                const updatedWorkOrders = data.work.content.map((work) => ({
                    ...work,
                    workProgress: getWorkProgress(work.processStatus)
                }));

                if (updatedWorkOrders.length === 0) {
                    setNoResults(true);
                } else {
                    setNoResults(false);
                }

                setWorkOrders(updatedWorkOrders);
                setPageInfo({
                    page: data.work.number,
                    totalPages: data.work.totalPages,
                    first: data.work.first,
                    last: data.work.last
                });
            } else {
                setWorkOrders([]);
                setNoResults(true);
            }
        } catch (error) {
            setWorkOrders([]);
            setNoResults(true);
        }
    };

    // 페이지 핸들러
    const handlePageChange = (newPage) => {
        fetchData(newPage, { workTeam, productName, lineNo, startDate, endDate, lotNo });
    };

    // 검색 기능
    const handleSearch = () => {
        fetchData(0, { workTeam, productName, lineNo, startDate, endDate, lotNo });
    };

    // 리셋 기능
    const handleReset = () => {
        setWorkTeam('');
        setProductName('');
        setLineNo('');
        setStartDate('');
        setEndDate('');
        setLotNo('');
        fetchData(0);
    };

    // 모달
    const openModal = async (lotNo) => {
        try {
            const workOrderData = await fetchWorkOrderByLotNo(lotNo);
            setSelectedWorkOrder(workOrderData);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching work order details:", error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedWorkOrder(null);
    };

    useEffect(() => {
        fetchData(0);
    }, []);

    // 삭제 핸들러
    const handleDelete = async (lotNo) => {
        const invalidStatus = ['SC002', 'SC003', 'SC004', 'SC005', 'SC006', 'SC007', 'SC008', 'SC009'];

        if (!selectedWorkOrder) {
            setWarningMessage("선택된 작업지시서가 없습니다.");
            setIsWarningModal(true);
            return;
        }

        if (invalidStatus.includes(selectedWorkOrder.statusCode)) {
            setWarningMessage("진행 중인 작업은 삭제할 수 없습니다.");
            setIsWarningModal(true);
            return;
        }

        try {
            await workOrderDelete(lotNo);
            setIsSuccessModalOpen(true);
            setModalMessage("작업지시서가 성공적으로 삭제되었습니다.");
            closeModal();
            fetchData(pageInfo.page);
        } catch (error) {
            setWarningMessage("작업지시서 삭제에 실패했습니다.");
            setIsWarningModal(true);
        }
    };

    const closeSuccessModal = () => setIsSuccessModalOpen(false);
    const closeWarningModal = () => setIsWarningModal(false);

    // Enter 키로 검색 실행
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={workOrder.container}>
            <div className={workOrder.searchBar}>
                <select
                    className={workOrder.selectSearch}
                    value={workTeam}
                    onChange={(e) => setWorkTeam(e.target.value)}
                >
                    <option value="" disabled>작업조</option>
                    <option value="A조">A조</option>
                    <option value="B조">B조</option>
                    <option value="C조">C조</option>
                </select>
                <select
                    className={workOrder.selectSearch}
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                >
                    <option value="" disabled>맥주명</option>
                    <option value="아이유 맥주">아이유 맥주</option>
                    <option value="카리나 맥주">카리나 맥주</option>
                    <option value="장원영 맥주">장원영 맥주</option>
                </select>
                <select
                    className={workOrder.selectSearch}
                    value={lineNo}
                    onChange={(e) => setLineNo(e.target.value)}
                >
                    <option value="" disabled>생산라인</option>
                    <option value="1">1LINE</option>
                    <option value="2">2LINE</option>
                    <option value="3">3LINE</option>
                </select>
                <input
                    type="date"
                    className={workOrder.searchInput}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="생산시작일을 선택하세요.."
                />
                <input
                    type="date"
                    className={workOrder.searchInput}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="생산종료일을 선택하세요.."
                />
                <input
                    type="text"
                    className={workOrder.searchInput}
                    value={lotNo}
                    onChange={(e) => setLotNo(e.target.value)}
                    placeholder="작업지시번호를 입력하세요.."
                    onKeyPress={handleKeyPress}
                />
                <button className={workOrder.searchButton} onClick={handleSearch}>
                    <FaSearch /> 검색
                </button>
                <button className={workOrder.searchRefresh} onClick={handleReset}>
                    <FaSync />
                </button>
            </div>

            <div className={workOrder.mainbar}>
                {noResults ? (
                    <p className={workOrder.noResults}>작업지시서가 없습니다.</p>
                ) : (
                    <table className={workOrder.workOrderTable}>
                        <thead>
                            <tr>
                                <th>작업지시번호</th>
                                <th>작업조</th>
                                <th>제품명</th>
                                <th>생산시작일</th>
                                <th>생산종료일</th>
                                <th>수량</th>
                                <th>생산라인</th>
                                <th>작업지시상태</th>
                                <th>진행률</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workOrders.map((work) => (
                                <tr key={work.lotNo} onClick={() => openModal(work.lotNo)}>
                                    <td>{work.lotNo}</td>
                                    <td>{work.workTeam}</td>
                                    <td>{work.productName}</td>
                                    <td>{work.startDate}</td>
                                    <td>{work.endDate}</td>
                                    <td>{work.planQty} ea</td>
                                    <td>{work.lineNo} LINE</td>
                                    <td>{work.processStatus}</td>
                                    <td>
                                        <div className={workOrder.progressBar}>
                                            <div
                                                className={workOrder.progressBarFill}
                                                style={{ width: `${getWorkProgress(work.statusCode)}%` }}
                                            ></div>
                                            <div className={workOrder.progressBarLabel}>
                                                {getWorkProgress(work.statusCode)}%
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className={workOrder.paginationWrapper}>
                    <Pagination
                        page={pageInfo.page}
                        totalPages={pageInfo.totalPages}
                        first={pageInfo.first}
                        last={pageInfo.last}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            {/* 작업지시서 상세조회 모달 */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                className={workOrder.modal}
                overlayClassName={workOrder.modalOverlay}
            >
                <div className={workOrder.modalHeader}>
                    <button onClick={closeModal} className={workOrder.closeButton}>×</button>
                </div>
                {selectedWorkOrder && (
                    <div>
                        <div className={workOrder.headerContainer}>
                            <h1 className={workOrder.title}>작업지시서</h1>
                            <button
                                className={workOrder.pdfButton}
                                onClick={() => {
                                    if (selectedWorkOrder) {
                                        generatePDF(selectedWorkOrder, selectedWorkOrder.lineMaterials);
                                    }
                                }}
                            >
                                <FaFileExport /> PDF 추출
                            </button>
                        </div>

                        <div className={workOrder.tableWrapper}>
                            <table className={workOrder.detailTable}>
                                <tbody>
                                    <tr>
                                        <td className={workOrder.oneTd}>작업지시번호</td>
                                        <td>{selectedWorkOrder.lotNo}</td>
                                    </tr>
                                    <tr>
                                        <td className={workOrder.twoTd}>작업조</td>
                                        <td>{selectedWorkOrder.workTeam}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <table className={workOrder.dateTable}>
                                <tbody>
                                    <tr>
                                        <td className={workOrder.threeTd}>생산시작일</td>
                                        <td>{selectedWorkOrder.startDate}</td>
                                    </tr>
                                    <tr>
                                        <td className={workOrder.fourTd}>생산종료일</td>
                                        <td>{selectedWorkOrder.endDate}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2>생산정보</h2>
                        <table className={workOrder.productTable}>
                            <thead>
                                <tr>
                                    <th>제품명</th>
                                    <th>수량</th>
                                    <th>생산라인</th>
                                    <th>작업지시상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{selectedWorkOrder.productName}</td>
                                    <td>{selectedWorkOrder.planQty} ea</td>
                                    <td>{selectedWorkOrder.lineNo} LINE</td>
                                    <td>{selectedWorkOrder.processStatus}</td>
                                </tr>
                            </tbody>
                        </table>

                        <h2>자재정보</h2>
                        {selectedWorkOrder.lineMaterials && selectedWorkOrder.lineMaterials.length > 0 ? (
                            <table className={workOrder.materialTable}>
                                <thead>
                                    <tr>
                                        <th>공정</th>
                                        <th>자재명</th>
                                        <th>맥주 1개 소요량</th>
                                        <th>총 소요량</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedWorkOrder.lineMaterials.map((material, index) => (
                                        <tr key={index}>
                                            <td>{material.processStep}</td>
                                            <td>{material.materialName}</td>
                                            <td>{material.requiredQtyPerUnit} {material.unit}</td>
                                            <td>{material.totalQty} {material.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>자재 정보가 없습니다.</p>
                        )}

                        <h2>특이사항</h2>
                        <textarea
                            value={selectedWorkOrder.workEtc || ''}
                            className={workOrder.etc}
                            readOnly
                        ></textarea>

                        <button
                            className={workOrder.deleteButton}
                            onClick={() => handleDelete(selectedWorkOrder.lotNo)}
                        >
                            <FaTrashAlt /> 삭제
                        </button>
                    </div>
                )}
            </Modal>

            {/* 성공 모달 */}
            <Modal
                isOpen={isSuccessModalOpen}
                onRequestClose={closeSuccessModal}
                className={workOrder.successModal}
                overlayClassName={workOrder.modalOverlay}
            >
                <div className={workOrder.successModalHeader}>
                    <button className={workOrder.successCloseButton} onClick={closeSuccessModal}>×</button>
                </div>
                <div className={workOrder.successModalContent}>
                    <SuccessAnimation />
                    <p className={workOrder.successMessage}>{modalMessage}</p>
                </div>
            </Modal>

            {/* 경고 모달 */}
            <Modal
                isOpen={isWarningModal}
                onRequestClose={closeWarningModal}
                className={workOrder.warningModal}
                overlayClassName={workOrder.modalOverlay}
            >
                <div className={workOrder.warningModalHeader}>
                    <button className={workOrder.warningCloseButton} onClick={closeWarningModal}>×</button>
                </div>
                <div className={workOrder.warningModalContent}>
                    <WarningAnimation />
                    <p className={workOrder.warningMessage}>{warningMessage}</p>
                </div>
            </Modal>
        </div>
    );
}

export default WorkOrder;
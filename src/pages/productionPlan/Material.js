import React, { useState, useEffect } from "react";
import {
  getStockStatus,
  getMaterialRequests,
  updateMaterialRequestStatus,
} from "../../apis/productionPlanApi/MaterialApi";
import styles from "../../styles/productionPlan/MaterialManagementPage.module.css";

const MaterialManagementPage = () => {
  const [stockStatus, setStockStatus] = useState([]); // 재고 현황
  const [materialRequests, setMaterialRequests] = useState([]); // 자재 신청 내역
  const [completedRequests, setCompletedRequests] = useState([]); // ✅ 완료된 목록 따로 저장
  const [selectedRequestId, setSelectedRequestId] = useState(null); // 모달에 사용할 선택된 ID
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태

  useEffect(() => {
    fetchStockStatus();
    fetchMaterialRequests();
  }, []);

  const fetchStockStatus = async () => {
    try {
      const response = await getStockStatus();
      setStockStatus(response.result.stockStatus);
    } catch (error) {
      console.error("자재 재고 현황 조회 실패:", error);
    }
  };

  const fetchMaterialRequests = async () => {
    try {
      const response = await getMaterialRequests();
      if (response && response.result && Array.isArray(response.result.requests)) {
        // ✅ 완료된 항목 분리
        const completed = response.result.requests.filter((req) => req.status === "발주완료");
        const pending = response.result.requests.filter((req) => req.status !== "발주완료");

        setCompletedRequests(completed); // 완료된 목록 저장
        setMaterialRequests(pending); // 미완료 목록 저장
      } else {
        console.error("❌ 응답 데이터가 예상한 형식이 아닙니다:", response);
        setMaterialRequests([]);
        setCompletedRequests([]);
      }
    } catch (error) {
      console.error("❌ 자재 구매 신청 내역 조회 실패:", error);
      setMaterialRequests([]);
      setCompletedRequests([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
  };

  // 발주 버튼 클릭 시 모달 열기
  const confirmOrder = (requestId) => {
    setSelectedRequestId(requestId);
    setIsModalOpen(true);
  };

  // 발주 확정 처리
  const handleOrder = async () => {
    if (!selectedRequestId) return;
    try {
      await updateMaterialRequestStatus(selectedRequestId, "발주완료");
      fetchMaterialRequests(); // 변경 후 목록 새로고침
    } catch (error) {
      console.error("자재 구매 신청 발주 실패:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>자재 구매 신청 내역</h2>

      <div className={styles.dashboard}>
        <div className={styles.card}>
          <h3>총 신청 건수</h3>
          <p>{materialRequests.length + completedRequests.length}</p>
        </div>

        <div className={styles.card}>
          <h3>발주 완료 건수</h3>
          <p>{completedRequests.length}</p>
        </div>

        <div className={styles.card}>
          <h3>미발주 건수</h3>
          <p>{materialRequests.length}</p>
        </div>
      </div>

      {/* ✅ 최근 신청 내역 (완료된 항목 제외) */}
      <h3 className={styles.subtitle}>최근 신청 내역</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>신청일</th>
            <th>자재명</th>
            <th>수량</th>
            <th>납기 요청일</th>
            <th>상태</th>
            <th>발주</th>
          </tr>
        </thead>
        <tbody>
          {materialRequests.slice(0, 5).map((request) => (
            <tr key={request.requestId}>
              <td>{formatDate(request.requestDate)}</td>
              <td>{request.materialName}</td>
              <td>{request.requestQty}</td>
              <td>{formatDate(request.deliveryDate)}</td>
              <td>{request.status}</td>
              <td>
                <button className={styles.orderButton} onClick={() => confirmOrder(request.requestId)}>
                  발주하기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ 완료된 신청 내역 (따로 표시) */}
      <h3 className={styles.subtitle}>완료된 신청 내역</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>신청일</th>
            <th>자재명</th>
            <th>수량</th>
            <th>납기 요청일</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {completedRequests.map((request) => (
            <tr key={request.requestId}>
              <td>{formatDate(request.requestDate)}</td>
              <td>{request.materialName}</td>
              <td>{request.requestQty}</td>
              <td>{formatDate(request.deliveryDate)}</td>
              <td>{request.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ 자재별 재고 현황 */}
      <h3 className={styles.subtitle}>자재별 재고 현황</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>자재명</th>
            <th>현재 재고</th>
            <th>단위</th>
          </tr>
        </thead>
        <tbody>
          {stockStatus.map((stock) => (
            <tr key={stock.materialId}>
              <td>{stock.materialName}</td>
              <td>{stock.currentStock}</td>
              <td>{stock.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ 모달 UI */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>발주 확인</h3>
            <p>해당 자재를 발주하시겠습니까?</p>
            <div className={styles.modalButtons}>
              <button className={styles.confirmButton} onClick={handleOrder}>
                확인
              </button>
              <button className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialManagementPage;

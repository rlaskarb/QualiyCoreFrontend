import React, { useState, useEffect } from "react";
import "../../styles/productionPlan/ProductionPlan.css";
import { fetchProductionPlans, updatePlanStatus } from "../../apis/productionPlanApi/ProductionPlanApi";
import { useNavigate } from "react-router-dom"; 

const ProductionPlan = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [searchParams, setSearchParams] = useState({
    planYm: "",
    productName: "",
    status: "",
  });
  // 모달 관련 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // ⭐ 페이지 로딩 시 자동 전체 조회⭐
  useEffect(() => {
    handleSearch();
  }, []);

  // ⭐검색 실행 시 API 호출!⭐
  const handleSearch = async () => {
    const data = await fetchProductionPlans(
      searchParams.planYm,
      searchParams.status
    );
    setPlans(data);
  };

  // ⭐ Enter 키를 누르면 검색 실행! ⭐
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ⭐ 상세 페이지로 이동하는 함수 ⭐
  const handleRowClick = (planId) => {
    navigate(`/detail/${planId}`); 
  };

  // 모달 열기 함수
  const handleProductionInstruction = (planId, e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setSelectedPlanId(planId);
    setIsModalOpen(true);
  };

  // 모달 확인 함수
  const confirmProductionInstruction = async () => {
    try {
      await updatePlanStatus(selectedPlanId, '확정');
      // 성공 후 목록 새로고침
      handleSearch();
      // 모달 닫기
      setIsModalOpen(false);
    } catch (error) {
      alert('상태 변경 중 오류가 발생했습니다.');
      setIsModalOpen(false);
    }
  };

  // 모달 취소 함수
  const cancelProductionInstruction = () => {
    setIsModalOpen(false);
    setSelectedPlanId(null);
  };

  return (
    <div className="productionPlan-container">
      <h1 className="page-title">생산계획관리</h1>

      {/* 검색입력필드 */}
      <div className="search-bar">
        <div className="search-filter">
          <label>계획년월</label>
          <input 
            type="text"
            placeholder="YYYY-MM"
            value={searchParams.planYm}
            onChange={(e) => setSearchParams({...searchParams, planYm: e.target.value})}
            onKeyDown={handleKeyDown} // 엔터 키 이벤트 추가
          />
        </div>
        
        <div className="search-filter">
          <label>상태</label>
          <input 
            type="text"
            placeholder="미확정/확정"
            value={searchParams.status}
            onChange={(e) => setSearchParams({...searchParams, status: e.target.value})}
            onKeyDown={handleKeyDown} // 엔터 키 이벤트 추가
          />
        </div>
        <button onClick={handleSearch}>조회</button>
      </div>

      {/* 테이블 */}
      <div className="plan-table">
        <table>
          <thead>
            <tr>
              <th>계획년월</th>
              <th>계획ID</th> {/* 계획ID 컬럼 추가 */}
              <th>제품명</th>
              <th>규격</th>
              <th>계획수량</th>
              <th>상태</th>
              <th>생산지시</th>
            </tr>
          </thead>
          <tbody>
            {plans.length > 0 ? (
              plans.map((plan, index) => {
                // planYm을 YYYY-MM-DD 형식으로 변환
                const formattedDate = Array.isArray(plan.planYm)
                  ? `${plan.planYm[0]}-${String(plan.planYm[1]).padStart(2, "0")}-${String(plan.planYm[2]).padStart(2, "0")}`
                  : plan.planYm;

                return (
                  <tr 
                    key={index} 
                    onClick={() => handleRowClick(plan.planId)} 
                    className="clickable-row" // 클릭 가능한 행임을 표시하는 클래스 추가
                  >
                    <td>{formattedDate}</td>
                    <td>{plan.planId}</td> {/* 계획ID 표시 */}
                    <td>{plan.mainProductName}</td>
                    <td>{plan.sizeSpec || '-'}</td>
                    <td>{plan.totalPlanQty?.toLocaleString() || 0}</td>
                    <td>
                      <span className={`status ${plan.status}`}>
                        {plan.status === "미확정" ? "🟡 미확정" : 
                        plan.status === "확정" ? "✅ 확정" : 
                        plan.status === "취소" ? "❌ 취소" : plan.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()} 
                      style={{ 
                        color: (plan.status === "확정" || plan.status === "생산지시") ? "#999" : "", 
                      }}
                    > 
                      <button 
                        className="action-btn"
                        onClick={(e) => handleProductionInstruction(plan.planId, e)}
                        disabled={plan.status === "확정" || plan.status === "생산지시"} 
                        style={{
                          backgroundColor: (plan.status === "확정" || plan.status === "생산지시") ? "#cccccc" : "", 
                          cursor: (plan.status === "확정" || plan.status === "생산지시") ? "not-allowed" : "pointer"
                        }}
                      >
                        {(plan.status === "확정" || plan.status === "생산지시") ? "완료" : "생산지시"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>조회된 데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 생산지시 확인 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>생산지시 확인</h3>
              <button className="modal-close-btn" onClick={cancelProductionInstruction}>×</button>
            </div>
            <div className="modal-content">
              <p>생산 지시를 진행하시겠습니까?</p>
              <div className="modal-icon">🏭</div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={cancelProductionInstruction}>취소</button>
              <button className="modal-confirm-btn" onClick={confirmProductionInstruction}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPlan;
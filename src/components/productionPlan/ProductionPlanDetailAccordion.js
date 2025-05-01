import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import "../../styles/productionPlan/ProductionPlanDetailAccordion.css";

const ProductionPlanDetailAccordion = ({ planDetail }) => {
  const [openSections, setOpenSections] = useState({
    step1: false,
    step2: false,
    step3: false,
    materialRequest: false
  });
  
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // 날짜 포맷팅 헬퍼 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // planDetail이 유효한지 확인
  if (!planDetail || !planDetail.planMst) {
    return (
      <div className="error-container">
        <p className="error-message">상세 정보를 표시할 수 없습니다.</p>
      </div>
    );
  }
  
  return (
    <div className="detail-container">
      {/* STEP 1: 기본 정보 */}
      <div className="accordion-item">
        <div 
          className="accordion-header"
          onClick={() => toggleSection('step1')}
        >
          <h3 className="accordion-title">STEP 1: 기본 정보</h3>
          {openSections.step1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {openSections.step1 && (
          <div className="accordion-content">
            <div className="info-grid">
              <div className="info-card">
                <h4 className="info-title">계획 정보</h4>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">계획 ID:</span>
                    <span className="info-value">{planDetail.planMst.planId}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">계획 날짜:</span>
                    <span className="info-value">{formatDate(planDetail.planMst.planYm)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">상태:</span>
                    <span className="info-value">{planDetail.planMst.status}</span>
                  </div>
                   {/* 총 계획 수량 */}
                  <div className="info-item">
                    <span className="info-label">총 계획 수량:</span>
                    <span className="info-value">
                      {planDetail.planProducts?.reduce((sum, product) => sum + product.planQty, 0).toLocaleString() || 0} 개
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="section-title">제품 정보</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead className="table-header">
                    <tr>
                      <th>제품명</th>
                      <th>규격</th>
                      <th>맥주 타입</th>
                      <th className="text-right">계획 수량</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {planDetail.planProducts?.map(product => (
                      <tr key={product.planProductId}>
                        <td className="table-cell">{product.productName}</td>
                        <td className="table-cell">{product.sizeSpec}</td>
                        <td className="table-cell">{planDetail.productBeerTypes?.[product.productId] || '-'}</td>
                        <td className="table-cell text-right font-medium">{product.planQty?.toLocaleString() || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* STEP 2: 공정 정보 */}
      <div className="accordion-item">
        <div 
          className="accordion-header"
          onClick={() => toggleSection('step2')}
        >
          <h3 className="accordion-title">STEP 2: 공정 정보</h3>
          {openSections.step2 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {openSections.step2 && (
          <div className="accordion-content">
            <div>
              <h4 className="section-title">라인 배정 정보</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead className="table-header">
                    <tr>
                      <th>배치 번호</th>
                      <th>라인 번호</th>
                      <th>제품명</th>
                      <th className="text-right">계획 수량</th>
                      <th>시작일</th>
                      <th>종료일</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {planDetail.planLines?.map(line => {
                      const product = planDetail.planProducts?.find(p => p.productId === line.productId);
                      return (
                        <tr key={line.planLineId}>
                          <td className="table-cell">{line.planBatchNo}</td>
                          <td className="table-cell">{line.lineNo}</td>
                          <td className="table-cell">{product?.productName || '-'}</td>
                          <td className="table-cell text-right font-medium">{line.planQty?.toLocaleString() || 0}</td>
                          <td className="table-cell">{formatDate(line.startDate)}</td>
                          <td className="table-cell">{formatDate(line.endDate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* STEP 3: 자재 정보 */}
      <div className="accordion-item">
        <div 
          className="accordion-header"
          onClick={() => toggleSection('step3')}
        >
          <h3 className="accordion-title">STEP 3: 자재 정보</h3>
          {openSections.step3 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {openSections.step3 && (
          <div className="accordion-content">
            {/* 원자재 테이블 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 className="section-title">원자재</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead className="table-header">
                    <tr>
                      <th>자재명</th>
                      <th>맥주</th>
                      <th>단위</th>
                      <th className="text-right">기준소요량</th>
                      <th className="text-right">계획소요량</th>
                      <th className="text-right">현재재고</th>
                      <th className="text-center">상태</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {planDetail.rawMaterials?.map((material, index) => (
                      <tr key={material.planMaterialId || index}>
                        <td className="table-cell">{material.materialName}</td>
                        <td className="table-cell">{material.beerName}</td>
                        <td className="table-cell">{material.unit}</td>
                        <td className="table-cell text-right">{material.stdQty ? parseFloat(material.stdQty).toLocaleString(undefined, { maximumFractionDigits: 3 }) : 0}</td>
                        <td className="table-cell text-right">{material.planQty ? parseFloat(material.planQty).toLocaleString(undefined, { maximumFractionDigits: 3 }) : 0}</td>
                        <td className="table-cell text-right">{material.currentStock ? parseFloat(material.currentStock).toLocaleString(undefined, { maximumFractionDigits: 3 }) : 0}</td>
                        <td className="table-cell text-center">
                          <span 
                            className={`status-badge ${
                              material.status === '부족' ? 'shortage' : 'sufficient'
                            }`}
                          >
                            {material.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* 부자재 테이블 */}
            <div>
              <h4 className="section-title">부자재</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead className="table-header">
                    <tr>
                      <th>자재명</th>
                      <th>맥주</th>
                      <th>단위</th>
                      <th className="text-right">기준소요량</th>
                      <th className="text-right">계획소요량</th>
                      <th className="text-right">현재재고</th>
                      <th className="text-center">상태</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {planDetail.packagingMaterials?.map((material, index) => (
                      <tr key={material.planMaterialId || index}>
                        <td className="table-cell">{material.materialName}</td>
                        <td className="table-cell">{material.beerName}</td>
                        <td className="table-cell">{material.unit}</td>
                        <td className="table-cell text-right">
            {material.stdQty ? parseFloat(material.stdQty).toLocaleString(undefined, { maximumFractionDigits: 3 }) : 0}
          </td>
          <td className="table-cell text-right">
            {material.planQty ? parseFloat(material.planQty).toLocaleString(undefined, { maximumFractionDigits: 3 }) : 0}
          </td>
          <td className="table-cell text-right">
            {material.currentStock ? parseFloat(material.currentStock).toLocaleString(undefined, { maximumFractionDigits: 3 }) : 0}
          </td>
                        <td className="table-cell text-center">
                          <span 
                            className={`status-badge ${
                              material.status === '부족' ? 'shortage' : 'sufficient'
                            }`}
                          >
                            {material.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 자재 구매 요청 정보 (있는 경우만 표시) */}
      {planDetail.materialRequests && (
        <div className="accordion-item">
          <div 
            className="accordion-header"
            onClick={() => toggleSection('materialRequest')}
          >
            <h3 className="accordion-title">자재 구매 요청 정보</h3>
            {openSections.materialRequest ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {openSections.materialRequest && (
            <div className="accordion-content">
              <div className="info-grid">
                <div className="info-card">
                  <h4 className="info-title">구매 요청 정보</h4>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">납기요청일:</span>
                      <span className="info-value">{formatDate(planDetail.materialRequests.deliveryDate)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">신청사유:</span>
                      <span className="info-value">{planDetail.materialRequests.reason || '-'}</span>
                    </div>
                    {planDetail.materialRequests.note && (
                      <div className="note-container">
                        <span className="note-label">특이사항:</span>
                        <p className="note-text">{planDetail.materialRequests.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="section-title">요청 자재 목록</h4>
                <div className="table-container">
                  <table className="data-table">
                    <thead className="table-header">
                      <tr>
                        <th>자재명</th>
                        <th className="text-right">신청 수량</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {planDetail.materialRequests.materials?.map((material, index) => (
                        <tr key={index}>
                          <td className="table-cell">{material.materialName}</td>
                          <td className="table-cell text-right font-medium">{material.requestQty?.toFixed(4) || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductionPlanDetailAccordion;
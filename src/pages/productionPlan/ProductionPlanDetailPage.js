import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PremiumBreweryCalendar from '../../components/productionPlan/PremiumBreweryCalendar';
import ProductionPlanDetailAccordion from '../../components/productionPlan/ProductionPlanDetailAccordion';
import { fetchProductionPlanDetail } from '../../apis/productionPlanApi/ProductionPlanDetailApi';
import styles from '../../styles/productionPlan/ProductionPlanDetailPage.module.css';

const ProductionPlanDetailPage = () => {
  const { planId } = useParams();
  const [planDetail, setPlanDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadPlanDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await fetchProductionPlanDetail(planId);
        setPlanDetail(data);
      } catch (error) {
        console.error('생산 계획 상세 정보 로드 실패:', error);
        setError('생산 계획 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (planId) {
      loadPlanDetail();
    }
  }, [planId]);

  // 로딩 중일 때 표시할 내용
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>생산 계획 정보를 불러오는 중입니다...</p>
      </div>
    );
  }
  
  // 에러가 있을 때 표시할 내용  
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          다시 시도
        </button>
      </div>
    );
  }
  
  // planDetail이 null일 때 표시할 내용
  if (!planDetail) {
    return (
      <div className={styles.noDataContainer}>
        <p className={styles.noDataMessage}>생산 계획 정보가 없습니다.</p>
      </div>
    );
  }
  
  
  // 캘린더 이벤트 생성 - 여기가 중요한 부분입니다
  const calendarEvents = [];
  
  // planDetail.planLines를 이용하여 공정 일정 생성
  if (planDetail.planLines && planDetail.planLines.length > 0) {
    planDetail.planLines.forEach(line => {
      if (!line.startDate) return; // 시작일이 없으면 건너뜀
      
      const product = planDetail.planProducts.find(p => p.productId === line.productId);
      if (!product) return;
      
      const beerType = planDetail.productBeerTypes?.[line.productId] || '에일';
      const isAle = beerType === '에일';
      
      let currentTime = new Date(line.startDate);
      
      // 표준 공정 시간 (분)
      const processTimes = {
        분쇄: 40,
        당화: 50,
        여과: 50,
        끓임: 60,
        냉각: 20,
        발효: isAle ? 14 * 24 * 60 : 21 * 24 * 60, // 에일: 14일, 라거: 21일
        숙성: isAle ? 10 * 24 * 60 : 30 * 24 * 60, // 에일: 10일, 라거: 30일
        숙성후여과: 120,
        탄산조정: 120
      };
      
      // 각 공정별로 이벤트 생성
      Object.entries(processTimes).forEach(([process, duration]) => {
        const startTime = new Date(currentTime);
        const endTime = new Date(currentTime.getTime() + duration * 60 * 1000);
        
        calendarEvents.push({
          id: `${line.planLineId}-${process}`,
          productName: product.productName,
          beerType: beerType,
          process: process,
          lineNo: line.lineNo,
          batchNo: line.planBatchNo,
          start: startTime,
          end: endTime,
          backgroundColor: getProcessColor(process),
          textColor: getProcessTextColor(process)
        });
        
        // 다음 공정 시작 시간 설정
        currentTime = endTime;
      });
    });
  }
  
  // 공정별 색상 정의
  function getProcessColor(process) {
    const colors = {
      분쇄: '#E3F2FD',
      당화: '#FFEBEE',
      여과: '#E8F5E9',
      끓임: '#FFF8E1',
      냉각: '#E1F5FE',
      발효: '#FFF3E0',
      숙성: '#F3E5F5',
      숙성후여과: '#E0F2F1',
      탄산조정: '#E8EAF6'
    };
    return colors[process] || '#F5F5F5';
  }
  
  // 공정별 텍스트 색상 정의
  function getProcessTextColor(process) {
    const colors = {
      분쇄: '#0D47A1',
      당화: '#B71C1C',
      여과: '#1B5E20',
      끓임: '#E65100',
      냉각: '#01579B',
      발효: '#BF360C',
      숙성: '#4A148C',
      숙성후여과: '#004D40',
      탄산조정: '#1A237E'
    };
    return colors[process] || '#212121';
  }
  
  return (
    <div className={styles.planDetailPage}>
      <h1 className={styles.pageTitle}>생산 계획 상세</h1>
      
      {/* 캘린더 뷰 */}
      <section className={styles.calendarSection}>
        <h2 className={styles.sectionTitle}>생산 일정</h2>
        <PremiumBreweryCalendar events={calendarEvents} />
      </section>
      
      {/* STEP별 아코디언 섹션 */}
      <section className={styles.detailSection}>  
        <h2 className={styles.sectionTitle}>생산 계획 정보</h2>
        <ProductionPlanDetailAccordion planDetail={planDetail} />
      </section>
    </div>
  );
};

export default ProductionPlanDetailPage;
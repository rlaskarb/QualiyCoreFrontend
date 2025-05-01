

import React, { useState, useEffect } from 'react';
import { fetchWortVolumes } from '../../apis/routingApi/WortVolumeApi';
import WortVolumeTable from './WortVolumeTable';
import WortVolumeChart from './WortVolumeChart';
import styles from '../../styles/routing/WortVolumePage.module.css';

const WortVolumePage = () => {
    const [wortData, setWortData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchLotNo, setSearchLotNo] = useState('');
    const [filterLotNo, setFilterLotNo] = useState('');
  
    // 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            try {
              setLoading(true);
              const data = await fetchWortVolumes(filterLotNo);
              // 끓임 공정 데이터만 필터링
              const boilingProcessData = data.filter(item => item.processName === '끓임');
              setWortData(boilingProcessData);
              setError(null);
            } catch (err) {
              setError('데이터를 불러오는 중 오류가 발생했습니다.');
              console.error(err);
            } finally {
              setLoading(false);
            }
          };
  
      loadData();
    }, [filterLotNo]);
  
    // 검색 핸들러
    const handleSearch = (e) => {
      e.preventDefault();
      setFilterLotNo(searchLotNo);
    };
  
    // 검색어 초기화
    const handleClearSearch = () => {
      setSearchLotNo('');
      setFilterLotNo('');
    };
  
    // 날짜/시간 포맷팅 함수
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-';
      const date = new Date(dateTime);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

const getEfficiencyClass = (efficiency) => {
    if (efficiency >= 95) return styles.efficiencyHigh;
    if (efficiency >= 90) return styles.efficiencyGood;
    if (efficiency >= 85) return styles.efficiencyMedium;
    return styles.efficiencyLow;
  };

// 효율 범례 컴포넌트
const EfficiencyLegend = () => {
    return (
      <div className={styles.efficiencyLegend}>
        <h3 className={styles.legendTitle}>효율 기준</h3>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.efficiencyHigh}`}></span>
            <span className={styles.legendText}>95% 이상: 우수</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.efficiencyGood}`}></span>
            <span className={styles.legendText}>90-95%: 양호</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.efficiencyMedium}`}></span>
            <span className={styles.legendText}>85-90%: 개선 필요</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.efficiencyLow}`}></span>
            <span className={styles.legendText}>85% 미만: 즉시 조치</span>
          </div>
        </div>
      </div>
    );
  };


    return (
      <div className={styles.productionPlanContainer}>
      <h1 className={styles.pageTitle}>끓임 공정 워트량 조회</h1>
        
        {/* 검색 폼 */}
        <div className={styles.searchBar}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchFilter}>
              <label htmlFor="lotNoSearch">LOT 번호</label>
              <input
                id="lotNoSearch"
                type="text"
                placeholder="LOT 번호로 검색"
                value={searchLotNo}
                onChange={(e) => setSearchLotNo(e.target.value)}
              />
            </div>
            <button type="submit">검색</button>
            <button type="button" onClick={handleClearSearch} className={styles.clearButton}>
              초기화
            </button>
          </form>
        </div>
  
        {/* 로딩 및 에러 처리 */}
        {loading && <div className={styles.loadingMessage}>데이터를 불러오는 중...</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}
  
        {/* 데이터 표시 */}
        {!loading && !error && (
          <>
            {wortData.length > 0 ? (
              <div className={styles.contentContainer}>
                <div className={styles.tableSection}>
                <EfficiencyLegend />
                  <div className={styles.planTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>LOT 번호</th>
                          <th>공정명</th>
                          <th>초기 워트량(L)</th>
                          <th>끓임 후 워트량(L)</th>
                          <th>손실량(L)</th>
                          <th>효율(%)</th>
                          {/* <th>공정 상태</th> */}
                        </tr>
                      </thead>
                      <tbody>
                      {wortData.map((item, index) => (
        <tr key={index}>
          <td>{item.lotNo}</td>
          <td>{item.processName}</td>
          <td>{item.initialWortVolume !== null ? item.initialWortVolume.toFixed(2) : '-'}</td>
          <td>{item.currentWortVolume !== null ? item.currentWortVolume.toFixed(2) : '-'}</td>
          <td>{item.lossVolume !== null ? item.lossVolume.toFixed(2) : '-'}</td>
          <td>
            {item.totalEfficiency !== null ? (
              <span className={`${styles.efficiency} ${getEfficiencyClass(item.totalEfficiency)}`}>
                {item.totalEfficiency.toFixed(2)}%
              </span>
            ) : '-'}
          </td>
          {/* <td>
            <span className={`${styles.status} ${styles[item.processStatus || '대기중']}`}>
              {item.processStatus || '대기중'}
            </span>
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className={styles.chartSection}>
                  <h2 className={styles.sectionTitle}>워트량 차트</h2>
                  <WortVolumeChart data={wortData} />
                </div>
              </div>
            ) : (
              <div className={styles.noDataMessage}>
                조회된 데이터가 없습니다.
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  
  export default WortVolumePage;
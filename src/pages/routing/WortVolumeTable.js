// src/components/WortVolumeTable.js

import React from 'react';
import styles from '../../styles/routing/WortVolumeTable.module.css';

const WortVolumeTable = ({ data }) => {
  // 날짜/시간 포맷팅 함수
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.wortTable}>
        <thead>
          <tr>
            <th>LOT 번호</th>
            <th>공정명</th>
            <th>초기 워트량(L)</th>
            <th>최종 워트량(L)</th>
            <th>손실량(L)</th>
            <th>효율(%)</th>
            <th>기록 시간</th>
            <th>공정 상태</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={styles.tableRow}>
              <td>{item.lotNo}</td>
              <td>{item.processName}</td>
              <td>{item.initialWortVolume !== null ? item.initialWortVolume.toFixed(2) : '-'}</td>
              <td>{item.currentWortVolume !== null ? item.currentWortVolume.toFixed(2) : '-'}</td>
              <td>{item.lossVolume !== null ? item.lossVolume.toFixed(2) : '-'}</td>
              <td>{item.totalEfficiency !== null ? item.totalEfficiency.toFixed(2) : '-'}</td>
              <td>{formatDateTime(item.recordTime)}</td>
              <td>
                <span className={`${styles.statusBadge} ${styles[item.processStatus?.toLowerCase()]}`}>
                  {item.processStatus || '미지정'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WortVolumeTable;
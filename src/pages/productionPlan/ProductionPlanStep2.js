import React, { useState, useEffect } from "react";
import styles from "../../styles/productionPlan/ProductionPlanStep2.module.css";
import _ from 'lodash';

const ProductionPlanStep2 = ({ formData, setFormData, goToStep, currentStep = 2 }) => {
    const [allocatedRounds, setAllocatedRounds] = useState([]);
    const [totalAllocated, setTotalAllocated] = useState(0);
    const [allocationWarning, setAllocationWarning] = useState(false);
    // 총 계획 수량 계산
    const totalPlanned = formData.products.reduce((sum, p) => sum + parseInt(p.planQty || 0), 0);

    useEffect(() => {
        if (formData.allocatedLines) {
            // 여기서 각 라인에 맥주 타입 정보 추가
            const linesWithBeerType = Object.values(formData.allocatedLines).map(round =>
                round.map(line => {
                    // 해당 제품의 맥주 타입 찾기
                    const product = formData.products.find(p => p.productId === line.productId);

                    return {
                        ...line,
                        beerType: product?.beerType || '에일맥주' // 기본값 설정
                    };
                })
            );
            setAllocatedRounds(linesWithBeerType);
        }
    }, [formData.allocatedLines, formData.products]);

    // 현재 배정된 총 수량 계산 (실시간)
    useEffect(() => {
        const currentTotal = allocatedRounds.reduce((sum, round) =>
            sum + round.reduce((roundSum, line) => roundSum + (parseInt(line.allocatedQty) || 0), 0), 0);
        setTotalAllocated(currentTotal);

        // 배정 수량이 계획 수량과 다르면 경고 표시
        setAllocationWarning(currentTotal !== totalPlanned);
    }, [allocatedRounds, totalPlanned]);

    const calculateEndDate = (startDate, beerType) => {
        const start = new Date(startDate);
        // 맥주 타입에 따라 일수 계산
        const daysToAdd = beerType === '라거맥주' ? 52 : 25;
        const endDate = new Date(start);
        endDate.setDate(start.getDate() + daysToAdd);

        return endDate.toISOString().split('T')[0];
    };

    const handleAllocatedQtyChange = (roundIndex, lineIndex, field, value) => {
        const newRounds = [...allocatedRounds];
        const currentLine = newRounds[roundIndex][lineIndex];

        if (field === 'startDate') {
            // 시작 날짜 변경 시 맥주 타입에 따른 종료 날짜 계산
            const endDate = calculateEndDate(value, currentLine.beerType);

            currentLine.startDate = value;
            currentLine.endDate = endDate;

            if (currentLine.endDate && value > currentLine.endDate) {
                alert('생산 시작일은 종료일보다 늦을 수 없습니다!!! 다시!!!!');
                return;
            }
        }
        else if (field === 'allocatedQty') {
            currentLine[field] = value === '' || value === '0' ? '' : parseInt(value);
        }
        else if (field === 'endDate') {
            // 수동으로 종료 날짜 변경 시 유효성 검사
            if (currentLine.startDate && value < currentLine.startDate) {
                alert('생산 종료일은 시작일보다 빠를 수 없습니다!!!! 다시!!!!');
                return;
            }
            currentLine.endDate = value;
        }

        setAllocatedRounds(newRounds);

        // formData 업데이트
        const updatedLines = newRounds.flat();
        setFormData(prev => ({
            ...prev,
            allocatedLines: _.groupBy(updatedLines, 'planBatchNo')
        }));
    };

    const handleNextStep = () => {
        if (totalAllocated !== totalPlanned) {
            if (!window.confirm(`총 계획 수량(${totalPlanned.toLocaleString()}개)과 현재 배정된 수량(${totalAllocated.toLocaleString()}개)이 일치하지 않습니다.\n계속 진행하시겠습니까?`)) {
                return;
            }
        }
        goToStep(3);
    };



    return (
        <div className={styles.container}>
            <div className="steps-container">
                <div className={`step ${currentStep === 1 ? "active" : ""}`}>
                    <div className="step-number">1</div>
                    <span>기본정보</span>
                </div>
                <div className={`step ${currentStep === 2 ? "active" : ""}`}>
                    <div className="step-number">2</div>
                    <span>공정정보</span>
                </div>
                <div className={`step ${currentStep === 3 ? "active" : ""}`}>
                    <div className="step-number">3</div>
                    <span>자재정보</span>
                </div>
            </div>

            <h2 className={styles.title}>공정 정보 입력</h2>

            <div className={styles.summarySection}>
                <div className={styles.summaryCard}>
                    <h3>생산 계획 요약</h3>
                    <div className={styles.summaryGrid}>
                        <div>
                            <label>총 계획 수량</label>
                            <span>{totalPlanned.toLocaleString()}개</span>
                        </div>
                        <div>
                            <label>현재 배정 수량</label>
                            <span className={allocationWarning ? styles.warning : ''}>
                                {totalAllocated.toLocaleString()}개
                            </span>
                        </div>
                        <div>
                            <label>라인당 생산가능</label>
                            <span>6,000개</span>
                        </div>
                    </div>
                    {allocationWarning && (
                        <div className={styles.warningMessage}>
                            ⚠️ 배정 수량이 계획 수량과 일치하지 않습니다.
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.roundsContainer}>
                {allocatedRounds.length > 0 ? (
                    allocatedRounds.map((round, roundIndex) => {
                        const batchTotal = round.reduce((sum, line) => sum + (line.allocatedQty || 0), 0);
                        return (
                            <div key={roundIndex} className={styles.roundSection}>
                                <div className={styles.roundHeader}>
                                    <h3 className={styles.roundTitle}>
                                        {roundIndex + 1}회차 생산
                                        <span className={styles.batchInfo}>
                                            배정 수량: {batchTotal.toLocaleString()}개
                                        </span>
                                    </h3>
                                </div>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>제품명</th>
                                            <th>라인 번호</th>
                                            <th>배정 수량</th>
                                            <th>생산 시작일</th>
                                            <th>생산 종료일</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {round.map((line, lineIndex) => (
                                            <tr key={lineIndex}>
                                                <td>{line.productName}</td>
                                                <td>{line.lineNo}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={line.allocatedQty}
                                                        onChange={(e) => handleAllocatedQtyChange(roundIndex, lineIndex, 'allocatedQty', e.target.value)}
                                                        className={styles.input}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="date"
                                                        value={line.startDate || ''}
                                                        max={line.endDate || ''}
                                                        onChange={(e) => handleAllocatedQtyChange(roundIndex, lineIndex, 'startDate', e.target.value)}
                                                        className={styles.input}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="date"
                                                        value={line.endDate || ''}
                                                        min={line.startDate || ''}
                                                        onChange={(e) => handleAllocatedQtyChange(roundIndex, lineIndex, 'endDate', e.target.value)}
                                                        className={styles.input}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })
                ) : (
                    <p>📌 배정된 생산 라인 데이터가 없습니다.</p>
                )}
            </div>

            <div className={styles.buttonGroup}>
                <button onClick={() => goToStep(1)} className={styles.prevButton}>← 이전</button>
                <button onClick={handleNextStep} className={styles.nextButton}>다음 단계 →</button>
            </div>
        </div>
    );
};

export default ProductionPlanStep2;
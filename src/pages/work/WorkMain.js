import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 추가
import styles from '../../styles/WorkMain.module.css';
import { findAllWorkOrders } from "../../apis/workOrderApi/workOrdersApi";
import { CircularProgress } from '@mui/material';

function WorkMain() {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // useNavigate 훅 사용

    useEffect(() => {
        fetchWorkOrders();
    }, []);

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const data = await findAllWorkOrders(0, 100);
            if (data && data.work && Array.isArray(data.work.content)) {
                setWorkOrders(data.work.content);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching work orders:", error);
            setError("데이터를 불러오는 데 실패했습니다.");
            setLoading(false);
        }
    };

    // 진행률
    const getWorkProgress = (statusCode) => {
        const statusProgressMap = {
            SC001: 10, SC002: 20, SC003: 30,
            SC004: 40, SC005: 50, SC006: 60,
            SC007: 70, SC008: 80, SC009: 90, SC010: 100
        };
        return statusProgressMap[statusCode] || 0;
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                {/* 작업현황 클릭 시 navigate('/work/orders') 실행 */}
                <h1 className={styles.title} onClick={() => navigate('/work/orders')} style={{ cursor: 'pointer' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 7H20" stroke="#3182CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 12H20" stroke="#3182CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 17H20" stroke="#3182CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    작업현황
                </h1>
            </div>

            {loading ? (
                <div className={styles.loadingContainer}>
                    <CircularProgress />
                </div>
            ) : error ? (
                <div className={styles.errorContainer}>
                    <p>{error}</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.workOrderTable}>
                        <thead>
                            <tr>
                                <th>작업지시번호</th>
                                <th>작업조</th>
                                <th>생산라인</th>
                                <th>작업지시상태</th>
                                <th>진행률</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workOrders.length > 0 ? (
                                workOrders.map((order) => {
                                    const progress = getWorkProgress(order.statusCode);
                                    return (
                                        <tr key={order.lotNo}>
                                            <td>{order.lotNo}</td>
                                            <td>{order.workTeam}</td>
                                            <td>{order.lineNo} LINE</td>
                                            <td>{order.processStatus}</td>
                                            <td>
                                                <div className={styles.progressBar}>
                                                    <div
                                                        className={styles.progressBarFill}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                    <span className={styles.progressBarLabel}>
                                                        {progress}%
                                                    </span>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5">
                                        <div className={styles.noData}>
                                            조회된 작업 데이터가 없습니다.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* 데이터 기준 날짜 정보 제거 */}
                </div>
            )}
        </div>
    );
}

export default WorkMain;

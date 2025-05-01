import React, { useState, useEffect } from "react";
import { maturationDetailApi } from "../../../apis/production-process/maturation-detail/maturationDetailApi";
import MaturationControls from "../../../components/production-process/maturation-process/MaturationControls";
import MaturationCss from "../../../styles/production-process/MaturationCss.module.css";

const MaturationPage = () => {
    const [workOrderList, setWorkOrderList] = useState([]); // 작업지시 목록 상태
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null); // 선택된 작업지시 상태

    useEffect(() => {
        // 작업지시 ID 목록 가져오기
        const fetchWorkOrders = async () => {
            try {
                const workOrders = await maturationDetailApi.fetchLineMaterial(); // API 호출
                setWorkOrderList(workOrders); // 작업지시 목록 상태 업데이트

                if (workOrders.length > 0) {
                    setSelectedWorkOrder(workOrders[0]); // 기본값 설정: 첫 번째 작업지시 선택
                }
            } catch (error) {
                console.error("❌ 작업지시 목록 불러오기 실패:", error);
            }
        };

        fetchWorkOrders();
    }, []); // 컴포넌트 마운트 시 한 번 실행

    return (
        <div className={MaturationCss.container}>
            <MaturationControls
                workOrder={selectedWorkOrder} // 선택된 작업지시 전달
                workOrderList={workOrderList} // 작업지시 목록 전달
                setSelectedWorkOrder={setSelectedWorkOrder} // 선택된 작업지시 업데이트 함수 전달
            />
        </div>
    );
};

export default MaturationPage;

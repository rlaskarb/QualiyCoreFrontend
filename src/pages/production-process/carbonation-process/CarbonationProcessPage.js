import React, { useState, useEffect } from "react";
import { carbonationProcessApi } from "../../../apis/production-process/carbonation-process/carbonationProcessApi";
import CarbonationProcessControls from "../../../components/production-process/carbonation-process/CarbonationProcessControls";

const CarbonationProcessPage = () => {
    const [workOrderList, setWorkOrderList] = useState([]);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState({});

    useEffect(() => {
        // 작업지시 ID 목록 가져오기
        const fetchWorkOrders = async () => {
            try {
                const workOrders = await carbonationProcessApi.fetchLineMaterial();
                setWorkOrderList(workOrders);

                if (workOrders.length > 0) {
                    setSelectedWorkOrder(workOrders[0]); // 기본값 설정
                }
            } catch (error) {
                console.error("❌ 작업지시 목록 불러오기 실패:", error);
            }
        };

        fetchWorkOrders();
    }, []);

    return (
        <div>
            <CarbonationProcessControls
                workOrder={selectedWorkOrder}
                workOrderList={workOrderList}
                setSelectedWorkOrder={setSelectedWorkOrder}
            />
        </div>
    );
};

export default CarbonationProcessPage;

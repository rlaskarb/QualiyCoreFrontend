import React, { useState, useEffect } from "react";
import filtrationProcessApi from "../../../apis/production-process/filtration-process/FiltrationProcessApi";
import FiltrationProcessControls from "../../../components/production-process/filtration-process/FiltrationProcessControls";

const FiltrationProcessPage = () => {
    const [filtrationDataList, setFiltrationDataList] = useState([]);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState({});

    useEffect(() => {
        // 여과공정 데이터 가져오기
        const fetchFiltrationData = async () => {
            try {
                const workOrders = await filtrationProcessApi.getWorkOrderList();
                setFiltrationDataList(workOrders);

                if (workOrders.length > 0) {
                    setSelectedWorkOrder(workOrders[0]); // 기본 작업지시를 첫 번째 값으로 설정
                }
            } catch (error) {
                console.error("❌ 여과공정 데이터 불러오기 실패:", error);
            }
        };

        fetchFiltrationData();
    }, []);

    return (
        <div>
            <FiltrationProcessControls 
                workOrder={selectedWorkOrder} // ✅ 작업지시 ID 전달
                filtrationDataList={filtrationDataList} 
                setFiltrationDataList={setFiltrationDataList} 
            />
        </div>
    );
};

export default FiltrationProcessPage;

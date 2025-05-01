import React, { useState, useEffect } from "react";
import boilingProcessApi from "../../../apis/production-process/boiling-process/BoilingProcessApi";
import BoilingProcessControls from "../../../components/production-process/boiling-process/BoilingProcessControls";

const BoilingProcessPage = () => {
    const [boilingDataList, setBoilingDataList] = useState([]);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState({});

    useEffect(() => {
        // 끓임 공정 데이터 가져오기
        const fetchBoilingData = async () => {
            try {
                const workOrders = await boilingProcessApi.getWorkOrderList();
                setBoilingDataList(workOrders);

                if (workOrders.length > 0) {
                    setSelectedWorkOrder(workOrders[0]); // 기본 작업지시를 첫 번째 값으로 설정
                }
            } catch (error) {
                console.error("❌ 끓임 공정 데이터 불러오기 실패:", error);
            }
        };

        fetchBoilingData();
    }, []);

    return (
        <div>
            <BoilingProcessControls 
                workOrder={selectedWorkOrder} // ✅ 작업지시 ID 전달
                boilingDataList={boilingDataList} 
                setBoilingDataList={setBoilingDataList} 
            />
        </div>
    );
};

export default BoilingProcessPage;
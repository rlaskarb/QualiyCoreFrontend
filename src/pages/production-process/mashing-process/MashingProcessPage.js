import React, { useState, useEffect } from "react";
import mashingProcessApi from "../../../apis/production-process/mashing-process/MashingProcessApi";
import MashingProcessControls from "../../../components/production-process/mashing-process/MashingProcessControls";

const MashingProcessPage = () => {
    const [mashingDataList, setMashingDataList] = useState([]);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState({});


    useEffect(() => {
        // 당화공정 데이터 가져오기
        const fetchMashingData = async () => {
            try {
                const workOrders = await mashingProcessApi.getWorkOrderList();
                setMashingDataList(workOrders);

                if (workOrders.length > 0) {
                    setSelectedWorkOrder(workOrders[0]); // 기본 작업지시를 첫 번째 값으로 설정
                }

            } catch (error) {
                console.error("❌ 당화공정 데이터 불러오기 실패:", error);
            }
        };

        fetchMashingData();
    }, []); 

    return (
        <div>            
           <MashingProcessControls 
                workOrder={selectedWorkOrder} // ✅ 작업지시 ID 전달
                mashingDataList={mashingDataList} 
                setMashingDataList={setMashingDataList} 
            />
        </div>
    );
};

export default MashingProcessPage;



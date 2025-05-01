import React, { useState, useEffect } from "react";
import coolingProcessApi from "../../../apis/production-process/cooling-process/CoolingProcessApi";
import CoolingProcessControls from "../../../components/production-process/cooling-process/CoolingProcessControls";

const CoolingProcessPage = () => {
    
        const [coolingDataList, setCoolingDataList] = useState([]);
        const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

      
        useEffect(() => {
            const fetchCoolingData = async () => {
                try {
                    const workOrders = await coolingProcessApi.getWorkOrderList();
                    setCoolingDataList(workOrders);
                    if (workOrders.length > 0) {
                        setSelectedWorkOrder(workOrders[0]);
                    }
                } catch (error) {
                    console.error("❌ 냉각 공정 데이터 불러오기 실패:", error);
                }
            };
            fetchCoolingData();
        }, []);
      
        return (
          <div>
            <CoolingProcessControls
              workOrder={selectedWorkOrder}
              coolingDataList={coolingDataList}
              setCoolingDataList={setCoolingDataList}
            />
          </div>
        );
      };

      export default CoolingProcessPage;
      
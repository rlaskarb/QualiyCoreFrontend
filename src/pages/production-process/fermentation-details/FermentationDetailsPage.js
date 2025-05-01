import React, { useState, useEffect } from "react";
import fermentationDetailsApi from "../../../apis/production-process/fermentation-details/FermentationDetailsApi";
import FermentationDetailsControls from "../../../components/production-process/fermentation-details/FermentationDetailsControls"; 

const FermentationDetailsPage = () => {
    
        const [fermentationDataList, setFermentationDataList] = useState([]);
        const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

      
        useEffect(() => {
            const fermentationData = async () => {
                try {
                    const workOrders = await fermentationDetailsApi.getWorkOrderList();
                    setFermentationDataList(workOrders);
                    if (workOrders.length > 0) {
                        setSelectedWorkOrder(workOrders[0]);
                    }
                } catch (error) {
                    console.error("❌  데이터 불러오기 실패:", error);
                }
            };
            fermentationData();
        }, []);
      
        return (
          <div>
            <FermentationDetailsControls
              workOrder={selectedWorkOrder}
              fermentationDataList={fermentationDataList}
              setFermentationDataList={setFermentationDataList}
            />
          </div>
        );
      };

      export default FermentationDetailsPage;
      
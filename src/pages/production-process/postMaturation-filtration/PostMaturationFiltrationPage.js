import React, { useState, useEffect } from "react";
import { postMaturationFiltrationApi } from "../../../apis/production-process/postMaturation-filtration/PostMaturationApi";
import PostMaturationFiltrationControls from "../../../components/production-process/postMaturation-filtration/PostMaturationFiltrationControls";

const PostMaturationFiltrationPage = () => {
    const [workOrderList, setWorkOrderList] = useState([]);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState({});

    useEffect(() => {
        // 작업지시 ID 목록 가져오기
        const fetchWorkOrders = async () => {
            try {
                const workOrders = await postMaturationFiltrationApi.fetchLineMaterial();
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
            <PostMaturationFiltrationControls
                workOrder={selectedWorkOrder}
                workOrderList={workOrderList}
                setSelectedWorkOrder={setSelectedWorkOrder}
            />
        </div>
    );
};

export default PostMaturationFiltrationPage;

import React from "react";

const MaterialGrindingTable = ({ grindingDataList }) => {
    return (
        <table className="material-grinding-table">
            <thead>
                <tr>
                    <th>작업지시 ID</th>
                    <th>주원료</th>
                    <th>주원료 투입량</th>
                    <th>맥아 종류</th>
                    <th>맥아 투입량</th>
                    <th>분쇄 간격 설정</th>
                    <th>분쇄 속도 설정</th>
                    <th>소요시간</th>
                    <th>상태 코드 ID</th>
                    <th>공정 상태</th>
                    <th>공정 이름</th>
                    <th>소요 시간</th>
                </tr>
            </thead>
            <tbody>
                {grindingDataList.map((data, index) => (
                    <tr key={index}>
                        <td>{data.lotNo}</td>
                        <td>{data.mainMaterial}</td>
                        <td>{data.mainMaterialInputVolume}kg</td>
                        <td>{data.maltType}</td>
                        <td>{data.maltInputVolume}kg</td>
                        <td>{data.grindIntervalSetting}mm</td>
                        <td>{data.grindSpeedSetting}RPM</td>
                        <td>{data.grindDuration}분</td>
                        <td>{data.statusCode}</td>
                        <td>{data.processStatus}</td>
                        <td>{data.processName}</td>
                        <td>{data.notes}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MaterialGrindingTable;

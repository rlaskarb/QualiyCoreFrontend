import React, { useState } from "react";
import MaterialGrindingForm from "../../../components/production-process/material-grinding/MaterialGrindingForm";
import MaterialGrindingControls from "../../../components/production-process/material-grinding/MaterialGrindingControls";
import styles from "../../../styles/production-process/MaterialGrindingControls.module.css";

const MaterialGrindingPage = () => {
  const [lineMaterial, setLineMaterial] = useState([]);
  const [grindingData, setGrindingData] = useState({
    lotNo: "",
    mainMaterial: "",
    mainMaterialInputVolume: "",
    maltType: "",
    maltInputVolume: "",
    grindIntervalSetting: "",
    grindSpeedSetting: "", 
    grindDuration: "40",
    statusCode: "SC001",
    processStatus: "대기 중",
    processName: "분쇄 및 원재료 투입",
    notes: "",
  });

  



    return (
      <div className={styles["productionPlan-container"]}>
      <h1 className={styles["page-title"]}>분쇄 공정 관리</h1>
      <MaterialGrindingForm 
        grindingData={grindingData} 
        setGrindingData={setGrindingData} 
        lineMaterial={lineMaterial} 
        setLineMaterial={setLineMaterial} 
      />
      <MaterialGrindingControls 
        grindingData={grindingData} 
        setGrindingData={setGrindingData} 
        setLineMaterial={setLineMaterial} 
      />
      </div>
    );

};


export default MaterialGrindingPage;

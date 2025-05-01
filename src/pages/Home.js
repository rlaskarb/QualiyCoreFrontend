import React from "react";
import styles from "../styles/Home.module.css";
import BoardMain from "./board/BoardMain";
import ProductionPlanCard from "../components/home/ProductionPlanCard";
import BeerPodium from "../pages/work/BeerPodium";
import WorkMain from "./work/WorkMain";


const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.gridContainer}>
        <div className={`${styles.gridItem} ${styles.workOrderCard}`}>
          <WorkMain />
        </div>

        <div className={`${styles.gridItem} ${styles.processManagementCard}`}>
          <BoardMain />
        </div>

        <div className={`${styles.gridItem} ${styles.productionPlanCard}`}>
          <ProductionPlanCard />
        </div>

        <div className={`${styles.gridItem} ${styles.performanceCard}`}>
          <BeerPodium />
        </div>
      </div>
    </div>
  );
};

export default Home;
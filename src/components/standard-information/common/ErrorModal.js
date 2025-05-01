import React from "react";
import Lottie from "lottie-react";
import animationData from "../../../lottie/caution.json"; 
import styles from "../../../styles/standard-information/common/modal.module.css";

const ErrorModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null; // 모달이 닫혀있으면 렌더링하지 않음

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <Lottie animationData={animationData} loop={true} className={styles.warningAnimation} />
        <p>{message}</p>
        <button onClick={onClose} className={styles.mConfirmBtn}>
          확인
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;

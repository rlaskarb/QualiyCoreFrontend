import React from "react";
import Lottie from "lottie-react";
import animationData from "../../../lottie/Success.json";
import styles from "../../../styles/standard-information/common/modal.module.css";

const SuccessfulModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null; // 모달이 열려있지 않으면 렌더링하지 않음

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <Lottie animationData={animationData} loop={true} className={styles.successAnimation}  /> 
        <p>{message}</p>
        <button onClick={onClose} className={styles.mConfirmBtn}>
          확인
        </button>
      </div>
    </div>
  );
};

export default SuccessfulModal;

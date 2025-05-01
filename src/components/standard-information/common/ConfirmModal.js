import React from "react";
import Lottie from "lottie-react";
import animationData from "../../../lottie/registration.json"; 
import styles from "../../../styles/standard-information/common/modal.module.css"; 

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null; // 모달이 열려있지 않으면 렌더링하지 않음

  return (
    <div className={styles.modal}  >
      <div className={styles.modalContent}>
        <Lottie animationData={animationData} loop={true} className={styles.confirmAnimation}/>
        
        <p>{message}</p>
          <button onClick={onConfirm} className={styles.mConfirmBtn}>
            확인
          </button>
          <button onClick={onClose} className={styles.mCancelBtn}>
            취소
          </button>
      </div>
   </div>
  );
};

export default ConfirmModal;
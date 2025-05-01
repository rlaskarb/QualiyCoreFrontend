import { useState } from "react";
import Lottie from "lottie-react";
import animationData from "../../../lottie/caution.json";
import styles from "../../../styles/standard-information/common/modal.module.css"; 

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  const [deleteInput, setDeleteInput] = useState("");
  const confirmText = `${itemName} 삭제`.trim(); // 삭제 확인 문구 및 공백제거거

  // 입력 필드 업데이트
  const handleInputChange = (e) => { 
    setDeleteInput(e.target.value.trim());
  };

  // 엔터키 입력 시 확인 버튼 클릭
  const handleKeyDown = (e) =>{
    if(e.key === "Enter" && deleteInput === confirmText){
      onConfirm();
    }
  };

  return (
    <div className={`${styles.modal} ${isOpen ? styles.show : ""}`}>
      <div className={styles.modalContent}>
        <Lottie animationData={animationData} loop={true} className={styles.cautionAnimation}  />
        <p className={styles.modalFMessage}>*삭제를 원하시면 해당 문구를 동일하게 입력 하세요.</p>
        <p className={styles.modalSMessage}>{confirmText}</p>
        <input className={styles.deleteModal}
               type="text" value={deleteInput} 
               onChange={handleInputChange} 
               onKeyDown={handleKeyDown}
               placeholder={confirmText}/>
        <div className={styles.modalButtons}>
          <button onClick={onConfirm}
                  disabled={deleteInput !== confirmText}
                  className={styles.mConfirmBtn}>
                  확인
          </button>
          <button onClick={() => {
                  onClose();}} 
                  className={styles.mCancelBtn}>
                  취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

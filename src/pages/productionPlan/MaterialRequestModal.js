import React, { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Plus } from "lucide-react";
import styles from "../../styles/productionPlan/MaterialRequestModal.module.css";

const MaterialRequestModal = ({ shortageMaterials, onSave }) => {
  const [materialRequests, setMaterialRequests] = useState([]);
  const [additionalRequests, setAdditionalRequests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const groupedMaterials = shortageMaterials.reduce((acc, material) => {
      const key = material.materialName;
      if (!acc[key]) {
        acc[key] = {...material, totalPlanQty: 0, occurrences: 0};
      }
      acc[key].totalPlanQty += material.planQty;
      acc[key].occurrences += 1;
      return acc;
    }, {});

    const initialRequests = Object.values(groupedMaterials).map((material) => ({
      ...material,
      currentStock: material.currentStock, // 현재 재고는 그대로 유지
      requestQty: Math.max(0, material.totalPlanQty - material.currentStock),
    }));
    setMaterialRequests(initialRequests);
  }, [shortageMaterials]);

  const updateMaterialRequest = (index, updates) => {
    const newRequests = [...materialRequests];
    newRequests[index] = { ...newRequests[index], ...updates };
    setMaterialRequests(newRequests);
  };

  const removeMaterialRequest = (index) => {
    const newRequests = materialRequests.filter((_, i) => i !== index);
    setMaterialRequests(newRequests);
  };

  const addMaterialRequest = () => {
    setAdditionalRequests([...additionalRequests, {
      materialName: "",
      requestQty: 0,
    }]);
  };

  const updateAdditionalRequest = (index, updates) => {
    const newRequests = [...additionalRequests];
    newRequests[index] = { ...newRequests[index], ...updates };
    setAdditionalRequests(newRequests);
  };

  const removeAdditionalRequest = (index) => {
    const newRequests = additionalRequests.filter((_, i) => i !== index);
    setAdditionalRequests(newRequests);
  };

  const handleSave = () => {
    onSave({
      materials: [...materialRequests, ...additionalRequests],
      deliveryDate,
      reason,
      note
    });
    setIsOpen(false);
  };

  const formatNumber = (num) => {
    if (Number.isInteger(num)) {
      return num.toString();
    }
    const roundedNum = Math.round(num * 10000) / 10000;
    return roundedNum.toString();
  };

  return (
    <div>
      <button className={styles.openModalBtn} onClick={() => setIsOpen(true)}>
        <ShoppingCart size={18} />
        부족자재 구매신청
      </button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>자재 구매 신청</h2>

            {/* 부족자재 현황 */}
            <div className={styles.section}>
              <h3>부족자재 현황</h3>
              <table className={styles.materialTable}>
                <thead>
                  <tr>
                    <th>자재명</th>
                    <th>현재 재고</th>
                    <th>계획 소요량</th>
                    <th>부족량</th>
                    <th>신청 수량</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {materialRequests.map((material, index) => (
                    <tr key={index}>
                      <td>{material.materialName}</td>
                      <td>{formatNumber(material.currentStock)}</td>
                      <td>{formatNumber(material.totalPlanQty)}</td>
                      <td>{formatNumber(Math.max(0, material.totalPlanQty - material.currentStock))}</td>
                      <td>
                        <input
                          type="number"
                          value={material.requestQty}
                          onChange={(e) => updateMaterialRequest(index, { requestQty: Number(e.target.value) })}
                        />
                      </td>
                      <td>
                        <button onClick={() => removeMaterialRequest(index)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 추가 자재 신청 */}
            <div className={styles.section}>
              <h3>추가 자재 신청</h3>
              <button onClick={addMaterialRequest} className={styles.addButton}>
                <Plus size={18} /> 자재 추가
              </button>
              <table className={styles.materialTable}>
                <thead>
                  <tr>
                    <th>자재명</th>
                    <th>신청 수량</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {additionalRequests.map((material, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={material.materialName}
                          onChange={(e) => updateAdditionalRequest(index, { materialName: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={material.requestQty}
                          onChange={(e) => updateAdditionalRequest(index, { requestQty: Number(e.target.value) })}
                        />
                      </td>
                      <td>
                        <button onClick={() => removeAdditionalRequest(index)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 신청 정보 */}
            <div className={styles.section}>
              <h3>신청 정보</h3>
              <div className={styles.formGroup}>
                <label>납기요청일</label>
                <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>신청사유</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)}>
                  <option value="">선택하세요</option>
                  <option value="생산계획에 따른 자재부족">생산계획에 따른 자재부족</option>
                  <option value="안전재고 확보">안전재고 확보</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>특이사항</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setIsOpen(false)}>
                닫기
              </button>
              <button className={styles.saveBtn} onClick={handleSave}>
                구매 신청
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequestModal;
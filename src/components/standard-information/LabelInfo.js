import React, { useState, useRef, useEffect } from "react";
import Modal from "react-modal"; // 모달 라이브러리 추가
import {
  fetchLabelInfo,
  createLabelInfo,
  fetchLabelInfoId,
  deleteLabelInfo,
} from "../../apis/standard-information/LabelInfoApi";
import labelInfos from "../../styles/standard-information/labelInfo.module.css";
import beerImage1 from "./images/2.png"; // 아이유 맥주
import beerImage2 from "./images/3.png"; // 카리나 맥주
import beerImage3 from "./images/1.png"; // 장원영 맥주
import beerImage3_1 from "./images/1-1.png"; // 장원영 병
import beerImage1_1 from "./images/2-1.png"; // 아이유 병
import beerImage2_1 from "./images/3-1.png"; // 카리나 병
import SuccessAnimation from "../../lottie/SuccessNotification"; // 성공 애니메이션 import

Modal.setAppElement("#root"); // 모달 접근성 설정

function LabelInfoCard({ item, handleDetailModalOpen }) {
  return (
    <div
      className={labelInfos.card}
      onClick={() => handleDetailModalOpen(item.labelId)}
    >
      <img
        src={item.beerImage}
        alt="라벨 이미지"
        loading="lazy"
        className={labelInfos.cardImage}
      />
      <div className={labelInfos.cardFooter}>
        <p>배치번호: {item.labelId}</p>
        <p>제품명: {item.productName}</p>
        <p>생산일자: {new Date(item.productionDate).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

function LabelInfo() {
  const [labelInfo, setLabelInfo] = useState([]); // 라벨 정보
  const [showModal, setShowModal] = useState(false); // 등록 모달 상태
  const [showDetailModal, setShowDetailModal] = useState(false); // 상세조회 모달 상태
  const [beerType, setBeerType] = useState(""); // 맥주 종류
  const [productionDate, setProductionDate] = useState(""); // 생산일자
  const [supplier, setSupplier] = useState(""); // 납품업체
  const [selectedLabel, setSelectedLabel] = useState({}); // 선택된 라벨 정보
  const canvasRef = useRef(null); // 캔버스 참조
  const [isSuccessModal, setIsSuccessModal] = useState(false); // 성공 모달 상태
  const [modalMessage, setModalMessage] = useState(''); // 성공 메시지 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [error, setError] = useState("");

  const closeSuccessModal = () => {
    setIsSuccessModal(false);
    setModalMessage('');
  };

  const openSuccessModal = (message) => {
    setIsSuccessModal(true);
    setModalMessage(message);
  };

  const beerLabelImages = {
    아이유맥주: beerImage1,
    장원영맥주: beerImage3,
    카리나맥주: beerImage2,
  };

  const beerNames = {
    아이유맥주: "아이유 맥주",
    장원영맥주: "장원영 맥주",
    카리나맥주: "카리나 맥주",
  };

  const alcPercentages = {
    아이유맥주: 4.5,
    장원영맥주: 4.0,
    카리나맥주: 4.0,
  };

  const beerBottleImages = {
    아이유맥주: beerImage1_1,
    장원영맥주: beerImage3_1,
    카리나맥주: beerImage2_1,
  };

  const suppliers = ["호텔델루나", "까멜리아", "단밤", "쌍갑포차"];

  const fetchData = async (search = "") => {
    try {
      const data = await fetchLabelInfo(0, 1000, search); // 페이지네이션 없이 많은 수의 데이터 가져오기

      if (data && data.content) {
        setLabelInfo(data.content);
      } else {
        console.error("Data format error:", data);
        setLabelInfo([]);
      }
    } catch (error) {
      setError("설비 정보를 불러오는데 실패했습니다.")
      setLabelInfo([]);
    }
  };

  useEffect(() => {
    fetchData(searchKeyword);
  }, [searchKeyword]);

  const drawLabel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.src = beerLabelImages[beerType];

    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      ctx.font = "bold 40px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(beerNames[beerType], 111, 520);

      ctx.font = "italic 30px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`500ML`, 160, 560);

      ctx.font = "bold 20px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "#000";
      ctx.fillText(`${alcPercentages[beerType]}%`, 560, 199);

      ctx.font = "bold 20px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "#000";
      ctx.fillText(beerNames[beerType], 530, 89);
      ctx.fillText(`500ml`, 510, 238);
      ctx.fillText(`${productionDate}`, 560, 343);
    };
  };

  useEffect(() => {
    if (beerType && canvasRef.current) {
      drawLabel();
    }
  }, [beerType, productionDate]);

  const handleModalClose = () => {
    setShowModal(false);
    setBeerType("");
    setProductionDate("");
    setSupplier("");
  };

  const handleDetailModalOpen = async (labelId) => {
    try {
      const labelInfo = await fetchLabelInfoId(labelId);
      setSelectedLabel(labelInfo);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching label details:", error);
      alert("라벨 상세 정보를 가져오는 데 실패했습니다.");
    }
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedLabel({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!beerType || !productionDate || !supplier) {
      return;
    }

    const formData = new FormData();
    const productIdMap = {
      아이유맥주: "I001",
      장원영맥주: "J001",
      카리나맥주: "K001",
    };

    const labelData = {
      productionDate,
      beerSupplier: encodeURIComponent(supplier),
      productId: productIdMap[beerType],
    };

    formData.append("labelData", JSON.stringify(labelData));

    if (canvasRef.current) {
      const labelImage = canvasRef.current.toDataURL("image/png");
      const byteCharacters = atob(labelImage.split(",")[1]);
      const byteArray = new Uint8Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([byteArray], { type: "image/png" });

      formData.append("labelImage", blob, "labelImage.png");
    }

    const bottleBlob = await fetch(beerBottleImages[beerType])
      .then((res) => res.blob())
      .catch((err) => {
        alert("병 이미지를 등록할 수 없습니다.");
        return null;
      });

    if (bottleBlob) {
      formData.append("beerImage", bottleBlob, "beerImage.png");
    }

    try {
      await createLabelInfo(formData);
      openSuccessModal("라벨이 성공적으로 등록되었습니다!");
      handleModalClose();
      fetchData(searchKeyword);
    } catch (error) {
      console.error("라벨 등록 실패:", error);
    }
  };

  const handleDeleteLabel = async () => {
    try {
      await deleteLabelInfo(selectedLabel.labelId);
      openSuccessModal("라벨이 성공적으로 삭제되었습니다!");
      fetchData(searchKeyword);
      setShowDetailModal(false);
    } catch (error) {
      console.error("라벨 삭제 실패:", error);
    }
  };

  const handleSearchClick = () => {
    fetchData(searchKeyword);
  };

  return (
    <div className={labelInfos.pageContainer}>
      <div className={labelInfos.mainContainer}>
        <div className={labelInfos.titleBar}>
          <h1 className={labelInfos.pageTitle}>라벨 정보</h1>
          <div className={labelInfos.searchArea}>
            <button
              className={labelInfos.createButton}
              onClick={() => setShowModal(true)}
            >
              라벨등록
            </button>
            <input
              type="text"
              placeholder="맥주명을 입력하세요..."
              className={labelInfos.searchInput}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button className={labelInfos.searchButton} onClick={handleSearchClick}>
              검색
            </button>
          </div>
        </div>

        {/* 카드 컨테이너 */}
        <div className={labelInfos.cardContainer}>
  {error ? (
      <p className={labelInfos.errorMessage}>{error}</p>
  ) : Array.isArray(labelInfo) && labelInfo.length === 0 ? (
      <p className={labelInfos.noText}>라벨정보가 없습니다.</p>
  ) : (
    Array.isArray(labelInfo) && labelInfo.map((item) => (
      <LabelInfoCard 
        key={item.labelId} 
        item={item} 
        handleDetailModalOpen={handleDetailModalOpen} 
      />
    ))
  )}
</div>

      </div>

      {/* 상세조회 모달 */}
      <Modal
        isOpen={showDetailModal}
        onRequestClose={handleDetailModalClose}
        className={labelInfos.detailModalContent}
        overlayClassName={labelInfos.detailModalOverlay}
      >
        <button
          type="button"
          onClick={handleDetailModalClose}
          className={labelInfos.closeButton}
        >
          x
        </button>
        <h2>라벨 상세 정보</h2>
        <div>
          <img src={selectedLabel.labelImage} loading="lazy" alt="병 이미지" />
          <p>
            <strong>배치번호 :</strong> {selectedLabel.labelId}
          </p>
          <p>
            <strong>제품명 :</strong> {selectedLabel.productName}
          </p>
          <p>
            <strong>용량 :</strong> {selectedLabel.sizeSpec}
          </p>
          <p>
            <strong>알코올도수 :</strong> {selectedLabel.alcPercent}%
          </p>
          <p>
            <strong>생산일자 :</strong>{" "}
            {new Date(selectedLabel.productionDate).toLocaleDateString()}
          </p>
          <p>
            <strong>납품업체 :</strong> {selectedLabel.beerSupplier}
          </p>
        </div>
        <button className={labelInfos.delete} onClick={handleDeleteLabel}>
          삭제
        </button>
      </Modal>

      {/* 라벨 등록 모달 */}
      <Modal
        isOpen={showModal}
        onRequestClose={handleModalClose}
        className={labelInfos.modalContent}
        overlayClassName={labelInfos.modalOverlay}
      >
        <button
          type="button"
          onClick={handleModalClose}
          className={labelInfos.closeButton}
        >
          x
        </button>
        <h2 className={labelInfos.modalTitle}>라벨 등록</h2>

        <div className={labelInfos.modalLayout}>
          <div className={labelInfos.formContainer}>
            <form onSubmit={handleSubmit}>
              <div className={labelInfos.formGroup}>
                <label>맥주 종류:</label>
                <select
                  value={beerType}
                  onChange={(e) => setBeerType(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    선택하세요
                  </option>
                  <option value="아이유맥주">아이유맥주</option>
                  <option value="장원영맥주">장원영맥주</option>
                  <option value="카리나맥주">카리나맥주</option>
                </select>
              </div>

              <div className={labelInfos.formGroup}>
                <label>생산일자:</label>
                <input
                  type="date"
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  required
                />
              </div>

              <div className={labelInfos.formGroup}>
                <label>납품업체:</label>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    선택하세요
                  </option>
                  {suppliers.map((supplierName, index) => (
                    <option key={index} value={supplierName}>
                      {supplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={labelInfos.formActions}>
                <button type="submit" className={labelInfos.createButton1}>
                  등록
                </button>
              </div>
            </form>
          </div>

          <div className={labelInfos.previewContainer}>
            {beerType && (
              <div className={labelInfos.canvasContainer}>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                ></canvas>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* 성공 모달 */}
      <Modal
        isOpen={isSuccessModal}
        onRequestClose={closeSuccessModal}
        className={labelInfos.successModal}
        overlayClassName={labelInfos.modalOverlay}
      >
        <div className={labelInfos.successModalContent}>
          <SuccessAnimation />
          <p className={labelInfos.successMessage}>{modalMessage}</p>
          <button className={labelInfos.successCloseButton} onClick={closeSuccessModal}>x</button>
        </div>
      </Modal>
    </div>
  );
}

export default LabelInfo;
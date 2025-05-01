import React, { useState } from "react";
import BoardsCreate from "../../styles/board/boardCreate.module.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { createBoard } from "../../apis/boardApi/BoardApi";
import { useNavigate } from "react-router-dom";
import SuccessAnimation from "../../lottie/SuccessNotification";
import WarningAnimation from "../../lottie/WarningNotification";
import Modal from 'react-modal';
import { useAuth } from "../../contexts/AuthContext"; // 추가: AuthContext 가져오기

function BoardCreate() {
    const navigate = useNavigate();
    const { currentUser } = useAuth(); // 추가: 현재 로그인한 사용자 정보
    const [formData, setFormData] = useState({
        category: "일반",
        title: "",
        content: "",
        file: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSuccessModal, setIsSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isWarningModal, setIsWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    // 카테고리 옵션 - 관리자만 '공지' 카테고리 선택 가능
    const categoryOptions = [
        { value: "일반", label: "일반" },
        { value: "중요", label: "중요" },
        ...(currentUser?.role === 'ADMIN' ? [{ value: "공지", label: "공지" }] : [])
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    // 글쓰기
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!formData.title || !formData.content) {
                throw new Error("제목과 내용은 필수 입력 항목입니다.");
            }

            // 사용자가 로그인하지 않은 경우
            if (!currentUser) {
                throw new Error("로그인이 필요합니다.");
            }

            // 가상 사용자 ID를 EMPLOYEE 테이블 ID로 매핑
            let empId = currentUser.id;
            if (currentUser.id === 'admin') empId = 'admin';
            else if (currentUser.id === 'plan') empId = 'plan';
            else if (currentUser.id === 'work') empId = 'work';
            else if (currentUser.id === 'EMP001') empId = 'EMP001';
            else if (currentUser.id === 'iu') empId = 'iu';

            const apiFormData = new FormData();
            apiFormData.append("boardData", JSON.stringify({
                boardTitle: encodeURIComponent(formData.title),
                empId: empId, // 매핑된 EMPLOYEE ID 사용
                boardContents: encodeURIComponent(formData.content),
                boardCategory: encodeURIComponent(formData.category)
            }));

            if (formData.file) {
                apiFormData.append("file", formData.file);
            }

            await createBoard(apiFormData);
            setModalMessage("게시글이 성공적으로 등록되었습니다!");
            setIsSuccessModal(true);

        } catch (error) {
            if (error.message === "제목과 내용은 필수 입력 항목입니다.") {
                setWarningMessage("제목과 내용을 입력해 주세요.");
                setIsWarningModal(true);
            } else if (error.message === "로그인이 필요합니다.") {
                setWarningMessage("로그인 후 이용해 주세요.");
                setIsWarningModal(true);
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsSuccessModal(false);
        navigate("/board");
    };

    const closeWarningModal = () => {
        setIsWarningModal(false);
    };

    return (
        <div className={BoardsCreate.mainBar}>
            <div className={BoardsCreate.formWrapper}>
                {error && <div className={BoardsCreate.error}>{error}</div>}

                <div className={BoardsCreate.inputGroup}>
                    <label>카테고리</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                    >
                        {categoryOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={BoardsCreate.inputGroup}>
                    <label>제목</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="제목을 입력하세요"
                        value={formData.title}
                        onChange={handleInputChange}
                    />
                </div>
                <div className={BoardsCreate.inputGroup}>
                    <label>작성자</label>
                    <input
                        type="text"
                        name="author"
                        value={currentUser?.name || ''}
                        disabled
                        className={BoardsCreate.disabledInput}
                    />
                </div>
                <div className={BoardsCreate.inputGroup}>
                    <label>첨부파일</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                    />
                </div>
                <div className={BoardsCreate.inputGroup}>
                    <label>내용</label>
                    <ReactQuill
                        value={formData.content}
                        onChange={handleEditorChange}
                        placeholder="내용을 입력하세요..."
                        style={{ height: "400px", marginBottom: "50px" }}
                    />
                </div>

                <div className={BoardsCreate.submitButton}>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{ opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? "등록 중..." : "작성하기"}
                    </button>
                </div>
            </div>

            {/* 성공 모달 */}
            {isSuccessModal && (
                <Modal
                    isOpen={isSuccessModal}
                    onRequestClose={closeModal}
                    className={BoardsCreate.successModal}
                    overlayClassName="successModalOverlay"
                >
                    <div className={BoardsCreate.successModalHeader}>
                        <button className={BoardsCreate.successCloseButton} onClick={closeModal}>x</button>
                    </div>
                    <div className={BoardsCreate.successModalContent}>
                        <SuccessAnimation />
                        <p className={BoardsCreate.successMessage}>{modalMessage}</p>
                    </div>
                </Modal>
            )}

            {/* 경고 모달 */}
            {isWarningModal && (
                <Modal
                    isOpen={isWarningModal}
                    onRequestClose={closeWarningModal}
                    className={BoardsCreate.warningModal}
                    overlayClassName="warningModalOverlay"
                >
                    <div className={BoardsCreate.warningModalHeader}>
                        <button className={BoardsCreate.warningCloseButton} onClick={closeWarningModal}>x</button>
                    </div>
                    <div className={BoardsCreate.warningModalContent}>
                        <WarningAnimation />
                        <p className={BoardsCreate.warningMessage}>{warningMessage}</p>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default BoardCreate;
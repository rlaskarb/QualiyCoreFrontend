import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBoardByCode, updateBoard, deleteBoard } from "../../apis/boardApi/BoardApi";
import BoardsDetail from "../../styles/board/boardDetail.module.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import SuccessAnimation from "../../lottie/SuccessNotification";
import WarningAnimation from "../../lottie/WarningNotification";
import Modal from 'react-modal';
import { useAuth } from "../../contexts/AuthContext";

function BoardDetail() {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedBoard, setEditedBoard] = useState(null);
    const [isSuccessModal, setIsSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isWarningModal, setIsWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    // 게시글 상세 조회
    useEffect(() => {
        const getBoardDetail = async () => {
            try {
                const boardData = await fetchBoardByCode(boardId);
                setBoard(boardData);
                setEditedBoard(boardData);
            } catch (err) {
                setError("게시글을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        getBoardDetail();
    }, [boardId]);

    // 현재 사용자가 게시글 작성자인지 확인
    const isAuthor = () => {
        if (!currentUser || !board) return false;
        return currentUser.id === board.empId;
    };

    // 수정 모드 활성화
    const handleEdit = () => {
        if (!isAuthor()) {
            setWarningMessage("게시글 작성자만 수정할 수 있습니다.");
            setIsWarningModal(true);
            return;
        }
        setIsEditing(true);
    };

    // 수정 저장
    const handleSave = async () => {
        if (!isAuthor()) {
            setWarningMessage("게시글 작성자만 수정할 수 있습니다.");
            setIsWarningModal(true);
            return;
        }

        try {
            // 카테고리 제한 - 일반 사용자는 '공지'로 변경 불가
            if (editedBoard.boardCategory === "공지" && currentUser?.role !== 'ADMIN') {
                setWarningMessage("공지 카테고리는 관리자만 선택할 수 있습니다.");
                setIsWarningModal(true);
                return;
            }

            await updateBoard(editedBoard);
            setBoard(editedBoard);
            setIsEditing(false);
            setModalMessage("게시글이 성공적으로 수정되었습니다!");
            setIsSuccessModal(true);
        } catch (err) {
            setWarningMessage("게시글 수정에 실패했습니다.");
            setIsWarningModal(true);
        }
    };

    // 게시글 삭제
    const handleDelete = async () => {
        if (!isAuthor()) {
            setWarningMessage("게시글 작성자만 삭제할 수 있습니다.");
            setIsWarningModal(true);
            return;
        }

        try {
            await deleteBoard(boardId);
            setModalMessage("게시글이 성공적으로 삭제되었습니다!");
            setIsSuccessModal(true);
        } catch (err) {
            setWarningMessage("게시글 삭제에 실패했습니다.");
            setIsWarningModal(true);
        }
    };

    // 입력 필드 변경 처리
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedBoard(prev => ({ ...prev, [name]: value }));
    };

    // ReactQuill 내용 변경 처리
    const handleEditorChange = (content) => {
        setEditedBoard(prev => ({ ...prev, boardContents: content }));
    };

    // 파일 다운로드 처리
    const handleFileDownload = async () => {
        if (board.fileName && board.fileUrl) {
            try {
                const response = await fetch(board.fileUrl, {
                    method: 'GET',
                    cache: 'no-cache',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', board.fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                alert('파일 다운로드에 실패했습니다.');
            }
        }
    };

    const closeModal = () => {
        setIsSuccessModal(false);
        navigate("/board");
    };

    const closeWarningModal = () => {
        setIsWarningModal(false);
    };

    // 카테고리 옵션 - 관리자만 '공지' 카테고리 선택 가능
    const categoryOptions = [
        { value: "일반", label: "일반" },
        { value: "중요", label: "중요" },
        ...(currentUser?.role === 'ADMIN' ? [{ value: "공지", label: "공지" }] : [])
    ];

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;
    if (!board) return <div>존재하지 않는 게시글입니다.</div>;

    return (
        <div className={BoardsDetail.container}>
            <div className={BoardsDetail.contentContainer}>
                {/* 페이지 제목 */}
                <div className={BoardsDetail.pageTitle}>
                    {isEditing ? "게시글 수정" : "게시글 상세 조회"}
                </div>

                <table className={BoardsDetail.detailTable}>
                    <tbody>
                        <tr>
                            <th className={BoardsDetail.label}>제목</th>
                            <td className={BoardsDetail.value}>
                                {isEditing ? (
                                    <input
                                        name="boardTitle"
                                        value={editedBoard.boardTitle}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <>{board.boardTitle}
                                        <span className={`${BoardsDetail.categoryTag} ${board.boardCategory === "중요" ? BoardsDetail.important :
                                            board.boardCategory === "공지" ? BoardsDetail.notice :
                                                BoardsDetail.normal}`}>
                                            {board.boardCategory}
                                        </span>
                                    </>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <th className={BoardsDetail.label}>등록일</th>
                            <td className={BoardsDetail.value}>{new Date(board.boardDate).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <th className={BoardsDetail.label}>작성자</th>
                            <td className={BoardsDetail.value}>
                                {board.empName}
                                {/* 첨부파일 영역 */}
                                {board.fileName && board.fileUrl && (
                                    <span className={BoardsDetail.fileLabel}>
                                        {" 첨부파일  "}
                                        <button
                                            onClick={handleFileDownload}
                                            className={BoardsDetail.fileLink}
                                        >
                                            {board.fileName}
                                        </button>
                                    </span>
                                )}
                            </td>
                        </tr>
                        {isEditing && (
                            <tr>
                                <th className={BoardsDetail.label}>카테고리</th>
                                <td className={BoardsDetail.value}>
                                    <select
                                        name="boardCategory"
                                        value={editedBoard.boardCategory}
                                        onChange={handleChange}
                                    >
                                        {categoryOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* 내용 영역 */}
                <div className={BoardsDetail.contentRow}>
                    <span className={BoardsDetail.label1}>내용</span>
                    {isEditing ? (
                        // ReactQuill 에디터 적용
                        <ReactQuill
                            value={editedBoard.boardContents}
                            onChange={handleEditorChange}
                            style={{ height: '280px' }}
                        />
                    ) : (
                        <div
                            className={BoardsDetail.content}
                            dangerouslySetInnerHTML={{ __html: board.boardContents }}
                        />
                    )}
                </div>

                {/* 버튼 영역 */}
                <div className={BoardsDetail.buttonAll}>
                    {!isEditing ? (
                        <>
                            {/* 목록 버튼 */}
                            <button
                                className={BoardsDetail.backButton}
                                onClick={() => navigate(-1)}
                            >
                                목록
                            </button>

                            {/* 수정 및 삭제 버튼 - 작성자만 표시 */}
                            {isAuthor() && (
                                <div>
                                    {/* 수정 버튼 */}
                                    <button
                                        className={BoardsDetail.updateButton}
                                        onClick={handleEdit}
                                    >
                                        수정
                                    </button>

                                    {/* 삭제 버튼 */}
                                    <button
                                        className={BoardsDetail.deleteButton}
                                        onClick={handleDelete}
                                    >
                                        삭제
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* 저장 버튼 */}
                            <button
                                className={BoardsDetail.saveButton}
                                onClick={handleSave}
                            >
                                저장
                            </button>

                            {/* 취소 버튼 */}
                            <button
                                className={BoardsDetail.removeButton}
                                onClick={() => setIsEditing(false)}
                            >
                                취소
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 성공 모달 */}
            {isSuccessModal && (
                <Modal
                    isOpen={isSuccessModal}
                    onRequestClose={closeModal}
                    className={BoardsDetail.successModal}
                    overlayClassName="modal-overlay"
                >
                    <div className={BoardsDetail.successModalHeader}>
                        <button className={BoardsDetail.successCloseButton} onClick={closeModal}>x</button>
                    </div>
                    <div className={BoardsDetail.successModalContent}>
                        <SuccessAnimation />
                        <p className={BoardsDetail.successMessage}>{modalMessage}</p>
                    </div>
                </Modal>
            )}

            {/* 경고 모달 */}
            {isWarningModal && (
                <Modal
                    isOpen={isWarningModal}
                    onRequestClose={closeWarningModal}
                    className={BoardsDetail.warningModal}
                    overlayClassName="warningModalOverlay"
                >
                    <div className={BoardsDetail.warningModalHeader}>
                        <button className={BoardsDetail.warningCloseButton} onClick={closeWarningModal}>x</button>
                    </div>
                    <div className={BoardsDetail.warningModalContent}>
                        <WarningAnimation />
                        <p className={BoardsDetail.warningMessage}>{warningMessage}</p>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default BoardDetail;
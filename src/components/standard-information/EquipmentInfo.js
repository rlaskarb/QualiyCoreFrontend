import React, { useEffect, useState } from "react";
import Equipment from "../../styles/standard-information/Equipment.module.css";
import { fetchAllEquipment, fetchEquipmentById, createEquipment, deleteEquipment, updateEquipment } from "../../apis/standard-information/EquipmentApi";
import Modal from "react-modal";
import { fetchWorkplaces } from "../../apis/standard-information/WorkplaceApi";  // 작업장 API import
import SuccessAnimation from "../../lottie/SuccessNotification";
import WarningAnimation from "../../lottie/WarningNotification";
import Pagination from "../../Pagination/Pagination";

Modal.setAppElement("#root");

function EquipmentInfo() {
    const [equipmentList, setEquipmentList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [newEquipment, setNewEquipment] = useState({
        equipmentId: "",
        workplaceId: "",  // workplaceId만 저장
        equipmentName: "",
        modelName: "",
        manufacturer: "",
        installDate: "",
        equipmentStatus: "",
        equipmentEtc: "",
        equipmentImage: null,
    });
    const [workplaces, setWorkplaces] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false); // 수정 모드 상태 추가
    const [isSuccessModal, setIsSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [pageInfo, setPageInfo] = useState({
        page: 0, totalPages: 1, first: true, last: true
    });
    const [searchType, setSearchType] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isWarningModal, setIsWarningModal] = useState(false); // 경고 모달 상태
    const [warningMessage, setWarningMessage] = useState(''); // 경고 메시지 상태
    const [error, setError] = useState("");

    // 설비 전체조회
    const fetchData = async (page = 0, searchType = '', searchKeyword = '') => {
        try {
            const { content, pageInfo: fetchedPageInfo } = await fetchAllEquipment(
                page,
                20,
                searchType,
                searchKeyword
            );
            setEquipmentList(content || []);
            setPageInfo((prevPageInfo) => ({
                ...prevPageInfo,
                ...fetchedPageInfo,
            }));
        } catch (error) {
            setError("설비 정보를 가져오는데 실패했습니다.");
        }
    };

    const fetchWorkplaceData = async () => {
        try {
            const workplaceData = await fetchWorkplaces(); // 작업장 데이터 가져오기
            setWorkplaces(workplaceData); // 작업장 데이터 설정
        } catch (error) {
            console.error('Error loading workplace data:', error);
        }
    };

    // 최초 로딩 시 데이터를 한 번만 가져오도록 함
    useEffect(() => {
        fetchWorkplaceData(); // 작업장 데이터 한 번만 불러오기
        fetchData(0); // 첫 번째 페이지 데이터 한 번만 불러오기
    }, []); // 빈 배열로 최초 한번만 호출

    // 페이지 변경 핸들러
    const handlePageChange = async (newPage) => {
        // 페이지가 변경되었을 때만 데이터를 새로 로드하도록 함
        if (newPage === pageInfo.page) return; // 현재 페이지와 동일하면 리렌더링 방지

        // 페이지 정보 업데이트 (새로운 페이지를 설정)
        setPageInfo((prevPageInfo) => ({
            ...prevPageInfo,
            page: newPage, // 페이지 번호 갱신
        }));

        // 새로운 페이지에 맞는 데이터 요청
        await fetchData(newPage);  // 페이지 변경에 따라 데이터를 새로 로드
    };

    // 검색 함수
    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
    };

    const handleSearchKeywordChange = (e) => {
        setSearchKeyword(e.target.value);
    };

    const handleSearch = () => {
        fetchData(0, searchType, searchKeyword);
    };

    const openModal = async (equipmentId) => {
        try {
            const equipmentData = await fetchEquipmentById(equipmentId);
            setSelectedEquipment(equipmentData);
            setIsModalOpen(true);
            setIsEditMode(false); // 모달 열 때 수정 모드 초기화
        } catch (error) {
            console.error("Error fetching equipment details:", error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEquipment(null);
        setIsEditMode(false); // 모달 닫을 때 수정 모드 초기화
    };

    // 경고 모달 닫기 함수
    const closeWarningModal = () => {
        setIsWarningModal(false);
        setWarningMessage('');
    };

    const closeRegisterModal = () => {
        setIsRegisterModalOpen(false);
        setNewEquipment({
            equipmentId: "",
            workplaceId: "", // 초기화
            equipmentName: "",
            modelName: "",
            manufacturer: "",
            installDate: "",
            equipmentStatus: "",
            equipmentEtc: "",
            equipmentImage: null,
        });
    };

    // 설비 등록 모달 textarea 변경 이벤트 핸들러
    const handleTextareaChange = (event) => {
        setNewEquipment({
            ...newEquipment,
            equipmentEtc: event.target.value, // 특이사항 업데이트
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEquipment({
            ...newEquipment,
            [name]: value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewEquipment({
                ...newEquipment,
                equipmentImage: file,
            });
        }
    };

    const handleWorkplaceChange = (event) => {
        const selectedWorkplaceId = event.target.value;

        setNewEquipment(prev => ({
            ...prev,
            workplaceId: selectedWorkplaceId
        }));
    };

    // 설비 등록 핸들러
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!newEquipment.workplaceId) {
            setWarningMessage('모든 필드를 입력해 주세요.');
            setIsWarningModal(true);
            return; // 직장이 선택되지 않으면 전송을 중지
        }

        const formData = new FormData();
        const equipmentData = {
            equipmentName: encodeURIComponent(newEquipment.equipmentName),
            modelName: encodeURIComponent(newEquipment.modelName),
            manufacturer: encodeURIComponent(newEquipment.manufacturer),
            installDate: newEquipment.installDate,
            equipmentStatus: encodeURIComponent(newEquipment.equipmentStatus),
            equipmentEtc: encodeURIComponent(newEquipment.equipmentEtc),
            workplaceId: newEquipment.workplaceId // 이 부분이 올바른 ID를 가지고 있는지 확인
        };

        formData.append('equipmentData', JSON.stringify(equipmentData));

        if (newEquipment.equipmentImage) {
            formData.append('equipmentImage', newEquipment.equipmentImage);
        }

        try {
            const response = await createEquipment(formData);

            // 성공적으로 생성되었을 때의 처리
            setModalMessage("설비 등록이 완료되었습니다.");
            setIsSuccessModal(true);

            // 설비 목록 새로고침을 위해 페이지 번호 유지하면서 데이터 요청
            fetchData(pageInfo.page); // 현재 페이지를 기준으로 데이터를 다시 가져옴

            closeRegisterModal();
        } catch (error) {
            console.error("Error creating equipment:", error);
        }
    };


    // 설비수정 핸들러
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedEquipment((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 설비수정
    const handleUpdateSubmit = async (event) => {
        event.preventDefault();

        if (!selectedEquipment.equipmentStatus) {
            alert("상태를 입력해 주세요.");
            return;
        }

        const equipmentData = {
            equipmentId: selectedEquipment.equipmentId,
            equipmentStatus: selectedEquipment.equipmentStatus,
            equipmentEtc: selectedEquipment.equipmentEtc,
        };

        try {
            await updateEquipment(equipmentData); // API 호출
            setModalMessage("설비 수정이 완료되었습니다.");
            setIsSuccessModal(true);  // 성공 모달 열기

            // 수정 후 목록 갱신
            const updatedList = equipmentList.map(equipment =>
                equipment.equipmentId === selectedEquipment.equipmentId
                    ? { ...equipment, ...selectedEquipment }
                    : equipment
            );
            setEquipmentList(updatedList);

            // 상세조회 모달 닫기
            closeModal(); // 상세조회 모달 바로 닫기

        } catch (error) {
            console.error("Error updating equipment:", error);
        }
    };


    // 설비삭제 핸들러
    const handleDelete = async (equipmentId) => {
        try {
            // 삭제 API 호출
            const data = await deleteEquipment(equipmentId);

            // 삭제된 설비 목록에서 제거
            setEquipmentList(prevEquipmentList =>
                prevEquipmentList.filter(equipment => equipment.equipmentId !== equipmentId)
            );
            setModalMessage("설비 정보가 삭제되었습니다.");
            setIsSuccessModal(true);
            // 모달 닫기
            closeModal();
        } catch (error) {
            console.error('Error deleting equipment:', error);
        }
    };

    // 수정 버튼 클릭 시 수정 모드로 전환
    const handleEditClick = () => {
        setIsEditMode(true);
    };

    const closeSuccessModal = () => {
        setIsSuccessModal(false);
        closeModal(); // 성공 모달 닫으면 상세 정보 모달도 닫기
        closeRegisterModal(); // 성공 모달 닫으면 등록 모달도 닫기
    };


    return (
        <div>
            <div className={Equipment.titleBar}>
                <button className={Equipment.createButton} onClick={() => setIsRegisterModalOpen(true)}>설비등록</button>
                <select
                    value={searchType}
                    onChange={handleSearchTypeChange}
                    className={Equipment.createSelect}
                >
                    <option value="" disabled>선택</option>
                    <option value="workplaceName">작업장</option>
                    <option value="workplaceType">공정</option>
                    <option value="equipmentName">설비명</option>
                </select>
                <input
                    type="text"
                    value={searchKeyword}
                    onChange={handleSearchKeywordChange}
                    className={Equipment.searchBarInput}
                    placeholder="검색어를 입력하세요.."
                />
                <button className={Equipment.searchButton} onClick={handleSearch}>검색</button>
            </div>
            <div className={Equipment.mainBar}>
            {error ? (
        <p>{error}</p>
    ) : Array.isArray(equipmentList) && equipmentList.length === 0 ? (
        <p className={Equipment.noText}>설비정보가 없습니다.</p>
    ) : (
        <table className={Equipment.equipmentTable}>
            <thead>
                <tr>
                    <th>작업장</th>
                    <th>공정</th>
                    <th>설비</th>
                    <th>모델명</th>
                    <th>제조사</th>
                    <th>상태</th>
                    <th>설치일</th>
                </tr>
            </thead>
            <tbody>
                {Array.isArray(equipmentList) && equipmentList.map((equipment) => (
                    <tr
                        key={equipment.equipmentId}
                        onClick={() => openModal(equipment.equipmentId)}
                        className={Equipment.equipmentRow}
                    >
                        <td>{equipment.workplaceName}</td>
                        <td>{equipment.workplaceType}</td>
                        <td>{equipment.equipmentName}</td>
                        <td>{equipment.modelName}</td>
                        <td>{equipment.manufacturer}</td>
                        <td>{equipment.equipmentStatus}</td>
                        <td>{equipment.installDate}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )}
                {/* 페이지네이션 */}
                <div style={{ position: "fixed", bottom: "80px", left: "58%", transform: "translateX(-50%)" }}>
                    <Pagination
                        page={pageInfo.page}
                        totalPages={pageInfo.totalPages}
                        first={pageInfo.first}
                        last={pageInfo.last}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            {/* 상세조회 모달 */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                className={Equipment.modal}
                overlayClassName={Equipment.modalOverlay}
            >
                <div className={Equipment.modalHeader}>
                    <button onClick={closeModal} className={Equipment.closeButton}>x</button>
                </div>
                {selectedEquipment && (
                    <div className={Equipment.modalContent}>
                        <h1>설비 상세정보</h1>
                        <div className={Equipment.titleContainer}>
                            <div className={Equipment.imageContainer}>
                                {selectedEquipment.equipmentImage ? (
                                    <img
                                        src={selectedEquipment.equipmentImage}
                                        alt="설비 이미지"
                                        className={Equipment.equipmentImage}
                                    />
                                ) : (
                                    <p>이미지가 없습니다.</p>
                                )}
                            </div>
                            <table className={Equipment.leftTable}>
                                <tbody>
                                    <tr>
                                        <td className={Equipment.detailLabel}>설비명</td>
                                        <td className={Equipment.detailValue}>{selectedEquipment.equipmentName}</td>
                                    </tr>
                                    <tr>
                                        <td className={Equipment.detailLabel}>모델명</td>
                                        <td className={Equipment.detailValue}>{selectedEquipment.modelName}</td>
                                    </tr>
                                    <tr>
                                        <th className={Equipment.detailLabel}>제조사</th>
                                        <td className={Equipment.detailValue}>{selectedEquipment.manufacturer}</td>
                                    </tr>
                                    <tr>
                                        <th className={Equipment.detailLabel}>설치일</th>
                                        <td className={Equipment.detailValue}>{selectedEquipment.installDate}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={Equipment.tableContainer}>
                            <table className={Equipment.centerTable}>
                                <tbody>
                                    <tr>
                                        <td className={Equipment.detailLabel}>작업장</td>
                                        <td className={Equipment.detailLabel}>공정</td>
                                        <th className={Equipment.detailLabel}>상태</th>
                                    </tr>
                                    <tr>
                                        <td className={Equipment.detailValue}>{selectedEquipment.workplaceName}</td>
                                        <td className={Equipment.detailValue}>{selectedEquipment.workplaceType}</td>
                                        <td>
                                            {isEditMode ? (
                                                <select
                                                    name="equipmentStatus"
                                                    value={selectedEquipment.equipmentStatus || ''}
                                                    onChange={handleEditInputChange}
                                                    className={Equipment.editSelect}
                                                >
                                                    <option value="정상">정상</option>
                                                    <option value="수리중">수리중</option>
                                                    <option value="고장">고장</option>
                                                </select>
                                            ) : (
                                                <div className={Equipment.detailValue}>{selectedEquipment.equipmentStatus}</div>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={Equipment.textareaContainer}>
                            <div className={Equipment.detailLabelText}>특이사항</div>
                            <div className={Equipment.textareaRow}>
                                <div className={Equipment.textareaCell}>
                                    {isEditMode ? (
                                        <textarea
                                            className={Equipment.textarea}
                                            name="equipmentEtc"
                                            value={selectedEquipment.equipmentEtc || ''}
                                            onChange={handleEditInputChange}
                                        />
                                    ) : (
                                        <div className={Equipment.detailValue}>{selectedEquipment.equipmentEtc}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={Equipment.buttonLayout}>
                            {isEditMode ? (
                                <button className={Equipment.editButton} onClick={handleUpdateSubmit}>수정 완료</button>
                            ) : (
                                <>
                                    <button className={Equipment.editButton} onClick={handleEditClick}>설비정보 수정</button>
                                    <button className={Equipment.deleteButton} onClick={() => handleDelete(selectedEquipment.equipmentId)}>설비정보 삭제</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isRegisterModalOpen}
                onRequestClose={closeRegisterModal}
                className={Equipment.createModal}
                overlayClassName={Equipment.modalOverlay}
            >
                <div className={Equipment.modalHeader1}>
                    <button onClick={closeRegisterModal} className={Equipment.createCloseButton}>x</button>
                </div>
                <div className={Equipment.createModalContent}>
                    <h1>설비 등록</h1>

                    <form onSubmit={handleSubmit}>
                        <div className={Equipment.createInputContainer}>
                            <label className={Equipment.createInputLabel}>작업장</label>
                            <select
                                name="workplaceId"
                                value={newEquipment.workplaceId}
                                onChange={handleWorkplaceChange}
                                className={Equipment.createInputField}
                            >
                                <option value="">작업장을 선택하세요</option>
                                {workplaces.map(workplace => (
                                    <option key={workplace.workplaceId} value={workplace.workplaceId}>
                                        {workplace.workplaceName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={Equipment.createInputContainer}>
                            <label className={Equipment.createInputLabel}>설비명</label>
                            <input
                                type="text"
                                name="equipmentName"
                                value={newEquipment.equipmentName}
                                onChange={handleInputChange}
                                className={Equipment.createInputField1}
                            />
                        </div>
                        <div className={Equipment.createInputContainer}>
                            <label className={Equipment.createInputLabel}>모델명</label>
                            <input
                                type="text"
                                name="modelName"
                                value={newEquipment.modelName}
                                onChange={handleInputChange}
                                className={Equipment.createInputField2}
                            />
                        </div>
                        <div className={Equipment.createInputContainer}>
                            <label className={Equipment.createInputLabel}>제조사</label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={newEquipment.manufacturer}
                                onChange={handleInputChange}
                                className={Equipment.createInputField3}
                            />
                        </div>
                        <div className={Equipment.createInputContainer}>
                            <label className={Equipment.createInputLabel}>설치일</label>
                            <input
                                type="date"
                                name="installDate"
                                value={newEquipment.installDate}
                                onChange={handleInputChange}
                                className={Equipment.createInputField4}
                            />
                        </div>
                        <div className={Equipment.createInputContainer}>
                            <label className={Equipment.createInputLabel}>상태</label>
                            <select
                                name="equipmentStatus"
                                value={newEquipment.equipmentStatus}
                                onChange={handleInputChange}
                                className={Equipment.createInputField5}
                            >
                                <option value="" disabled>상태를 선택하세요</option>
                                <option value="정상">정상</option>
                                <option value="수리중">수리중</option>
                                <option value="고장">고장</option>
                            </select>
                        </div>

                        <div className={Equipment.createInputContainer}>
                            <label className={Equipment.createInputLabel}>특이사항</label>
                            <textarea
                                name="equipmentEtc"
                                value={newEquipment.equipmentEtc}
                                onChange={handleTextareaChange}
                                className={Equipment.createInputField6}
                            />
                        </div>
                        <div className={Equipment.createInputContainer}>
                            <label className={Equipment.createInputLabel}>설비 이미지</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className={Equipment.createInputField7}
                            />
                        </div>
                        <button type="submit" className={Equipment.createButton1}>등록</button>
                    </form>
                </div>
            </Modal>

            <Modal
                isOpen={isSuccessModal}
                onRequestClose={closeSuccessModal}
                className={Equipment.successModal}
                overlayClassName="modal-overlay"
            >
                <div className={Equipment.successModalHeader}>
                    <button className={Equipment.successCloseButton} onClick={closeSuccessModal}>x</button>
                </div>
                <div className={Equipment.successModalContent}>
                    <SuccessAnimation />
                    <p className={Equipment.successMessage}>{modalMessage}</p>
                </div>
            </Modal>

            {isWarningModal && (
                <Modal
                    isOpen={isWarningModal}
                    onRequestClose={closeWarningModal}
                    className={Equipment.warningModal}
                    overlayClassName="modal-overlay"
                >
                    <div className={Equipment.warningModalHeader}>
                        <button className={Equipment.warningCloseButton} onClick={closeWarningModal}>x</button>
                    </div>
                    <div className={Equipment.warningModalContent}>
                        <WarningAnimation />
                        <p className={Equipment.warningMessage}>{warningMessage}</p>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default EquipmentInfo;
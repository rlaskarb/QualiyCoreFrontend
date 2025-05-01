import React, { useState, useEffect } from "react";
import Boards from "../../styles/board/board.module.css";
import { fetchBoards } from "../../apis/boardApi/BoardApi";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../../Pagination/Pagination";
import { useAuth } from "../../contexts/AuthContext";

function Board() {
    const { currentUser } = useAuth();
    const [fixedBoards, setFixedBoards] = useState([]); // 공지 및 중요 게시글
    const [regularBoards, setRegularBoards] = useState([]); // 일반 게시글 (페이지네이션 적용)
    const [paginationInfo, setPaginationInfo] = useState({ page: 0, totalPages: 0, first: true, last: true });
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchType, setSearchType] = useState("title");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshData, setRefreshData] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // 게시글 로드 함수
    const loadBoards = async (page = 0) => {
        try {
            setLoading(true);
            const { content } = await fetchBoards(0, 1000, searchType, searchKeyword); // 모든 게시글을 가져옵니다

            // 공지 및 중요 게시글 분리
            const fixedContent = content.filter(
                (board) => board.boardCategory === "공지" || board.boardCategory === "중요"
            ).sort((a, b) => {
                const categoryOrder = { "공지": 2, "중요": 1 };
                return categoryOrder[b.boardCategory] - categoryOrder[a.boardCategory] ||
                    new Date(b.boardDate) - new Date(a.boardDate); // 최신순 정렬
            });

            // 일반 게시글 분리 및 정렬
            const regularContent = content.filter(
                (board) => board.boardCategory === "일반"
            ).sort((a, b) => new Date(b.boardDate) - new Date(a.boardDate)); // 최신순 정렬

            // 페이지네이션 적용
            const startIndex = page * 12;
            const endIndex = startIndex + 12;
            const paginatedRegularContent = regularContent.slice(startIndex, endIndex);

            setFixedBoards(fixedContent); // 공지 및 중요 게시글 저장
            setRegularBoards(paginatedRegularContent); // 일반 게시글 저장
            setPaginationInfo({
                page: page,
                totalPages: Math.ceil(regularContent.length / 12),
                first: page === 0,
                last: page === Math.ceil(regularContent.length / 12) - 1,
            });
        } catch (err) {
            setError("게시판 데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 로드 시 데이터 가져오기
    useEffect(() => {
        loadBoards();
    }, [location.pathname, refreshData]);

    // 글쓰기 버튼 클릭 핸들러
    const handleWriteClick = () => {
        if (!currentUser) {
            alert("게시글을 작성하려면 로그인이 필요합니다.");
            return;
        }
        navigate("/board-create");
    };

    // 행 클릭 핸들러
    const handleRowClick = (boardId) => {
        navigate(`/board/${boardId}`);
    };

    // 검색 핸들러
    const handleSearch = () => {
        loadBoards(0);
    };

    // 새로고침 데이터 처리
    useEffect(() => {
        if (location.state && location.state.isUpdated) {
            setRefreshData(!refreshData);
        }
    }, [location]);

    return (
        <div className={Boards.boardContainer}>
            <div className={Boards.mainBar}>
                <h1 className={Boards.pageTitle}>전사게시판</h1>

                {/* 검색 및 글쓰기 버튼 */}
                <div className={Boards.headerBar}>
                    <div className={Boards.searchGroup}>
                        <select
                            name="searchType"
                            className={Boards.searchSelect}
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                        >
                            <option value="title">제목</option>
                            <option value="author">작성자</option>
                            <option value="content">내용</option>
                        </select>
                        <input
                            type="text"
                            className={Boards.searchInput}
                            placeholder="검색어를 입력하세요"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                        />
                        <button className={Boards.searchButton} onClick={handleSearch}>검색</button>
                    </div>
                    <div className={Boards.buttonContainer}>
                        <button className={Boards.leftButton} onClick={handleWriteClick}>글쓰기</button>
                    </div>
                </div>

                {/* 게시글 목록 */}
                <div className={Boards.tableContainer}>
                    {error ? (
                        <p>{error}</p>
                    ) : fixedBoards.length === 0 && regularBoards.length === 0 ? (
                        <p className={Boards.noText}>게시글이 없습니다.</p>
                    ) : (
                        <>
                            <table className={Boards.boardTable}>
                                <thead className={Boards.tableHeader}>
                                    <tr>
                                        <th></th>
                                        <th>제목</th>
                                        <th>작성자</th>
                                        <th>작성일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 공지 및 중요 게시글 */}
                                    {fixedBoards.map((board) => (
                                        <tr
                                            key={board.boardId}
                                            className={`${Boards.tableRow} 
                                                ${board.boardCategory === "중요" ? Boards.importantRow : Boards.noticeRow}`}
                                            onClick={() => handleRowClick(board.boardId)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <td>
                                                <span
                                                    className={`${Boards.categoryTag} 
                                                        ${board.boardCategory === "중요" ? Boards.importantTag : Boards.noticeTag}`}
                                                >
                                                    {board.boardCategory}
                                                </span>
                                            </td>
                                            <td>{board.boardTitle}</td>
                                            <td>{board.empName}</td>
                                            <td>{new Date(board.boardDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))}

                                    {/* 일반 게시글 */}
                                    {regularBoards.map((board) => (
                                        <tr
                                            key={board.boardId}
                                            className={Boards.tableRow}
                                            onClick={() => handleRowClick(board.boardId)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <td>
                                                <span className={`${Boards.categoryTag} ${Boards.normalTag}`}>
                                                    {board.boardCategory}
                                                </span>
                                            </td>
                                            <td>{board.boardTitle}</td>
                                            <td>{board.empName}</td>
                                            <td>{new Date(board.boardDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* 페이지네이션 */}
                            <div className={Boards.paginationContainer}>
                                <Pagination
                                    page={paginationInfo.page}
                                    totalPages={paginationInfo.totalPages}
                                    first={paginationInfo.first}
                                    last={paginationInfo.last}
                                    onPageChange={(newPage) => loadBoards(newPage)}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Board;

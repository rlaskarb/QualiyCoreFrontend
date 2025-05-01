import React, { useState, useEffect } from "react";
import boardMain from "../../styles/board/boardMain.module.css"; // 스타일을 임포트
import { fetchBoardsMain } from "../../apis/boardApi/BoardApi"; // fetchBoardsMain 함수를 import
import { useNavigate } from "react-router-dom"; // useNavigate 임포트
import { CircularProgress } from '@mui/material'; // 로딩 컴포넌트 추가

function BoardMain() {
    const [boards, setBoards] = useState([]); // 게시판 데이터 상태 관리
    const [loading, setLoading] = useState(true); // 로딩 상태 관리
    const [error, setError] = useState(""); // 에러 상태 관리

    const navigate = useNavigate(); // 네비게이터 생성

    // 게시판 데이터 불러오기 함수
    const loadBoards = async () => {
        try {
            setLoading(true);
            const { content } = await fetchBoardsMain(0, 5); // API 호출
            
            // 정렬 순서: 공지 > 중요 > 일반 순으로 정렬
            const sortedContent = [...content].sort((a, b) => {
                const categoryOrder = {
                    "공지": 3,
                    "중요": 2,
                    "일반": 1
                };
                
                // 카테고리 기준 내림차순 정렬 (높은 숫자가 먼저)
                return categoryOrder[b.boardCategory] - categoryOrder[a.boardCategory] ||
                       // 같은 카테고리 내에서는 최신순(boardId가 큰 순)으로 정렬
                       b.boardId.localeCompare(a.boardId);
            });
            
            setBoards(sortedContent); // 정렬된 게시글 목록 저장
        } catch (err) {
            setError("게시판 데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트가 마운트될 때 데이터 로드
    useEffect(() => {
        loadBoards();
    }, []);

    // 게시판 제목 클릭 시 이벤트 처리
    const handleTitleClick = () => {
        navigate('/board'); // 게시판 메인 페이지로 이동
    };

    // 게시글 클릭 시 상세 페이지로 이동
    const handleRowClick = (boardId) => {
        navigate(`/board/${boardId}`); // 상세 페이지로 이동
    };

    return (
        <div className={boardMain.boardMainContainer}>
            <div className={boardMain.headerContainer}>
                <h2 className={boardMain.title} onClick={handleTitleClick} style={{ cursor: 'pointer' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#5E4BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 7H17" stroke="#5E4BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 12H17" stroke="#5E4BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 17H13" stroke="#5E4BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    전사게시판
                </h2>
            </div>

            {loading ? (
                <div className={boardMain.loadingContainer}>
                    <CircularProgress style={{ color: "#5E4BFF" }} />
                </div>
            ) : error ? (
                <div className={boardMain.errorContainer}>
                    <p>{error}</p>
                </div>
            ) : (
                <div className={boardMain.contentContainer}>
                    <div className={boardMain.boardTableContainer}>
                        {/* 게시판 목록 테이블 */}
                        <table className={boardMain.boardTable}>
                            <thead className={boardMain.tableHeader}>
                                <tr>
                                    <th></th>
                                    <th>제목</th>
                                    <th>작성자</th>
                                    <th>작성일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {boards.length === 0 ? (
                                    <tr>
                                        <td colSpan="4">게시글이 없습니다.</td>
                                    </tr>
                                ) : (
                                    boards.map((board) => (
                                        <tr
                                        key={board.boardId}
                                        className={`${board.boardCategory === "중요" ? boardMain.importantRow : 
                                                    board.boardCategory === "공지" ? boardMain.noticeRow : ""}`}
                                        onClick={() => handleRowClick(board.boardId)}
                                        style={{ cursor: "pointer" }}
                                    >
                                            {/* 카테고리 태그 */}
                                            <td>
                                                <span
                                                    className={`${board.boardCategory === "중요" ? boardMain.importantTag :
                                                        board.boardCategory === "공지" ? boardMain.noticeTag :
                                                            boardMain.normalTag}`}
                                                >
                                                    {board.boardCategory}
                                                </span>
                                            </td>

                                            {/* 제목 */}
                                            <td>{board.boardTitle}</td>

                                            {/* 글쓴이 */}
                                            <td>{board.empName}</td>

                                            {/* 작성시간 */}
                                            <td>{new Date(board.boardDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BoardMain;
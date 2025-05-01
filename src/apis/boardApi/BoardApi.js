// 가상 사용자 매핑 - Login.js의 mockUsers를 대체할 객체
const mockUserMap = {
  'admin': { id: 'admin', name: '시스템관리자', role: 'ADMIN', department: '정보시스템부' },
  'plan': { id: 'plan', name: '문관리', role: 'PRODUCTION_MANAGER', department: '생산관리부' },
  'work': { id: 'work', name: '김작업', role: 'WORK_MANAGER', department: '작업관리팀' },
  'EMP001': { id: 'EMP001', name: '장사원', role: 'EMPLOYEE', department: '생산1팀' },
  'iu': { id: 'iu', name: '아이유', role: 'EMPLOYEE', department: '생산2팀' },
  // EMPLOYEE 테이블 ID와 가상 사용자 매핑
  'admin': { id: 'admin', name: '시스템관리자', role: 'ADMIN', department: '정보시스템부' },
  'plan': { id: 'plan', name: '문관리', role: 'PRODUCTION_MANAGER', department: '생산관리부' },
  'work': { id: 'work', name: '김작업', role: 'WORK_MANAGER', department: '작업관리팀' },
  'EMP001': { id: 'EMP001', name: '장사원', role: 'EMPLOYEE', department: '생산1팀' },
  'iu': { id: 'iu', name: '아이유', role: 'EMPLOYEE', department: '생산2팀' }
};

// 사용자 ID 매핑 함수 (가상 사용자 ID -> EMPLOYEE 테이블 ID)
const mapUserIdToEmployeeId = (userId) => {
  if (userId === 'admin') return 'admin';
  if (userId === 'plan') return 'plan';
  if (userId === 'work') return 'work';
  if (userId === 'EMP001') return 'EMP001';
  if (userId === 'iu') return 'iu';
  return userId; // 매핑이 없으면 원래 ID 반환
};

// 게시판 전체조회
export const fetchBoards = async (
  page = 0,
  size = 12,
  searchType = '',
  searchKeyword = ''
) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (searchType && searchKeyword) {
      if (searchType === 'title') {
        params.append('searchType', 'boardTitle');
      } else if (searchType === 'author') {
        params.append('searchType', 'empName');
      } else if (searchType === 'content') {
        params.append('searchType', 'boardContents');
      } else {
        params.append('searchType', searchType);
      }
      params.append('searchKeyword', searchKeyword);
    }

    const url = `http://localhost:8080/api/v1/board?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`요청 실패: ${response.statusText}`);
    }

    const data = await response.json();

    if (data?.result?.board?.content && Array.isArray(data.result.board.content)) {
      // 백엔드에서 반환된 데이터에서 사용자 정보 매핑
      const mappedContent = data.result.board.content.map(board => {
        // empId가 가상 사용자 매핑에 있는 경우 가상 사용자 정보로 대체
        if (mockUserMap[board.empId]) {
          return {
            ...board,
            empName: mockUserMap[board.empId].name
          };
        }
        return board;
      });
      
      return {
        content: mappedContent,
        pageInfo: {
          currentPage: data.result.board.number,
          totalPages: data.result.board.totalPages,
          totalElements: data.result.board.totalElements,
          first: data.result.board.first,
          last: data.result.board.last,
          pageSize: data.result.board.size
        }
      };
    } else {
      console.error("잘못된 데이터 형식:", data);
      return { content: [], pageInfo: {} };
    }
  } catch (error) {
    console.error("게시판 조회 오류:", error);
    return { content: [], pageInfo: {} };
  }
};

// 게시판 메인화면
export const fetchBoardsMain = async (page = 0, size = 5) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);

    const url = `http://localhost:8080/api/v1/boardMain?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`요청 실패: ${response.statusText}`);
    }

    const data = await response.json();

    if (data?.result?.board?.content && Array.isArray(data.result.board.content)) {
      // 백엔드에서 반환된 데이터에서 사용자 정보 매핑
      const mappedContent = data.result.board.content.map(board => {
        // empId가 가상 사용자 매핑에 있는 경우 가상 사용자 정보로 대체
        if (mockUserMap[board.empId]) {
          return {
            ...board,
            empName: mockUserMap[board.empId].name
          };
        }
        return board;
      });
      
      return {
        content: mappedContent,
        pageInfo: {
          currentPage: data.result.board.number,
          totalPages: data.result.board.totalPages,
          first: data.result.board.first,
          last: data.result.board.last,
          totalElements: data.result.board.totalElements
        }
      };
    } else {
      console.error("잘못된 데이터 형식:", data);
      return { content: [], pageInfo: {} };
    }
  } catch (error) {
    console.error("메인 화면 게시판 조회 오류:", error);
    return { content: [], pageInfo: {} };
  }
};

// 게시판 상세조회
export const fetchBoardByCode = async (boardId) => {
  try {
    // 'boardId'로 상세 조회 API 호출
    const response = await fetch(`http://localhost:8080/api/v1/board/${boardId}`);

    // 응답 데이터를 JSON으로 변환
    const data = await response.json();

    // 서버에서 반환된 board 데이터 가공
    if (data.result && data.result.board) {
      const board = data.result.board;
      // 사용자 정보 매핑
      if (mockUserMap[board.empId]) {
        return {
          ...board,
          empName: mockUserMap[board.empId].name
        };
      }
      return board;
    }
    
    throw new Error('게시글을 찾을 수 없습니다');
  } catch (error) {
    console.error("게시판 상세 조회 중 오류 발생:", error);
    throw error;
  }
};

// 게시판 등록
export const createBoard = async (formData) => {
  try {
    // formData에서 boardData JSON 문자열 추출
    const boardDataStr = formData.get('boardData');
    if (boardDataStr) {
      // JSON 파싱
      const boardData = JSON.parse(boardDataStr);
      
      // 가상 사용자 ID를 EMPLOYEE ID로 매핑
      if (boardData.empId && mockUserMap[boardData.empId]) {
        // empId를 EMPLOYEE 테이블 ID로 변환
        boardData.empId = mapUserIdToEmployeeId(boardData.empId);
        
        // 변경된 JSON을 다시 FormData에 설정
        formData.set('boardData', JSON.stringify(boardData));
      }
    }

    const response = await fetch('http://localhost:8080/api/v1/board', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP 오류! 상태: ${response.status}, 메시지: ${errorMessage}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("게시글 등록 실패:", error);
    throw new Error("게시글 등록 중 오류가 발생했습니다.");
  }
};

// 게시판 수정
export const updateBoard = async (boardData) => {
  try {
    // 가상 사용자 ID를 EMPLOYEE ID로 매핑
    if (boardData.empId && mockUserMap[boardData.empId]) {
      boardData.empId = mapUserIdToEmployeeId(boardData.empId);
    }

    const response = await fetch('http://localhost:8080/api/v1/board', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(boardData),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP 오류! 상태: ${response.status}, 메시지: ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    console.error("게시글 수정 실패:", error);
    throw new Error("게시글 수정 중 오류가 발생했습니다.");
  }
};

// 게시판 삭제
export const deleteBoard = async (boardId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/v1/board/${boardId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP 오류! 상태: ${response.status}, 메시지: ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    console.error("게시글 삭제 실패:", error);
    throw new Error("게시글 삭제 중 오류가 발생했습니다.");
  }
};
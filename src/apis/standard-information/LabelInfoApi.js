// 라벨 정보 조회
export const fetchLabelInfo = async (page = 0, size = 8, search = '') => {
    try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', size);
        if (search) {
            params.append('search', search);
        }

        const url = `http://localhost:8080/api/v1/labelInfo?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();

        // API 응답에서 라벨 정보와 페이징 정보를 반환
        if (data && data.result && data.result.labelInfo) {
            return {
                content: data.result.labelInfo.content, // 라벨 목록
                pageInfo: {
                    page: data.result.labelInfo.number,
                    totalPages: data.result.labelInfo.totalPages,
                    totalElements: data.result.labelInfo.totalElements,
                    first: data.result.labelInfo.first,
                    last: data.result.labelInfo.last
                }
            };
        } else {
            console.error("Returned label info is not in the expected format:", data.result.labelInfo);
            return { content: [], pageInfo: {} }; // 예상 형식이 아니면 빈 배열과 기본 페이지 정보 반환
        }
    } catch (error) {
        console.error("Error fetching label info:", error);
        return { content: [], pageInfo: {} }; // 오류 발생 시 빈 배열과 기본 페이지 정보 반환
    }
};


// 라벨 상세정보 조회
export const fetchLabelInfoId = async (labelId) => {
    try {
        // labelId를 URL에 포함시켜 API 호출
        const response = await fetch(`http://localhost:8080/api/v1/labelInfo/${labelId}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // 응답 JSON 데이터 받기

        return data.result.labelInfo; // 서버에서 반환된 라벨 정보 데이터 반환
    } catch (error) {
        console.error("Error fetching label info:", error); // 오류 처리
        throw error; // 오류 다시 던짐
    }
};

// 라벨 등록
export const createLabelInfo = async (formData) => {
    try {
        const response = await fetch('http://localhost:8080/api/v1/labelInfo', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`HTTP 오류! 상태: ${response.status}, 메시지: ${errorMessage}`);
        }

        // 서버에서 반환된 데이터 처리
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("라벨 등록 실패:", error);
        throw new Error("라벨 등록 중 오류가 발생했습니다.");
    }
};

// 라벨삭제
export const deleteLabelInfo = async (labelId) => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/labelInfo/${labelId}`, {
            method: 'DELETE',  // DELETE 요청
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // 응답 JSON 데이터 받기

        return data; // 서버에서 반환된 결과 데이터 반환
    } catch (error) {
        console.error("Error deleting label info:", error); // 오류 처리
        throw error; // 오류 다시 던짐
    }
};
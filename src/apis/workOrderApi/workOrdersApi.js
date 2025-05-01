// 작업지시서 전체 조회
export const findAllWorkOrders = async (page = 0, size = 13, workTeam = '', productName = '', lotNo = '', lineNo = '', startDate = '', endDate = '', empId = '') => {
    try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', size);
        if (workTeam) params.append('workTeam', workTeam);
        if (productName) params.append('productName', productName);
        if (lotNo) params.append('lotNo', lotNo);
        if (lineNo) params.append('lineNo', lineNo);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        // 사원 ID 파라미터 추가 (로그인한 사용자의 작업만 필터링)
        if (empId) params.append('empId', empId);

        const url = `http://localhost:8080/api/v1/work?${params.toString()}`;
        console.log("API 요청 URL:", url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('전체 작업지시서 조회 data', data);
        return data.result;
    } catch (error) {
        console.error("Error fetching all work orders:", error);
        throw error;
    }
};

// 작업지시서 상세 조회
export const fetchWorkOrderByLotNo = async (lotNo) => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/work/${lotNo}`);
        const data = await response.json();
        return data.result.work; // 서버에서 반환된 작업지시서 데이터
    } catch (error) {
        console.error("Error fetching work order by lotNo:", error);
        throw error;
    }
};

// 작업지시서 등록
export const createWorkOrder = async (workOrderData) => {
    try {
        const response = await fetch("http://localhost:8080/api/v1/work", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(workOrderData),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error creating work order:", error);
        throw error;
    }
};

// 작업지시서 삭제
export const workOrderDelete = async (lotNo) => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/work/${lotNo}`, {
            method: "DELETE",
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error deleting work order:", error);
        throw error;
    }
};

// 직원 데이터 insert용
export const Employee = async () => {
    try {
        // 직원 조회 API 호출
        const response = await fetch("http://localhost:8080/api/v1/employee");

        // 응답이 성공적인지 확인
        if (!response.ok) {
            throw new Error('직원 조회 실패');
        }

        // 응답 데이터를 JSON으로 변환
        const data = await response.json();

        // 서버에서 반환된 직원 데이터 반환
        return data.data.employee;  // data.result.employee는 API 응답 형식에 맞추어 수정

    } catch (error) {
        console.error("Error fetching all employees:", error);
        throw error; // 에러를 다시 던져서 처리할 수 있도록 함
    }
};

// 맥주레시피 불러오기
export const getBeerRecipes = async () => {
    try {
        // beerRecipes 조회 API 호출
        const response = await fetch("http://localhost:8080/api/v1/beerRecipes");

        // 응답이 성공적인지 확인
        if (!response.ok) {
            throw new Error("맥주 레시피 조회 실패");
        }

        // 응답 데이터를 JSON으로 변환
        const data = await response.json();

        // 서버에서 반환된 beerRecipe 데이터 반환
        return data.result.beerRecipe; // API 응답 형식에 맞춤
    } catch (error) {
        console.error("맥주 레시피 조회 중 오류 발생:", error);
        throw error; // 에러를 다시 던져서 처리할 수 있도록 함
    }
};

// 생산계획 데이터 불러오기
export const getPlanInfo = async () => {
    try {
        const response = await fetch("http://localhost:8080/api/v1/planInfo");

        const data = await response.json();  // response.json() 호출 한 번만!

        if (data?.result?.planInfo && Array.isArray(data.result.planInfo)) {
            return data.result.planInfo;
        } else {
            console.warn("⚠️ 작업 지시서 데이터가 없습니다:", data);
            return [];
        }
    } catch (error) {
        console.error("❌ 작업 지시서 조회 중 오류 발생:", error);
        return []; // 에러 발생 시 빈 배열 반환
    }
};
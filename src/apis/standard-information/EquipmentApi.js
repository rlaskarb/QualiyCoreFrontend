// 설비 전체조회
export const fetchAllEquipment = async (page = 0, size = 14, searchType = '', searchKeyword = '') => {
    try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', size);
        if (searchType && searchKeyword) {
            params.append('searchType', searchType);
            params.append('searchKeyword', searchKeyword);
        }

        const url = `http://localhost:8080/api/v1/equipment?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();

        // API 응답에서 equipment.content 배열을 반환
        if (data && data.result && Array.isArray(data.result.equipment.content)) {
            return {
                content: data.result.equipment.content, // 설비 목록
                pageInfo: {
                    page: data.result.equipment.number,
                    totalPages: data.result.equipment.totalPages,
                    totalElements: data.result.equipment.totalElements,
                    first: data.result.equipment.first,
                    last: data.result.equipment.last
                }
            };
        } else {
            console.error("Returned equipment is not an array:", data.result.equipment.content);
            return { content: [], pageInfo: {} }; // 배열이 아니면 빈 배열과 기본 페이지 정보 반환
        }
    } catch (error) {
        console.error("Error fetching all equipment:", error);
        return { content: [], pageInfo: {} }; // 오류 발생 시 빈 배열과 기본 페이지 정보 반환
    }
};

// 설비 상세조회
export const fetchEquipmentById = async (equipmentId) => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/equipment/${equipmentId}`);
        const data = await response.json();

        return data.result.equipment;  // 서버에서 반환된 설비 상세 데이터
    } catch (error) {
        throw error;
    }
};

// 설비 등록
export const createEquipment = async (formData) => {
    try {
        const response = await fetch('http://localhost:8080/api/v1/equipment', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};

// 설비 수정
export const updateEquipment = async (equipmentData) => {
    try {
        const response = await fetch('http://localhost:8080/api/v1/equipment', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(equipmentData),  // 수정할 설비 데이터
        });
        const data = await response.json();

        return data;  // 서버에서 반환된 데이터
    } catch (error) {
        console.error('Error updating equipment:', error);
        throw error;
    }
};

// 설비 삭제
export const deleteEquipment = async (equipmentId) => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/equipment/${equipmentId}`, {
            method: 'DELETE',
        });
        const data = await response.json();

        return data;  // 서버에서 반환된 데이터
    } catch (error) {
        console.error('Error deleting equipment:', error);
        throw error;
    }
};
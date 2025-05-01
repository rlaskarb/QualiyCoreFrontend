// POST MATURATION FILTRATION API 모듈
const API_BASE = 'http://localhost:8080/postmaturationfiltration';

// 작업지시 ID 목록 조회
export const fetchLineMaterial = async () => {
  try {
    const response = await fetch(`${API_BASE}/linematerial`);
    if (!response.ok) {
      throw new Error(`요청 실패: ${response.statusText}`);
    }
    const data = await response.json();
    return data.result.lineMaterials || [];
  } catch (error) {
    console.error('작업지시 ID 조회 실패:', error);
    throw error;
  }
};

// 숙성 후 여과 공정 등록
export const createPostMaturationFiltration = async (dto) => {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '등록 실패');
    }

    return await response.json();
  } catch (error) {
    console.error('공정 등록 실패:', error);
    throw error;
  }
};

// 탁도 및 종료시간 업데이트
export const updatePostMaturationFiltration = async (mfiltrationId, updateData) => {
  try {
    const response = await fetch(`${API_BASE}/update/${mfiltrationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turbidity: updateData.turbidity,
        actualEndTime: updateData.actualEndTime
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '업데이트 실패');
    }

    return await response.json();
  } catch (error) {
    console.error('탁도 업데이트 실패:', error);
    throw error;
  }
};

const formatDateToISOStringWithoutMs = (date) => {
  return date.toISOString().split(".")[0]; // 밀리초 제거
};

// 공정 상태 업데이트
export const updatePostMaturationFiltrationStatus = async (dto) => {
  try {
    // 날짜 필드가 있다면 변환
    const updatedDto = {
      ...dto,
      actualEndTime: dto.actualEndTime ? formatDateToISOStringWithoutMs(new Date(dto.actualEndTime)) : null,
      expectedEndTime: dto.expectedEndTime ? formatDateToISOStringWithoutMs(new Date(dto.expectedEndTime)) : null
    };

    const response = await fetch(`${API_BASE}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedDto)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '상태 업데이트 실패');
    }

    return await response.json();
  } catch (error) {
    console.error('상태 업데이트 실패:', error);
    throw error;
  }
};

// 추가 필요한 API 함수들
export const postMaturationFiltrationApi = {
  fetchLineMaterial,
  createPostMaturationFiltration,
  updatePostMaturationFiltration,
  updatePostMaturationFiltrationStatus
};

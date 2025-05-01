const API_BASE_URL = "http://localhost:8080/api/v1"; // 백엔드 URL 변경 필요

export async function fetchBeerRanking() {
    try {
        const response = await fetch(`${API_BASE_URL}/beer-podium`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("맥주 랭킹 데이터를 불러오는 중 오류 발생:", error);
        return null;
    }
}

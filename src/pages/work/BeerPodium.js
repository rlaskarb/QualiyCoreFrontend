import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { fetchBeerRanking } from "../../apis/workOrderApi/beerKingApi";
import { CircularProgress } from '@mui/material';
import "./Chart.css";

// Chart.js 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const BeerPodiumDoughnut = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [topBeers, setTopBeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchBeerRanking();
        
        if (data) {
          const sortedData = data.sort((a, b) => b.totalProduction - a.totalProduction);
          
          // Top 3 맥주 저장
          setTopBeers(sortedData.slice(0, 3));
          
          // 지정된 색상 적용
          const beerColors = {
            "카리나 맥주": "#C2CCFF",
            "아이유 맥주": "#F5B169",
            "장원영 맥주": "#F58B78"
          };
          
          setChartData({
            labels: sortedData.map(beer => beer.productName),
            datasets: [
              {
                label: "맥주 생산량 (L)",
                data: sortedData.map(beer => beer.totalProduction),
                backgroundColor: sortedData.map(beer => {
                  const beerName = beer.productName.replace(/\s/g, ""); // 공백 제거 후 비교
                  const matchedColor = Object.keys(beerColors).find(
                    key => key.replace(/\s/g, "") === beerName
                  );
                  return matchedColor ? beerColors[matchedColor] : "#AAAAAA"; // 색상 적용
                }),
                borderColor: "#fff",
                borderWidth: 2,
                hoverOffset: 10,
                hoverBorderWidth: 3,
              },
            ],
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("맥주 랭킹 데이터 불러오는 중 오류 발생:", error);
        setError("데이터를 불러오는 데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 생산량을 포맷팅하는 유틸리티 함수 (천 단위 콤마)
  const formatVolume = (volume) => {
    return volume.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 총 생산량 계산
  const totalProduction = topBeers.reduce((sum, beer) => sum + beer.totalProduction, 0);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2 className="chart-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17.75L5.82799 20.995L7.00699 14.122L2.00699 9.25495L8.90699 8.25495L11.993 2.00195L15.079 8.25495L21.979 9.25495L16.979 14.122L18.158 20.995L12 17.75Z" 
                  stroke="#5687F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          맥주 생산량 랭킹
        </h2>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <CircularProgress size={50} style={{ color: "#5687F2" }} />
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : (
        <div className="chart-content">
          <div className="chart-wrapper">
            <Doughnut
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "60%", // 도넛 차트 유지
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { 
                      font: { size: 12, weight: 'bold' },
                      padding: 15,
                      usePointStyle: true,
                      pointStyle: 'circle',
                      boxWidth: 10,
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#2D3748',
                    bodyColor: '#4A5568',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    padding: 12,
                    boxPadding: 8,
                    borderColor: '#E2E8F0',
                    borderWidth: 1,
                    callbacks: {
                      label: (ctx) => `${ctx.label}: ${formatVolume(ctx.raw)}L`,
                    },
                    boxWidth: 10,
                  },
                },
                animation: {
                  animateScale: true,
                  animateRotate: true,
                  duration: 1000,
                },
              }}
            />
            <div className="chart-emphasis">
              총 생산량<br />
              <strong>{formatVolume(totalProduction)}L</strong>
            </div>
          </div>
      
          <div className="info-panel">
            <h3>🏆 맥주 생산량 Top 3</h3>
            <ul>
              {topBeers.map((beer, index) => (
                <li key={beer.productName}>
                  <div className={`rank-badge rank-badge-${index + 1}`}>
                    {index + 1}
                  </div>
                  <div className="beer-info">
                    <span className="beer-name">
                      <span className="beer-icon">🍺</span>{beer.productName}
                    </span>
                    <span className="beer-volume">
                      생산량: {formatVolume(beer.totalProduction)}L
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeerPodiumDoughnut;
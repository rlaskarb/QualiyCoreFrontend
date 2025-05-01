import React, { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styles from '../../styles/routing/WortVolumeChart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WortVolumeChart = ({ data }) => {
  const chartRef = useRef(null);

  // 차트 크기 조정을 위한 useEffect
  useEffect(() => {
    const resizeChart = () => {
      if (chartRef && chartRef.current) {
        // 차트 인스턴스에 접근하여 resize 메소드 호출
        chartRef.current.resize();
      }
    };

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', resizeChart);
    
    // 컴포넌트가 마운트된 후 약간의 지연 시간을 두고 차트 크기 조정
    const timer = setTimeout(() => {
      resizeChart();
    }, 200);

    // cleanup 함수
    return () => {
      window.removeEventListener('resize', resizeChart);
      clearTimeout(timer);
    };
  }, []);

  const prepareChartData = () => {
    // 기존 코드 유지
    const labels = data.map(item => item.lotNo);
    
    // 효율 데이터 계산
    const efficiencyData = data.map(item => {
      if (item.initialWortVolume && item.currentWortVolume) {
        return (item.currentWortVolume / item.initialWortVolume) * 100;
      }
      return 0;
    });
    
    // 효율 기준으로 배경색 설정
    const backgroundColors = efficiencyData.map(value => {
      if (value >= 95) return 'rgba(72, 187, 120, 0.7)';      // 높음 (녹색)
      if (value >= 90) return 'rgba(246, 173, 85, 0.7)';      // 좋음 (주황색)
      if (value >= 85) return 'rgba(237, 137, 54, 0.7)';      // 중간 (진한 주황색)
      return 'rgba(245, 101, 101, 0.7)';                      // 낮음 (빨간색)
    });
    
    const datasets = [
      {
        label: '초기 워트량',
        data: data.map(item => item.initialWortVolume || 0),
        backgroundColor: 'rgba(66, 153, 225, 0.7)',
        borderColor: 'rgba(49, 130, 206, 1)',
        borderWidth: 1,
      },
      {
        label: '끓임 후 워트량',
        data: data.map(item => item.currentWortVolume || 0),
        backgroundColor: 'rgba(72, 187, 120, 0.7)',
        borderColor: 'rgba(56, 161, 105, 1)',
        borderWidth: 1,
      },
      {
        label: '손실량',
        data: data.map(item => item.lossVolume || 0),
        backgroundColor: 'rgba(237, 100, 166, 0.7)',
        borderColor: 'rgba(213, 63, 140, 1)',
        borderWidth: 1,
      }
    ];
    
    // 효율 데이터셋 추가
    datasets.push({
      label: '효율(%)',
      data: efficiencyData,
      backgroundColor: backgroundColors,
      borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
      borderWidth: 1,
      
      yAxisID: 'y1',
      type: 'bar',
    });

    return { labels, datasets };
  };

  const chartData = prepareChartData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // 높이 명시적으로 설정하지 않음 (CSS에서 처리)
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Noto Sans KR', sans-serif"
          },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'LOT별 끓임 공정 워트량 및 효율 비교',
        font: {
          size: 16,
          family: "'Noto Sans KR', sans-serif",
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        },
        color: '#2B3674'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#2D3748',
        bodyColor: '#4A5568',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label === '효율(%)') {
                label += context.parsed.y.toFixed(2) + '%';
              } else {
                label += context.parsed.y.toFixed(2) + ' L';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '워트량 (L)',
          font: {
            size: 12,
            family: "'Noto Sans KR', sans-serif"
          }
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: '효율 (%)',
          font: {
            size: 12,
            family: "'Noto Sans KR', sans-serif"
          }
        },
        grid: {
          drawOnChartArea: false, // 그리드 중복 방지
        },
        min: 0,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className={styles.chartContainer}>
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default WortVolumeChart;
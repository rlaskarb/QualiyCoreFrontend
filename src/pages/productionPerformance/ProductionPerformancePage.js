import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, ReferenceLine } from 'recharts';
import styles from '../../styles/productionPerformance/ProductionPerformance.module.css';

// 더미 데이터 정의
const DUMMY_DATA = {
  // 월별 생산실적 데이터
  monthlyData: [
    { yearMonth: '2025-01', productName: '아이유 맥주', totalQuantity: 58750, goodQuantity: 55813, qualityRate: 95.0 },
    { yearMonth: '2025-02', productName: '아이유 맥주', totalQuantity: 62500, goodQuantity: 58750, qualityRate: 94.0 },
    { yearMonth: '2025-03', productName: '아이유 맥주', totalQuantity: 53700, goodQuantity: 51552, qualityRate: 96.0 },
    
    { yearMonth: '2025-01', productName: '카리나 맥주', totalQuantity: 51200, goodQuantity: 48128, qualityRate: 94.0 },
    { yearMonth: '2025-02', productName: '카리나 맥주', totalQuantity: 59400, goodQuantity: 55838, qualityRate: 94.0 },
    { yearMonth: '2025-03', productName: '카리나 맥주', totalQuantity: 53400, goodQuantity: 49662, qualityRate: 93.0 },
    
    { yearMonth: '2025-01', productName: '장원영 맥주', totalQuantity: 54600, goodQuantity: 52907, qualityRate: 96.9 },
    { yearMonth: '2025-02', productName: '장원영 맥주', totalQuantity: 61200, goodQuantity: 59976, qualityRate: 98.0 },
    { yearMonth: '2025-03', productName: '장원영 맥주', totalQuantity: 57000, goodQuantity: 55290, qualityRate: 97.0 }
  ],
  
  // 일별 세부 생산실적 데이터 (월별 차트에 사용)
  dailyData: [
    { productionDate: '2025-01-05', productName: '아이유 맥주', totalQuantity: 19200, goodQuantity: 18240, qualityRate: 95.0 },
    { productionDate: '2025-01-15', productName: '아이유 맥주', totalQuantity: 21400, goodQuantity: 20437, qualityRate: 95.5 },
    { productionDate: '2025-01-25', productName: '아이유 맥주', totalQuantity: 18150, goodQuantity: 17136, qualityRate: 94.4 },
    
    { productionDate: '2025-02-05', productName: '아이유 맥주', totalQuantity: 20800, goodQuantity: 19760, qualityRate: 95.0 },
    { productionDate: '2025-02-15', productName: '아이유 맥주', totalQuantity: 22300, goodQuantity: 20847, qualityRate: 93.5 },
    { productionDate: '2025-02-25', productName: '아이유 맥주', totalQuantity: 19400, goodQuantity: 18143, qualityRate: 93.5 },
    
    { productionDate: '2025-03-05', productName: '아이유 맥주', totalQuantity: 23500, goodQuantity: 22560, qualityRate: 96.0 },
    { productionDate: '2025-03-17', productName: '아이유 맥주', totalQuantity: 10000, goodQuantity: 9600, qualityRate: 96.0 },
    { productionDate: '2025-03-25', productName: '아이유 맥주', totalQuantity: 20200, goodQuantity: 19392, qualityRate: 96.0 },
    
    { productionDate: '2025-01-05', productName: '카리나 맥주', totalQuantity: 16800, goodQuantity: 15456, qualityRate: 92.0 },
    { productionDate: '2025-01-15', productName: '카리나 맥주', totalQuantity: 18200, goodQuantity: 15834, qualityRate: 87.0 },
    { productionDate: '2025-01-25', productName: '카리나 맥주', totalQuantity: 16200, goodQuantity: 14838, qualityRate: 91.6 },
    
    { productionDate: '2025-02-05', productName: '카리나 맥주', totalQuantity: 19600, goodQuantity: 18032, qualityRate: 92.0 },
    { productionDate: '2025-02-15', productName: '카리나 맥주', totalQuantity: 20500, goodQuantity: 17425, qualityRate: 85.0 },
    { productionDate: '2025-02-25', productName: '카리나 맥주', totalQuantity: 19300, goodQuantity: 17951, qualityRate: 93.0 },
    
    { productionDate: '2025-03-05', productName: '카리나 맥주', totalQuantity: 21800, goodQuantity: 19184, qualityRate: 88.0 },
    { productionDate: '2025-03-17', productName: '카리나 맥주', totalQuantity: 11000, goodQuantity: 10120, qualityRate: 92.0 },
    { productionDate: '2025-03-25', productName: '카리나 맥주', totalQuantity: 20600, goodQuantity: 19364, qualityRate: 94.0 },
    
    { productionDate: '2025-01-05', productName: '장원영 맥주', totalQuantity: 18500, goodQuantity: 17945, qualityRate: 97.0 },
    { productionDate: '2025-01-15', productName: '장원영 맥주', totalQuantity: 19200, goodQuantity: 18624, qualityRate: 97.0 },
    { productionDate: '2025-01-25', productName: '장원영 맥주', totalQuantity: 16900, goodQuantity: 16338, qualityRate: 96.7 },
    
    { productionDate: '2025-02-05', productName: '장원영 맥주', totalQuantity: 20400, goodQuantity: 19992, qualityRate: 98.0 },
    { productionDate: '2025-02-15', productName: '장원영 맥주', totalQuantity: 21600, goodQuantity: 21168, qualityRate: 98.0 },
    { productionDate: '2025-02-25', productName: '장원영 맥주', totalQuantity: 19200, goodQuantity: 18816, qualityRate: 98.0 },
    
    { productionDate: '2025-03-05', productName: '장원영 맥주', totalQuantity: 23800, goodQuantity: 23086, qualityRate: 97.0 },
    { productionDate: '2025-03-17', productName: '장원영 맥주', totalQuantity: 12000, goodQuantity: 11640, qualityRate: 97.0 },
    { productionDate: '2025-03-25', productName: '장원영 맥주', totalQuantity: 21200, goodQuantity: 20564, qualityRate: 97.0 }
  ],
  
  // 계획 대비 실적 데이터
  planVsActual: [
    { YEAR_MONTH: '2025-01', PRODUCT_NAME: '아이유 맥주', PLANNED_QUANTITY: 60000, ACTUAL_QUANTITY: 58750, ACHIEVEMENT_RATE: 97.9 },
    { YEAR_MONTH: '2025-02', PRODUCT_NAME: '아이유 맥주', PLANNED_QUANTITY: 65000, ACTUAL_QUANTITY: 62500, ACHIEVEMENT_RATE: 96.2 },
    { YEAR_MONTH: '2025-03', PRODUCT_NAME: '아이유 맥주', PLANNED_QUANTITY: 60000, ACTUAL_QUANTITY: 53700, ACHIEVEMENT_RATE: 89.5 },
    
    { YEAR_MONTH: '2025-01', PRODUCT_NAME: '카리나 맥주', PLANNED_QUANTITY: 55000, ACTUAL_QUANTITY: 51200, ACHIEVEMENT_RATE: 93.1 },
    { YEAR_MONTH: '2025-02', PRODUCT_NAME: '카리나 맥주', PLANNED_QUANTITY: 60000, ACTUAL_QUANTITY: 59400, ACHIEVEMENT_RATE: 99.0 },
    { YEAR_MONTH: '2025-03', PRODUCT_NAME: '카리나 맥주', PLANNED_QUANTITY: 57000, ACTUAL_QUANTITY: 53400, ACHIEVEMENT_RATE: 93.7 },
    
    { YEAR_MONTH: '2025-01', PRODUCT_NAME: '장원영 맥주', PLANNED_QUANTITY: 56000, ACTUAL_QUANTITY: 54600, ACHIEVEMENT_RATE: 97.5 },
    { YEAR_MONTH: '2025-02', PRODUCT_NAME: '장원영 맥주', PLANNED_QUANTITY: 63000, ACTUAL_QUANTITY: 61200, ACHIEVEMENT_RATE: 97.1 },
    { YEAR_MONTH: '2025-03', PRODUCT_NAME: '장원영 맥주', PLANNED_QUANTITY: 60000, ACTUAL_QUANTITY: 57000, ACHIEVEMENT_RATE: 95.0 }
  ],
  
  // 불량률 데이터
  qualityData: [
    { productName: '아이유 맥주', qualityRate: 95.0, defectRate: 5.0 },
    { productName: '카리나 맥주', qualityRate: 91.0, defectRate: 9.0 },
    { productName: '장원영 맥주', qualityRate: 97.3, defectRate: 2.7 }
  ],
  
  // 생산 효율성 데이터
  efficiency: [
    { PRODUCT_NAME: '아이유 맥주', TOTAL_QUANTITY: 174950, GOOD_QUANTITY: 166115, QUALITY_RATE: 95.0, AVG_PRODUCTION_TIME_MINUTES: 120, AVG_BATCH_SIZE: 5200 },
    { PRODUCT_NAME: '카리나 맥주', TOTAL_QUANTITY: 164000, GOOD_QUANTITY: 149240, QUALITY_RATE: 91.0, AVG_PRODUCTION_TIME_MINUTES: 105, AVG_BATCH_SIZE: 4900 },
    { PRODUCT_NAME: '장원영 맥주', TOTAL_QUANTITY: 172800, GOOD_QUANTITY: 168134, QUALITY_RATE: 97.3, AVG_PRODUCTION_TIME_MINUTES: 110, AVG_BATCH_SIZE: 5100 }
  ]
};

const ProductionPerformancePage = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [yearMonth, setYearMonth] = useState(new Date().toISOString().slice(0, 7)); // 현재 년월
  const [productName, setProductName] = useState('전체');
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [planVsActual, setPlanVsActual] = useState([]);
  const [qualityData, setQualityData] = useState([]);
  const [efficiency, setEfficiency] = useState([]);
 // 이 부분을 수정
const [products] = useState(['전체', '아이유 맥주', '카리나 맥주', '장원영 맥주']);
  const [loading, setLoading] = useState(true);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  // 애니메이션 키프레임 스타일 추가
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(50px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // 더미 데이터 로드 함수
  const loadDummyData = () => {
    setLoading(true);
    
    const selectedYearMonth = yearMonth;
    const selectedProduct = productName === '전체' ? null : productName;

    if (selectedProduct && !DUMMY_DATA.monthlyData.some(item => item.productName === selectedProduct)) {
      // 제품이 데이터에 없으면 빈 배열 설정
      setMonthlyData([]);
      setDailyData([]);
      setPlanVsActual([]);
      setQualityData([]);
      setEfficiency([]);
      setLoading(false);
      return;
    }
    
    // 월별 생산실적 데이터 필터링
    let filteredMonthlyData = [...DUMMY_DATA.monthlyData];
    if (selectedYearMonth) {
      filteredMonthlyData = filteredMonthlyData.filter(item => item.yearMonth === selectedYearMonth);
    }
    if (selectedProduct) {
      filteredMonthlyData = filteredMonthlyData.filter(item => item.productName === selectedProduct);
    }
    setMonthlyData(filteredMonthlyData);
    
    // 일별 생산실적 데이터 필터링
    let filteredDailyData = [...DUMMY_DATA.dailyData];
    if (selectedYearMonth) {
      filteredDailyData = filteredDailyData.filter(item => item.productionDate.startsWith(selectedYearMonth));
    }
    if (selectedProduct) {
      filteredDailyData = filteredDailyData.filter(item => item.productName === selectedProduct);
    }
    setDailyData(filteredDailyData);
    
    // 계획 대비 실적 데이터 필터링
    let filteredPlanVsActual = [...DUMMY_DATA.planVsActual];
    if (selectedYearMonth) {
      filteredPlanVsActual = filteredPlanVsActual.filter(item => item.YEAR_MONTH === selectedYearMonth);
    }
    if (selectedProduct) {
      filteredPlanVsActual = filteredPlanVsActual.filter(item => item.PRODUCT_NAME === selectedProduct);
    }
    setPlanVsActual(filteredPlanVsActual);
    
    // 품질률 데이터
    let filteredQualityData = [...DUMMY_DATA.qualityData];
    if (selectedProduct) {
      filteredQualityData = filteredQualityData.filter(item => item.productName === selectedProduct);
    }
    setQualityData(filteredQualityData);
    
    // 생산 효율성 데이터
    let filteredEfficiency = [...DUMMY_DATA.efficiency];
    if (selectedProduct) {
      filteredEfficiency = filteredEfficiency.filter(item => item.PRODUCT_NAME === selectedProduct);
    }
    setEfficiency(filteredEfficiency);
    
    setLoading(false);
  };

  useEffect(() => {
    loadDummyData();
  }, [activeTab, yearMonth, productName]);

  // 탭 변경 시 애니메이션 트리거
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // 애니메이션 트리거 증가로 차트 재렌더링 강제
    setAnimationTrigger(prev => prev + 1);
  };

  // 공통 애니메이션 스타일 객체
  const chartAnimationStyle = {
    animation: 'fadeIn 0.5s ease-out, slideUp 0.8s ease-out',
    transition: 'all 0.3s ease'
  };

  // 차트 컴포넌트 공통 래퍼
  const ChartWrapper = React.memo(({ 
    type = 'bar', 
    data, 
    xKey, 
    yKey, 
    title, 
    fill = '#0088FE', 
    domain,
    animationKey 
  }) => {
    const ChartComponent = type === 'bar' ? BarChart : LineChart;
    const DataComponent = type === 'bar' ? Bar : Line;

    return (
      <div 
        className={styles.chartContainer} 
        key={animationKey}
        style={{
          ...chartAnimationStyle,
          minHeight: '350px'
        }}
      >
        <h3>{title}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            {domain ? <YAxis domain={domain} /> : <YAxis />}
            <Tooltip />
            <Legend />
            <DataComponent 
              dataKey={yKey} 
              name={title} 
              fill={fill}
              animationDuration={1500}
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    );
  });
// 월별 탭 차트 함수를 완전히 교체하세요
const renderMonthlyTab = () => {
  // 1. 같은 날짜의 모든 제품 데이터를 합산
  const aggregatedData = dailyData.reduce((result, current) => {
    // 날짜가 이미 존재하는지 확인
    const existingDateIndex = result.findIndex(item => 
      item.productionDate === current.productionDate
    );
    
    if (existingDateIndex >= 0) {
      // 같은 날짜가 있으면 수량 합산
      result[existingDateIndex].totalQuantity += current.totalQuantity;
      result[existingDateIndex].goodQuantity += current.goodQuantity;
      
      // 품질률은 가중 평균으로 계산 (각 제품의 중요도에 따라 품질률 계산)
      const totalQuantityNow = result[existingDateIndex].totalQuantity;
      const prevWeightedQuality = result[existingDateIndex]._weightedQualitySum || 
                                 (result[existingDateIndex].qualityRate * (totalQuantityNow - current.totalQuantity));
      
      const newWeightedQuality = prevWeightedQuality + (current.qualityRate * current.totalQuantity);
      result[existingDateIndex].qualityRate = newWeightedQuality / totalQuantityNow;
      result[existingDateIndex]._weightedQualitySum = newWeightedQuality;
    } else {
      // 새로운 날짜면 객체 복사해서 추가
      result.push({
        ...current,
        _weightedQualitySum: current.qualityRate * current.totalQuantity // 가중 품질률 계산용 임시 필드
      });
    }
    
    return result;
  }, []);
  
  // 임시 필드 제거
  aggregatedData.forEach(item => {
    delete item._weightedQualitySum;
  });
  
  // 2. 날짜순으로 정렬
  const sortedData = aggregatedData.sort((a, b) => 
    new Date(a.productionDate) - new Date(b.productionDate)
  );
  
  return (
    <div className={styles.tabContent}>
      <div 
        className={styles.chartContainer} 
        style={{
          ...chartAnimationStyle,
          minHeight: '350px'
        }}
      >
        <h3>월별 생산량 추이 (전체)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="productionDate" 
              tickFormatter={(value) => value.slice(5)} // YYYY-MM-DD → MM-DD
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [value.toLocaleString(), '총 생산량']}
              labelFormatter={(label) => `생산일: ${label.slice(5)}`}
            />
            <Legend />
            <Bar 
              dataKey="totalQuantity" 
              name="생산량" 
              fill="#0088FE"
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div 
        className={styles.chartContainer} 
        style={{
          ...chartAnimationStyle,
          minHeight: '350px'
        }}
      >
        <h3>월별 품질률 추이 (전체 평균)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="productionDate" 
              tickFormatter={(value) => value.slice(5)} // YYYY-MM-DD → MM-DD
            />
            <YAxis domain={[90, 100]} />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)}%`, '평균 품질률']}
              labelFormatter={(label) => `생산일: ${label.slice(5)}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="qualityRate" 
              name="품질률" 
              stroke="#00C49F"
              strokeWidth={2}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

  const renderPlanVsActualTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.planVsActualCharts}>
        <div 
          className={styles.planVsActualChart} 
          style={{
            ...chartAnimationStyle,
            animationDelay: '0.1s',
          }}
        >
          <h3>계획 대비 실적 현황</h3>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={planVsActual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="PRODUCT_NAME" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="PLANNED_QUANTITY" 
                name="계획" 
                fill="#8884d8" 
                animationDuration={1500}
              />
              <Bar 
                dataKey="ACTUAL_QUANTITY" 
                name="실적" 
                fill="#82ca9d" 
                animationDuration={1500}
                animationBegin={300}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div 
          className={styles.planVsActualChart} 
          style={{
            ...chartAnimationStyle,
            animationDelay: '0.3s',
          }}
        >
          <h3>달성률 현황</h3>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={planVsActual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="PRODUCT_NAME" />
              <YAxis domain={[90, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ACHIEVEMENT_RATE" 
                name="달성률" 
                stroke="#FF8042" 
                strokeWidth={2} 
                animationDuration={1500}
                animationBegin={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderQualityTab = () => (
    <div className={styles.tabContent}>
      <div 
        className={styles.chartContainer} 
        style={{
          ...chartAnimationStyle,
          animationDelay: '0.1s', 
          minHeight: '350px'
        }}
      >
        <h3>제품별 불량률</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={qualityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="productName" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Bar 
              animationDuration={1500} 
              dataKey="defectRate" 
              name="불량률(%)" 
              fill={(data) => data.defectRate >= 6 ? '#FF0000' : '#FF8042'} 
            />
            <ReferenceLine 
              y={6} 
              stroke="red" 
              strokeWidth={2} 
              strokeDasharray="3 3" 
              label={{ 
                value: '위험 수준 (6%)', 
                position: 'right', 
                fill: 'red', 
                fontSize: 12 
              }} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div 
        className={styles.chartContainer} 
        style={{
          ...chartAnimationStyle,
          animationDelay: '0.3s', 
          minHeight: '350px'
        }}
      >
        <h3>월별 불량률 추이</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart 
            data={dailyData
              .map(item => ({
                ...item,
                productionDate: item.productionDate,
                defectRate: 100 - item.qualityRate
              }))
              .sort((a, b) => new Date(a.productionDate) - new Date(b.productionDate))
            }
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="productionDate" />
            <YAxis domain={[0, 10]} />
            <Tooltip 
              content={({active, payload, label}) => {
                if (active && payload && payload.length) {
                  return (
                    <div 
                      className={styles.customTooltip} 
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '8px'
                      }}
                    >
                      <p style={{margin: '0 0 5px 0'}}>{`일자: ${label}`}</p>
                      <p style={{margin: '0 0 5px 0'}}>{`제품: ${payload[0].payload.productName}`}</p>
                      <p 
                        style={{
                          margin: '0', 
                          color: payload[0].value >= 6 ? 'red' : 'black',
                          fontWeight: payload[0].value >= 6 ? 'bold' : 'normal'
                        }}
                      >
                        {`불량률: ${payload[0].value.toFixed(2)}%`}
                        {payload[0].value >= 6 ? ' (위험)' : ''}
                      </p>
                    </div>
                  );
                }
                return null;
              }} 
            />
            <Legend />
            <ReferenceLine 
              y={6} 
              stroke="red" 
              strokeWidth={2} 
              strokeDasharray="3 3" 
              label={{ 
                value: '위험 수준 (6%)', 
                position: 'right', 
                fill: 'red', 
                fontSize: 12 
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="defectRate" 
              name="불량률(%)" 
              stroke="#FF8042" 
              strokeWidth={2} 
              animationDuration={1500}
              animationBegin={300}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const defectRate = payload.defectRate;
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={5} 
                    fill={defectRate >= 6 ? '#FF0000' : '#FF8042'} 
                    stroke="none" 
                  />
                );
              }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

       <div 
      className={styles.tableContainer} 
      style={{
        ...chartAnimationStyle,
        animationDelay: '0.5s'
      }}
    >
        <h3>제품별 불량 현황</h3>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>제품명</th>
              <th>총 출하량</th>
              <th>불량 수량</th>
              <th>불량률(%)</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {qualityData.map((item, index) => {
              const efficiencyData = DUMMY_DATA.efficiency.find(e => e.PRODUCT_NAME === item.productName) || 
                                    { TOTAL_QUANTITY: 0 };
              const totalQuantity = efficiencyData.TOTAL_QUANTITY;
              const defectQuantity = Math.round(totalQuantity * (item.defectRate / 100));
              const isWarning = item.defectRate >= 6;
              
              return (
                <tr 
                  key={index} 
                  style={{
                    backgroundColor: isWarning ? 'rgba(255, 235, 235, 0.5)' : undefined,
                    animation: `fadeIn 0.5s ease-out ${0.5 + (index * 0.1)}s both`
                  }}
                >
                  <td>{item.productName}</td>
                  <td>{totalQuantity.toLocaleString()}</td>
                  <td>{defectQuantity.toLocaleString()}</td>
                  <td 
                    style={{
                      color: isWarning ? 'red' : 'inherit', 
                      fontWeight: isWarning ? 'bold' : 'normal'
                    }}
                  >
                    {item.defectRate.toFixed(2)}
                  </td>
                  <td 
                    style={{
                      color: isWarning ? 'red' : 'green', 
                      fontWeight: 'bold'
                    }}
                  >
                    {isWarning ? '위험' : '정상'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEfficiencyTab = () => (
    <div className={styles.tabContent}>
      <div 
        className={styles.tableContainer} 
        style={{
          ...chartAnimationStyle,
          animationDelay: '0.1s'
        }}
      >
        <h3>제품별 생산 효율성</h3>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>제품명</th>
              <th>총 출하량</th>
              <th>양품 수량</th>
              <th>품질률(%)</th>
            </tr>
          </thead>
          <tbody>
            {efficiency.map((item, index) => (
              <tr 
                key={index} 
                style={{
                  animation: `fadeIn 0.5s ease-out ${0.3 + (index * 0.1)}s both`
                }}
              >
                <td>{item.PRODUCT_NAME}</td>
                <td>{item.TOTAL_QUANTITY.toLocaleString()}</td>
                <td>{item.GOOD_QUANTITY.toLocaleString()}</td>
                <td>{item.QUALITY_RATE.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div 
        className={styles.chartContainer} 
        style={{
          ...chartAnimationStyle,
          animationDelay: '0.3s', 
          minHeight: '350px'
        }}
      >
        <h3>제품별 품질률 비교</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={efficiency}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="PRODUCT_NAME" />
            <YAxis domain={[90, 100]} />
            <Tooltip />
            <Legend />
            <Bar 
              animationDuration={1500} 
              dataKey="QUALITY_RATE" 
              name="품질률(%)" 
              fill="#8884d8" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // 활성 탭 렌더링
  const renderActiveTab = () => {
    if (loading) {
      return <div className={styles.loading}>데이터 로딩 중...</div>;
    }
  
    switch (activeTab) {
      case 'monthly':
        return renderMonthlyTab();
      case 'plan-vs-actual':
        return renderPlanVsActualTab();
      case 'quality':
        return renderQualityTab();
      case 'efficiency':
        return renderEfficiencyTab();
      default:
        return null;
    }
  };

  // 엑셀 다운로드 함수
  const handleExcelDownload = () => {
    try {
      let dataToExport = [];
      let fileName = '';
      
      switch (activeTab) {
        case 'monthly':
          fileName = `월별생산실적_${yearMonth}.csv`;
          dataToExport = dailyData.map(item => ({
            '생산일자': item.productionDate,
            '제품명': item.productName,
            '생산량': item.totalQuantity,
            '양품수량': item.goodQuantity,
            '품질률(%)': item.qualityRate
          }));
          break;
          
        case 'plan-vs-actual':
          fileName = `계획대비실적_${yearMonth}.csv`;
          dataToExport = planVsActual.map(item => ({
            '년월': item.YEAR_MONTH,
            '제품명': item.PRODUCT_NAME,
            '계획량': item.PLANNED_QUANTITY,
            '실적량': item.ACTUAL_QUANTITY,
            '달성률(%)': item.ACHIEVEMENT_RATE
          }));
          break;
          
        case 'quality':
          fileName = `불량률분석_${yearMonth}.csv`;
          dataToExport = qualityData.map(item => {
            const efficiencyData = DUMMY_DATA.efficiency.find(e => e.PRODUCT_NAME === item.productName);
            const totalQuantity = efficiencyData ? efficiencyData.TOTAL_QUANTITY : 0;
            const defectQuantity = Math.round(totalQuantity * (item.defectRate / 100));
            
            return {
              '제품명': item.productName,
              '총출하량': totalQuantity,
              '불량수량': defectQuantity,
              '불량률(%)': item.defectRate
            };
          });
          break;
          
        case 'efficiency':
          fileName = `생산효율성_${yearMonth}.csv`;
          dataToExport = efficiency.map(item => ({
            '제품명': item.PRODUCT_NAME,
            '총출하량': item.TOTAL_QUANTITY,
            '양품수량': item.GOOD_QUANTITY,
            '품질률(%)': item.QUALITY_RATE
          }));
          break;
          
        default:
          break;
      }
      
      if (dataToExport.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
      }
      
      // CSV 데이터 생성
      const csvRows = [];
      
      // 헤더 추가
      const headers = Object.keys(dataToExport[0]);
      csvRows.push(headers.join(','));
      
      // 데이터 행 추가
      for (const row of dataToExport) {
        const values = headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        });
        csvRows.push(values.join(','));
      }
      
      // CSV 내용 생성
      const csvContent = csvRows.join('\n');
      
      // Blob 생성 및 다운로드
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (window.URL && window.URL.createObjectURL) {
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        alert(`${fileName} 다운로드를 시작합니다.`);
      } else {
        alert('브라우저가 파일 다운로드 기능을지원하지 않습니다.');
      }
    } catch (error) {
      console.error('CSV 다운로드 오류:', error);
      alert('파일 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageTitle}>생산실적 관리</div>

      <div className={styles.searchBar}>
        <div className={styles.searchFilter}>
          <label htmlFor="yearMonth">조회 년월</label>
          <input
            id="yearMonth"
            type="month"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
          />
        </div>
        
        <div className={styles.searchFilter}>
          <label htmlFor="productName">제품</label>
          <select
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          >
            {products.map(product => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
        </div>
        
        <button 
          className={styles.excelButton}
          onClick={handleExcelDownload}
        >
          Excel 다운로드
        </button>
      </div>

      <div className={styles.tabs}>
        {['monthly', 'plan-vs-actual', 'quality', 'efficiency'].map(tab => (
          <button 
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab === 'monthly' && '월별 생산실적'}
            {tab === 'plan-vs-actual' && '계획 대비 실적'}
            {tab === 'quality' && '불량률 분석'}
            {tab === 'efficiency' && '생산 효율성'}
          </button>
        ))}
      </div>

      {renderActiveTab()}
    </div>
  );
};

export default ProductionPerformancePage;
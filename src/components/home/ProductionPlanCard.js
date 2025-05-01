import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { Box, Typography, CircularProgress } from '@mui/material';
import { fetchProductionPlans } from '../../apis/productionPlanApi/ProductionPlanApi'; // 경로 수정

const ProductionPlanCard = () => {
  const [planData, setPlanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 현재 월과 이전/이후 월을 계산하는 함수
  const getMonthsRange = () => {
    const now = new Date();
    const months = [];
    
    // 이전 2개월
    for (let i = 2; i > 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      months.push(`${year}-${month}`);
    }
    
    // 현재 월
    const currentYear = now.getFullYear();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    months.push(`${currentYear}-${currentMonth}`);
    
    // 다음 2개월 (1개에서 2개로 변경)
    for (let i = 1; i <= 2; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      months.push(`${year}-${month}`);
    }
    
    return months;
  };

  // 월 표시 형식 변환 (YYYY-MM -> MM월)
  const formatMonth = (yearMonth) => {
    return yearMonth.split('-')[1] + '월';
  };

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);
        const months = getMonthsRange();
        
        // 개발 모드에서만 더미 데이터 사용 (실제 환경에서는 주석 처리하세요)
        const USE_DUMMY_DATA = false;  // API를 사용하기 위해 false로 변경
        
        // 실제 API 통신
        if (!USE_DUMMY_DATA) {
          const planCounts = [];
          // 각 월별 데이터 가져오기
          for (const month of months) {
            try {
              // 기존 API 클라이언트 사용
              const data = await fetchProductionPlans(month, "");
              planCounts.push({
                month: month,
                count: Array.isArray(data) ? data.length : 0
              });
            } catch (err) {
              console.error(`${month} 데이터 가져오기 오류:`, err);
              // 오류 발생시 0으로 설정
              planCounts.push({
                month: month,
                count: 0
              });
            }
          }
          setPlanData(planCounts);
          setLoading(false);
        } 
        // 더미 데이터 사용 (개발/테스트용)
        else {
          // 더미 데이터 생성
          const dummyData = months.map(month => {
            // 월별로 다른 값을 생성 (테스트용)
            let count;
            const monthNum = parseInt(month.split('-')[1]);
            const yearNum = parseInt(month.split('-')[0]);
            
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            
            // 현재 월은 더 큰 값으로 설정
            if (monthNum === currentMonth && yearNum === currentYear) {
              count = Math.floor(Math.random() * 8) + 12; // 12~20
            } 
            // 미래 월은 약간 낮은 값으로 설정 (아직 계획 중)
            else if ((yearNum > currentYear) || (yearNum === currentYear && monthNum > currentMonth)) {
              count = Math.floor(Math.random() * 7) + 4;  // 4~11
            }
            // 과거 월
            else {
              count = Math.floor(Math.random() * 10) + 7;  // 7~17
            }
            
            return {
              month: month,
              count: count
            };
          });
          
          // 잠시 로딩 효과를 보여주기 위해 타임아웃 설정
          setTimeout(() => {
            setPlanData(dummyData);
            setLoading(false);
          }, 800);
        }
      } catch (err) {
        console.error('생산계획 데이터 조회 중 오류 발생:', err);
        setError('데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchPlanData();
  }, []);

  // 현재 달 인덱스 계산
  const getCurrentMonthIndex = () => {
    const months = getMonthsRange();
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    return months.indexOf(currentYearMonth);
  };

  // 차트 데이터 가공
  const chartData = planData.map((item) => ({
    name: formatMonth(item.month),
    value: item.count,
    month: item.month
  }));

  return (
    <Box 
      sx={{ 
        height: '100%', 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'white',
        borderRadius: '12px',
        boxShadow: '0 6px 12px rgba(0,0,0,0.05)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #3182CE 0%, #63B3ED 100%)',
        }
      }}
    >
      <Typography variant="h6" component="div" sx={{ 
        fontWeight: 'bold', 
        mb: 2,
        color: '#2D3748',
        borderBottom: '1px solid #eee',
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3V21H21" stroke="#3182CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 16L11 12L15 16L21 10" stroke="#3182CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        5개월 간 생산계획 건수
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3182CE" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#63B3ED" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorCurrentBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DD6B20" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ED8936" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                dy={10}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickCount={5}
                dx={-5}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Legend
                payload={[
                  { value: '일반 계획', type: 'square', color: '#63B3ED' },
                  { value: '현재 월 계획', type: 'square', color: '#ED8936' }
                ]}
                align="left"
                verticalAlign="bottom"
                iconSize={15}
                wrapperStyle={{ 
                  fontSize: '15px', 
                  bottom: '0px',  // 하단에서의 거리
                  lineHeight: '30px' // 줄 높이 증가
                }}
              />
              <Tooltip 
                formatter={(value) => [`${value}건`, '생산계획']}
                labelFormatter={(label) => `${label} 생산계획`}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar 
                dataKey="value" 
                name="생산계획"
                radius={[4, 4, 0, 0]}
                barSize={35}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => {
                  // 현재 달은 다른 색상으로 표시
                  const isCurrentMonth = index === getCurrentMonthIndex();
                  return <Cell 
                    key={`cell-${index}`} 
                    fill={isCurrentMonth ? 'url(#colorCurrentBar)' : 'url(#colorBar)'}
                    stroke={isCurrentMonth ? '#C05621' : '#2C5282'}
                    strokeWidth={1}
                  />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 1,
            fontSize: '0.75rem',
            color: '#666'
          }}>
            <Typography variant="caption">
              데이터 기준: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProductionPlanCard;
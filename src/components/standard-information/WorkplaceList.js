import React, { useEffect, useState } from 'react';
import { fetchWorkplaces } from '../../apis/WorkplaceApi';

const WorkplaceList = () => {
  const [workplaces, setWorkplaces] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchWorkplaces();

        setWorkplaces(data); // 상태 업데이트
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };
    getData();
  }, []);

  return (
    <div>
      <h3>작업장 목록</h3>
      <ul>
        {workplaces.map((workplace) => (
          <li key={workplace.workplaceId}>
              
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkplaceList;

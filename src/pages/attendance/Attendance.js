import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "react-modal";
import Schedule from "./attendance.module.css";
import {
  findAllWorkOrders,
  fetchWorkOrderByLotNo,
} from "../../apis/workOrderApi/workOrdersApi";
import { useAuth } from "../../contexts/AuthContext"; 

const ProductionSchedule = () => {
  const { currentUser } = useAuth(); // 추가: 현재 로그인한 사용자 정보 가져오기
  const [events, setEvents] = useState([]);
  const [isDetailModal, setIsDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [noAccidentDays, setNoAccidentDays] = useState(0);
  const [userSchedule, setUserSchedule] = useState({
    empName: "로딩 중...",
    workTeam: "로딩 중...",
    profileImage: "../images/default_profile.png", // 기본 이미지 변경
  });
  const [monthlyWorkHours, setMonthlyWorkHours] = useState(0);
  const [currentWorkHours, setCurrentWorkHours] = useState(0);

  // 추가: 사용자별 프로필 이미지 매핑
  const userImages = {
    'admin': '../images/admin.jpg',
    'plan': '../images/plan.jpg',
    'work': '../images/work.jpg',
    'EMP001': '../images/emp001.jpg',
    'iu': '../images/iublack.jpg'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 추가: 현재 로그인한 사용자의 ID를 기준으로 작업 지시서 조회
        // empId 파라미터 추가 (백엔드에서 이 파라미터를 지원한다고 가정)
        const response = await findAllWorkOrders(0, 100, '', '', '', '', '', '', currentUser?.id);
        
        if (response?.work?.content) {
          // 로그인한 사용자의 작업만 필터링 (백엔드에서 처리하지 않을 경우)
          const userWorks = currentUser?.id 
            ? response.work.content.filter(work => work.empId === currentUser.id)
            : response.work.content;
          
          // 사용자 정보 설정
          if (userWorks.length > 0) {
            setUserSchedule({
              empName: currentUser?.name || userWorks[0].empName,
              workTeam: userWorks[0].workTeam,
              profileImage: userImages[currentUser?.id] || "../images/default_profile.png",
            });
          } else if (currentUser) {
            // 작업이 없어도 로그인한 사용자 정보 표시
            setUserSchedule({
              empName: currentUser.name,
              workTeam: currentUser.department || "부서 정보 없음",
              profileImage: userImages[currentUser.id] || "../images/default_profile.png",
            });
          }

          // 개별 일자별 이벤트 생성 (주말 포함)
          const calendarEvents = userWorks.flatMap((work) => {
            const start = new Date(work.startDate);
            const end = new Date(work.endDate);
            const events = [];

            const backgroundColor = getBackgroundColor(work.productName);
            for (
              let date = new Date(start);
              date <= end;
              date.setDate(date.getDate() + 1)
            ) {
              events.push({
                title: work.productName,
                start: new Date(date),
                allDay: true,
                extendedProps: {
                  lotNo: work.lotNo,
                  productName: work.productName,
                  workTeam: work.workTeam,
                  lineNo: work.lineNo,
                  empName: work.empName,
                  planQty: work.planQty,
                  date: date.toISOString().split("T")[0], // YYYY-MM-DD 형식
                  startDate: work.startDate, // 시작일 추가
                  endDate: work.endDate, // 종료일 추가
                },
                backgroundColor: backgroundColor,
                borderColor: backgroundColor, // 테두리색을 배경색과 동일하게 설정
              });
            }
            return events;
          });
          setEvents(calendarEvents);
        }
      } catch (error) {
        console.error("생산 스케줄 로딩 실패", error);
        // 에러 발생 시에도 로그인한 사용자 정보 표시
        if (currentUser) {
          setUserSchedule({
            empName: currentUser.name,
            workTeam: currentUser.department || "부서 정보 없음",
            profileImage: userImages[currentUser.id] || "../images/default_profile.png",
          });
        } else {
          setUserSchedule({
            empName: "데이터 오류",
            workTeam: "데이터 오류",
            profileImage: "../images/default_profile.png",
          });
        }
      }
    };
    fetchData();
  }, [currentUser]); // 의존성 배열에 currentUser 추가

  useEffect(() => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}.${String(
      now.getMonth() + 1
    ).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
    setCurrentDateTime(formattedDate);

    const startDate = new Date("2025-02-18");
    const dayDifference = Math.floor(
      (now - startDate) / (1000 * 60 * 60 * 24)
    );
    setNoAccidentDays(dayDifference);

    // 근무 시간 계산
    const calculateWorkHours = () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      );

      let monthlyHours = 0;
      let currentHours = 0;

      for (
        let d = new Date(firstDayOfMonth);
        d <= lastDayOfMonth;
        d.setDate(d.getDate() + 1)
      ) {
        monthlyHours += 8; // 주말 포함
      }

      for (
        let d = new Date(firstDayOfMonth);
        d <= now;
        d.setDate(d.getDate() + 1)
      ) {
        currentHours += 8; // 주말 포함
      }

      setMonthlyWorkHours(monthlyHours);
      setCurrentWorkHours(currentHours);
    };

    calculateWorkHours();
  }, []);

  const handleEventClick = async (info) => {
    try {
      const workOrder = await fetchWorkOrderByLotNo(
        info.event.extendedProps?.lotNo
      );
      if (!workOrder) return;

      setSelectedEvent({
        ...workOrder,
        empName: info.event.extendedProps?.empName || "정보 없음",
        workTeam: info.event.extendedProps?.workTeam || "정보 없음",
      });
      setIsDetailModal(true);
    } catch (error) {
      console.error("작업지시서 조회 실패", error);
    }
  };

  const renderEventContent = (eventInfo) => {
    const startDate = new Date(eventInfo.event.extendedProps.startDate);
    const endDate = new Date(eventInfo.event.extendedProps.endDate);

    // 종료일이 유효한 날짜인지 확인
    const endDateString = isNaN(endDate.getTime())
      ? ""
      : endDate.toLocaleDateString("ko-KR", {
        month: "numeric",
        day: "numeric",
      });

    return (
      <div
        style={{
          fontSize: "0.8em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          padding: "2px",
        }}
      >
        <span style={{ fontWeight: "bold" }}>
          {eventInfo.event.extendedProps.productName}
        </span>
        <br /> {/* 날짜를 다음 줄에 표시 */}
        <span>
          {startDate.toLocaleDateString("ko-KR", {
            month: "numeric",
            day: "numeric",
          })}
          {endDateString && ` ~ ${endDateString}`} {/* 종료일이 있으면 표시 */}
        </span>
      </div>
    );
  };

  const getBackgroundColor = (productName) => {
    switch (productName) {
      case "아이유 맥주":
        return "#F5B169";
      case "장원영 맥주":
        return "#F58B78";
      case "카리나 맥주":
        return "#C2CCFF";
      default:
        return "#3788d8";
    }
  };

  const dayCellDidMount = (info) => {
    const day = info.date.getDay();
    if (day === 6) {
      // Saturday
      info.el.style.backgroundColor = "#E8F0FE"; // Light blue background
    } else if (day === 0) {
      // Sunday
      info.el.style.backgroundColor = "#FEE8E8"; // Light red background
    }
  };

  const dayHeaderContent = (args) => {
    const day = args.date.getDay();
    let color = "black"; // Default color
    if (day === 6) {
      // Saturday
      color = "blue";
    } else if (day === 0) {
      // Sunday
      color = "red";
    }
    return <div style={{ color }}>{args.text}</div>;
  };

  return (
    <div className={Schedule.main}>
      {/* 상단 프로필 섹션 */}
      <div style={{ display: "flex", alignItems: "center", marginTop: "30px" }}>
        <div className={Schedule.profileBar}>
          <div className={Schedule.leftContent}>
            <img
              className={Schedule.profile}
              src={userSchedule.profileImage}
              alt="프로필사진"
            />
            <p className={Schedule.profileName}>
              <b>{userSchedule.empName}</b>&nbsp;님
            </p>
            <p className={Schedule.profileName1}>환영합니다.</p>
          </div>
          <div className={Schedule.divider}></div>
          <div className={Schedule.rightContent}>
            <h3 style={{ color: "red" }}>
              {noAccidentDays}&nbsp;일 무사고
            </h3>
            <p>{currentDateTime}</p>
            <p>
              <b>오늘도 안전 무사고!!</b>
            </p>
          </div>
        </div>
        {/* 인원 투입 시간 테이블 */}
        <div className={Schedule.tableBar}>
          <h3 className={Schedule.tableName}>인원투입시간관리</h3>
          <table className={Schedule.styledTb}>
            <thead>
              <tr>
                <th>이름</th>
                <th>작업조</th>
                <th>이번달 근무시간</th>
                <th>현재 근무시간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{userSchedule.empName}</td>
                <td>{userSchedule.workTeam}</td>
                <td>{monthlyWorkHours}시간</td>
                <td>{currentWorkHours}시간</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* 캘린더 영역 */}
      <div className={Schedule.maiBar}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
          events={events}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          locale="ko"
          height="100%"
          dayCellDidMount={dayCellDidMount}
          dayHeaderContent={dayHeaderContent}
        />
      </div>

      {/* 생산 상세 모달 */}
      {selectedEvent && (
        <Modal
          isOpen={isDetailModal}
          onRequestClose={() => setIsDetailModal(false)}
          className={Schedule.modal}
          overlayClassName={Schedule.overlay}
        >
          <div className={Schedule.modalContent}>
            <button
              className={Schedule.closeButton}
              onClick={() => setIsDetailModal(false)}
            >
              X
            </button>
            <h2 className={Schedule.detailh2}>생산 상세 정보</h2>
            <p>
              <b>작업지시번호:</b> {selectedEvent.lotNo}
            </p>
            <p>
              <b>담당자:</b> {selectedEvent.empName}
            </p>
            <p>
              <b>작업조:</b> {selectedEvent.workTeam}
            </p>
            <p>
              <b>제품명:</b> {selectedEvent.productName}
            </p>
            <p>
              <b>생산라인:</b> {selectedEvent.lineNo} LINE
            </p>
            <p>
              <b>계획 수량:</b> {selectedEvent.planQty} EA
            </p>
            <p>
              <b>생산기간:</b> {selectedEvent.startDate} ~ {selectedEvent.endDate}
            </p>
            <button
              onClick={() => setIsDetailModal(false)}
              className={Schedule.modalCloseBtn}
            >
              닫기
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProductionSchedule;
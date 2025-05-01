import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Filter, AlertCircle } from 'lucide-react';
import styles from "../../styles/productionPlan/BreweryCalendar.module.css";

const PremiumBreweryCalendar = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 날짜 관련 유틸리티 함수
  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const getDayName = (date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[new Date(date).getDay()];
  };

  const generateWeekDays = (startDate) => {
    const result = [];
    const start = new Date(startDate);
    // 주의 시작일을 월요일로 조정
    const dayOfWeek = start.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(current.getDate() + i);
      result.push(formatDate(current));
    }

    return result;
  };

  // 주간 뷰 일자 생성
  const weekDays = generateWeekDays(currentDate);

  // 주간 뷰의 시간 범위 (0:00 ~ 23:00)로 확장
  const hourRange = Array.from({ length: 24 }, (_, i) => i);

  // 이벤트 클릭 핸들러
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  // 다음/이전 주 이동 핸들러
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const parseEventDate = (dateString) => {
    try {
      // 기본 Date 객체 생성
      const date = new Date(dateString);

      // 모든 날짜를 하루 뒤로 조정 (시간대 문제 일괄 해결)
      date.setDate(date.getDate() + 1);

      return date;
    } catch (error) {
      console.error('날짜 파싱 오류:', error);
      return new Date();
    }
  };

  // 특정 날짜/시간에 해당하는 이벤트 찾기
  const getEventsForTimeSlot = (date, hour) => {
    const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`);
    const slotEnd = new Date(`${date}T${hour.toString().padStart(2, '0')}:59:59`);

    return events.filter(event => {
      const eventStart = parseEventDate(event.start);
      const eventEnd = parseEventDate(event.end);

      // 날짜만 비교 (시간은 무시)
      const eventDate = eventStart.toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식
      const slotDate = date;

      // 짧은 공정(분쇄, 당화 등)은 날짜만 일치하면 표시
      if (['분쇄', '당화', '여과', '끓임', '냉각', '숙성후여과', '탄산조정'].includes(event.process)) {
        const isCorrectDay = eventDate === slotDate

        // 날짜가 일치하면 특정 시간대에 표시
        if (isCorrectDay) {
          // 분쇄: 8-9시, 당화: 9-10시 등으로 할당
          const processHourMap = {
            '분쇄': 8,
            '당화': 9,
            '여과': 10,
            '끓임': 11,
            '냉각': 12,
            '숙성후여과': 14,
            '탄산조정': 16
          };

          return processHourMap[event.process] === hour;
        }
        return false;
      }

      // 발효, 숙성 등 장기 공정은 기존 방식대로 처리
      return (
        (eventStart >= slotStart && eventStart < slotEnd) ||
        (eventEnd > slotStart && eventEnd <= slotEnd) ||
        (eventStart <= slotStart && eventEnd >= slotEnd)
      );
    });
  };

  // 시간 포맷팅
  const formatTimeDisplay = (date) => {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // 공정별 색상 매핑
  const processColors = {
    '분쇄': '#E3F2FD',
    '당화': '#FFEBEE',
    '여과': '#E8F5E9',
    '끓임': '#FFF8E1',
    '냉각': '#F3E5F5',
    '발효': '#DCEDC8',
    '숙성': '#B3E5FC',
    '숙성후여과': '#FFE0B2',
    '탄산조정': '#D1C4E9'
  };

  return (
    <div className={styles.calendarContainer}>
      {/* 캘린더 헤더 */}
      <div className={styles.calendarHeader}>
        <div className={styles.calendarHeaderTop}>
          <div className={styles.calendarTitle}>
            <Calendar className={styles.calendarIcon} />
            <h3>생산 공정 일정</h3>
          </div>

          <div className={styles.calendarControls}>
            <button
              onClick={navigatePrevious}
              className={styles.calendarButton}
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() => setCurrentDate(new Date())}
              className={styles.todayButton}
            >
              오늘
            </button>

            <button
              onClick={navigateNext}
              className={styles.calendarButton}
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        <div className={styles.calendarHeaderBottom}>
          <div className={styles.viewButtons}>
            <button
              onClick={() => setCalendarView('day')}
              className={`${styles.viewButton} ${calendarView === 'day' ? styles.active : ''}`}
            >
              일간
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`${styles.viewButton} ${calendarView === 'week' ? styles.active : ''}`}
            >
              주간
            </button>
          </div>

          <div>
            <span className={styles.dateRange}>
              {calendarView === 'week'
                ? `${weekDays[0]} ~ ${weekDays[6]}`
                : formatDate(currentDate)
              }
            </span>
          </div>
        </div>
      </div>

      {/* 주간 뷰 */}
      {calendarView === 'week' && (
        <div className={styles.calendarContent}>
          <div className={styles.calendarGrid}>
            {/* 요일 헤더 */}
            <div className={styles.calendarDayHeader}>
              <div className={styles.dayHeaderCell}>시간</div>
              {weekDays.map(day => (
                <div key={day} className={styles.dayHeaderCell}>
                  {day.split('-')[2]}일 ({getDayName(day)})
                </div>
              ))}
            </div>

            {/* 시간 행 */}
            {hourRange.map(hour => (
              <div key={hour} className={styles.timeRow}>
                {/* 시간 셀 */}
                <div className={styles.timeCell}>
                  {hour}:00
                </div>

                {/* 각 요일에 대한 셀 */}
                {weekDays.map(day => {
                  const timeSlotEvents = getEventsForTimeSlot(day, hour);

                  return (
                    <div key={`${day}-${hour}`} className={styles.dayCell}>
                      {timeSlotEvents.length > 0 && (
                        <div className={styles.eventList}>
                          {timeSlotEvents.map(event => {
                            // 짧은 공정에 대해 더 두드러진 스타일 적용
                            const isShortProcess = ['분쇄', '당화', '여과', '끓임', '냉각', '숙성후여과', '탄산조정'].includes(event.process);
                            const bgColor = processColors[event.process] || '#E3F2FD';

                            return (
                              <div
                                key={event.id}
                                className={`${styles.event} ${isShortProcess ? styles.shortProcess : ''}`}
                                style={{
                                  backgroundColor: bgColor,
                                  color: event.textColor || '#1E40AF',
                                  border: isShortProcess ? '2px solid #000' : 'none',
                                  fontWeight: isShortProcess ? 'bold' : 'normal'
                                }}
                                onClick={() => handleEventClick(event)}
                              >
                                <div className={styles.eventTitle}>{event.productName} - {event.process}</div>
                                <div className={styles.eventInfo}>
                                  라인 {event.lineNo} | 배치 {event.batchNo}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 일간 뷰 */}
      {calendarView === 'day' && (
        <div className={styles.dayView}>
          <div className={styles.dayContainer}>
            <div className={styles.dayHeader}>
              {formatDate(currentDate)} ({getDayName(currentDate)})
            </div>

            <div className={styles.dayContent}>
              {hourRange.map(hour => {
                const timeSlotEvents = getEventsForTimeSlot(formatDate(currentDate), hour);

                return (
                  <div key={hour} className={styles.timeSlot}>
                    <div className={styles.timeLabel}>
                      {hour}:00
                    </div>
                    <div className={styles.timeContent}>
                      {timeSlotEvents.length > 0 ? (
                        <div className={styles.timeEventList}>
                          {timeSlotEvents.map(event => {
                            const bgColor = processColors[event.process] || '#E3F2FD';

                            return (
                              <div
                                key={event.id}
                                className={styles.timeEvent}
                                style={{
                                  backgroundColor: bgColor,
                                  color: event.textColor || '#1E40AF'
                                }}
                                onClick={() => handleEventClick(event)}
                              >
                                <div className={styles.timeEventTitle}>{event.productName} - {event.process}</div>
                                <div className={styles.timeEventTime}>
                                  {formatTimeDisplay(event.start)} - {formatTimeDisplay(event.end)}
                                </div>
                                <div className={styles.timeEventInfo}>
                                  라인 {event.lineNo} | 배치 {event.batchNo}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={styles.timeSlotEmpty}></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 범례 */}
      <div className={styles.legend}>
        <div className={styles.legendHeader}>
          <AlertCircle className={styles.legendIcon} />
          <h4 className={styles.legendTitle}>공정 범례</h4>
        </div>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: processColors['분쇄'] }}></div>
            <span>분쇄</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: processColors['당화'] }}></div>
            <span>당화</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: processColors['여과'] }}></div>
            <span>여과</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: processColors['끓임'] }}></div>
            <span>끓임</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: processColors['냉각'] }}></div>
            <span>냉각</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: processColors['발효'] }}></div>
            <span>발효</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: processColors['숙성'] }}></div>
            <span>숙성</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: processColors['숙성후여과'] }}></div>
            <span>숙성후여과</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: processColors['탄산조정'] }}></div>
            <span>탄산조정</span>
          </div>
        </div>
      </div>

      {/* 이벤트 상세 모달 */}
      {showDetailModal && selectedEvent && (
        <>
          <div
            className={styles.modalBackdrop}
            onClick={() => setShowDetailModal(false)}
          ></div>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{selectedEvent.productName} - {selectedEvent.process}</h3>
            <div className={styles.modalContent}>
              <p><span className={styles.modalLabel}>맥주 타입:</span> {selectedEvent.beerType}</p>
              <p><span className={styles.modalLabel}>라인 번호:</span> {selectedEvent.lineNo}</p>
              <p><span className={styles.modalLabel}>배치 번호:</span> {selectedEvent.batchNo}</p>
              <p><span className={styles.modalLabel}>시작:</span> {new Date(selectedEvent.start).toLocaleString()}</p>
              <p><span className={styles.modalLabel}>종료:</span> {new Date(selectedEvent.end).toLocaleString()}</p>
            </div>
            <button
              className={styles.modalButton}
              onClick={() => setShowDetailModal(false)}
            >
              닫기
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PremiumBreweryCalendar;
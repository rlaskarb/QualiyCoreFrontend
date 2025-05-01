import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; // useNavigate 추가
import { RiSettings4Line, RiDatabase2Line } from "react-icons/ri";
import { MdOutlineProductionQuantityLimits, MdOutlineWork } from "react-icons/md";
import { WebsocketContext } from "../common/WebSocket/WebsocketContext";
import { TbRoute } from "react-icons/tb";
import { AiOutlineSchedule } from "react-icons/ai";
import { HiOutlineUserGroup } from "react-icons/hi";
import { GiFactory } from "react-icons/gi";
import { useAuth } from "../contexts/AuthContext"; // AuthContext 추가
import "../styles/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate(); // 라우팅 네비게이션 추가
  const { currentUser, logout } = useAuth(); // 현재 사용자 정보와 로그아웃 함수 가져오기

  const {
    messages,
    workOrderMessages,
    resetNotifications,
    resetWorkOrderNotifications
  } = useContext(WebsocketContext);

  const [openCategory, setOpenCategory] = useState(null);

  // 사용자별 프로필 이미지 매핑
  const userImages = {
    'admin': '/images/admin.jpg', // 관리자 이미지
    'plan': '/images/plan.jpg',   // 생산관리자 이미지
    'work': '/images/work.jpg',   // 작업관리자 이미지
    'EMP001': '/images/emp001.jpg',     // 일반사원 이미지
    'iu': '/images/iublack.jpg'        // 아이유 이미지
  };

  // 사용자 역할 한글 변환
  const roleTranslation = {
    'ADMIN': '관리자',
    'PRODUCTION_MANAGER': '생산관리자',
    'WORK_MANAGER': '작업관리자',
    'EMPLOYEE': '작업자'
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Castoro+Titling&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    logout(); // AuthContext의 logout 함수 호출
    navigate('/login'); // 로그인 페이지로 이동
  };

  // 근태관리 페이지로 이동
  const handleAttendance = () => {
    navigate('/attendance'); // 스케줄 관리 페이지로 이동
  };

  // 로고 클릭시 홈화면으로 이동
  const handleHome = () => {
    navigate('/home');
  }

  // 사용자 프로필 이미지 가져오기
  const getUserImage = () => {
    if (!currentUser) return '/images/default_profile.png';
    return userImages[currentUser.id] || '/images/default_profile.png';
  };

  // 사용자 역할 한글로 변환
  const getUserRole = () => {
    if (!currentUser) return '';
    return roleTranslation[currentUser.role] || currentUser.role;
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src="/images/lastLogo.png" alt="BräuHaus Logo" className="logo" />
        <h2 className="castoro-titling-regular">
          <button className="castoro-titling-regular-btn" onClick={handleHome}>
            BräuHaus
          </button>
        </h2>
      </div>
      <ul>
        {/* 시스템 관리 */}
        {/* <li>
          <button onClick={() => toggleCategory("시스템관리")}>
            <RiSettings4Line className="mr-2" />
            시스템 관리
          </button>
          {openCategory === "시스템관리" && (
            <ul className="submenu">
              <li><Link to="/login">로그인/로그아웃</Link></li>
              <li><Link to="/permissions">권한 관리</Link></li>
              <li><Link to="/users">사용자 관리</Link></li>
              <li><Link to="/menu">메뉴 관리</Link></li>
            </ul>
          )}
        </li> */}

        {/* 기준정보 관리 */}
        <li>
          <button onClick={() => toggleCategory("기준정보관리")}>
            <RiDatabase2Line className="mr-2" />
            기준정보 관리
          </button>
          {openCategory === "기준정보관리" && (
            <ul className="submenu">
              <li><Link to="/workplace">작업장 정보</Link></li>
              <li><Link to="/process-stage">공정 정보</Link></li>
              <li><Link to="/equipment-info">설비 정보</Link></li>
              <li><Link to="/label-info">LABEL 정보</Link></li>
            </ul>
          )}
        </li>

        {/* 생산계획 */}
        <li>
          <button onClick={() => toggleCategory("생산계획")}>
            <AiOutlineSchedule className="mr-2" />
            생산계획
          </button>
          {openCategory === "생산계획" && (
            <ul className="submenu">
              <li><Link to="/plan-overview">생산계획 조회</Link></li>
              <li><Link to="/plan-generate">생산계획 생성</Link></li>
              <li><Link to="/material">자재 관리</Link></li>
            </ul>
          )}
        </li>

        {/* 작업지시 */}
        <li>
          <button
            onClick={() => toggleCategory("작업지시")}
            className="menu-item"
          >
            <div className="menu-item-content">
              <MdOutlineWork className="mr-4" />
              작업지시
              {workOrderMessages.length > 0 && (
                <span className="notification-badge-workorder">
                  {workOrderMessages.length}
                </span>
              )}
            </div>
          </button>
          {openCategory === "작업지시" && (
            <ul className="submenu">
              <li>
                <Link
                  to="/work/orders"
                  onClick={resetWorkOrderNotifications}
                >
                  작업지시서 관리
                </Link>
              </li>
              <li>
                <Link
                  to="/work/create"
                  onClick={resetWorkOrderNotifications}
                >
                  작업지시서 등록
                </Link>
              </li>
              <li><Link to="/attendance">생산스케줄</Link></li>
            </ul>
          )}
        </li>

        {/* 생산공정 관리 */}
        <li>
          <button onClick={() => toggleCategory("생산공정")}>
            <GiFactory className="mr-2" />
            생산공정 관리
          </button>
          {openCategory === "생산공정" && (
            <ul className="submenu">
              <li><Link to="/material-grinding">분쇄 및 원재료 투입 공정</Link></li>
              <li><Link to="/mashing-process">당화공정</Link></li>
              <li><Link to="/filtration-process">여과공정</Link></li>
              <li><Link to="/boiling-process">끓임공정</Link></li>
              <li><Link to="/cooling-process">냉각공정</Link></li>
              <li><Link to="/fermentation-details ">발효공정</Link></li>
              <li><Link to="/maturation-details">숙성공정</Link></li>
              <li><Link to="/post-maturation-filtration">숙성 후 여과공정</Link></li>
              <li><Link to="/carbonation-process">탄산조정공정</Link></li>
              <li><Link to="/packaging_and-shipment">패키징 및 출하 공정</Link></li>
            </ul>
          )}
        </li>

        {/* Routing 관리 */}
        <li>
          <button onClick={() => toggleCategory("Routing")}>
            <TbRoute className="mr-2" />
            Routing 관리
          </button>
          {openCategory === "Routing" && (
            <ul className="submenu">
              <li><Link to="/wort">끓임 공정 워트 품질 모니터링</Link></li>
              <li><Link to="/processTracking">공정 진행 현황</Link></li>
            </ul>
          )}
        </li>

        {/* 생산실적 관리 */}
        <li>
          <button onClick={() => toggleCategory("생산실적")}>
            <MdOutlineProductionQuantityLimits className="mr-2" />
            생산실적 관리
          </button>
          {openCategory === "생산실적" && (
            <ul className="submenu">
              <li><Link to="/productionPerformance">생산실적 관리</Link></li>

            </ul>
          )}
        </li>

        {/* 게시판 */}
        <li>
          <Link
            to="/board"
            onClick={resetNotifications}
            className="menu-item"
          >
            <div className="menu-item-content">
              <HiOutlineUserGroup className="mr-4" />
              <span>전사게시판</span>
              {messages.length > 0 && (
                <span className="notification-badge">{messages.length}</span>
              )}
            </div>
          </Link>
        </li>
      </ul>

      {/* 로그인한 사용자 정보 표시 영역 */}
      {currentUser && (
        <div className="sidebar-profile">
          <div className="profile-content">
            <div className="profile-image">
              <img src={getUserImage()} alt={currentUser.name} />
            </div>
            <div className="profile-details">
              <div className="profile-name">{currentUser.name}</div>
              <div className="profile-role">{getUserRole()}</div>
              <div className="profile-actions">
                <button className="profile-btn" onClick={handleLogout}>로그아웃</button>
                <button className="profile-btn" onClick={handleAttendance}>생산스케줄</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./components/login/Login";
import ProductionPlan from "./pages/productionPlan/ProductionPlan";
import WorkplacePage from "./pages/standard-information/WorkplacePage";
import './styles/App.css';
import Attendance from "./pages/attendance/Attendance";
import WorkOrder from "./pages/work/WorkOrder"
import WorkCreate from "./pages/work/WorkCreate";
import ProductionPlanSteps from "./pages/productionPlan/ProductionPlanSteps"
import ProductionPlanDetailPage from "./pages/productionPlan/ProductionPlanDetailPage";
import MaterialGrindingPage from "./pages/production-process/material-grinding/MaterialGrindingPage";
import MashingProcessPage from "./pages/production-process/mashing-process/MashingProcessPage";
import FiltrationProcessPage from "./pages/production-process/filtration-process/FiltrationProcessPage";
import ProcessTrackingPage from "./pages/routing/processTracking";
import MaterialManagementPage from "./pages/productionPlan/Material";
import BoilingProcessPage from "./pages/production-process/boiling-process/BoilingProcessPage";
import CoolingProcessPage from "./pages/production-process/cooling-process/CoolingProcessPage";
import FermentationDetailsPage from "./pages/production-process/fermentation-details/FermentationDetailsPage";
import ProcessStage from "./components/standard-information/ProcessStage";
import EquipmentInfo from "./components/standard-information/EquipmentInfo";
import LabelInfo from "./components/standard-information/LabelInfo";
import Board from "./pages/board/Board";
import BoardCreate from "./pages/board/BoardCreate"
import WortVolumePage from "./pages/routing/WortVolumePage";
import BoardDetail from "./pages/board/BoardDetail";
import { WebsocketProvider } from './common/WebSocket/WebsocketContext';
import ProductionPerformancePage from "./pages/productionPerformance/ProductionPerformancePage"
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext"; // 강화된 AuthProvider로 변경됨
import ProtectedRoute from "./components/login/ProtectedRoute";
import AccessDenied from "./pages/AccessDenied";
import MaturationPage from "./pages/production-process/maturation-detail/MaturationPage";
import PostMaturationFiltrationPage from "./pages/production-process/postMaturation-filtration/PostMaturationFiltrationPage";
import CarbonationProcessPage from "./pages/production-process/carbonation-process/CarbonationProcessPage";
import PackagingAndShipmentPage from "./pages/production-process/packaging-and-shipment/PackagingAndShipmentPage";
import SessionManager from "./components/login/SessionManager"; 

// 레이아웃 컴포넌트 - 사이드바와 헤더를 포함합니다
const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// 보호된 레이아웃 컴포넌트 - 인증 및 권한 확인 후 Layout 렌더링
const ProtectedLayout = ({ children, requiredPermission = null, excludedUsers = [], adminOnly = false }) => {
  return (
    <ProtectedRoute requiredPermission={requiredPermission} excludedUsers={excludedUsers} adminOnly={adminOnly}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

const App = () => {
  return (
    <WebsocketProvider>
      <Router>
        <AuthProvider>
          {/* 세션 관리자 컴포넌트 - 모든 페이지에 적용됩니다 */}
          <SessionManager />
          
          <Routes>
            {/* 공개 경로 */}
            <Route path="/login" element={<Login />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 보호된 경로 - 로그인 필요 */}
            <Route path="/home" element={
              <ProtectedLayout>
                <Home />
              </ProtectedLayout>
            } />

            {/* 특정 권한이 필요한 경로 */}
            <Route path="/plan-overview" element={
              <ProtectedLayout requiredPermission="production.read">
                <ProductionPlan />
              </ProtectedLayout>
            } />

            <Route path="/detail/:planId" element={
              <ProtectedLayout requiredPermission="production.read">
                <ProductionPlanDetailPage />
              </ProtectedLayout>
            } />

            <Route path="/plan-generate" element={
              <ProtectedLayout requiredPermission="production.write">
                <ProductionPlanSteps />
              </ProtectedLayout>
            } />

            {/* 기타 보호된 경로 */}
            <Route path="/processTracking" element={<ProtectedLayout><ProcessTrackingPage /></ProtectedLayout>} />
            <Route path="/wort" element={<ProtectedLayout><WortVolumePage /></ProtectedLayout>} />
            
            {/* EMP001 사용자 접근 제한 */}
            <Route path="/material" element={
              <ProtectedLayout excludedUsers={['EMP001']}>
                <MaterialManagementPage />
              </ProtectedLayout>
            } />
            
            <Route path="/attendance" element={<ProtectedLayout><Attendance /></ProtectedLayout>} />
            <Route path="/work/orders" element={<ProtectedLayout requiredPermission="work.read"><WorkOrder /></ProtectedLayout>} />
            <Route path="/work/create" element={<ProtectedLayout requiredPermission="work.write"><WorkCreate /></ProtectedLayout>} />
            
            {/* admin 사용자만 접근 가능한 페이지들 */}
            <Route path="/workplace" element={
              <ProtectedLayout adminOnly={true}>
                <WorkplacePage />
              </ProtectedLayout>
            } />
            
            <Route path="/process-stage" element={
              <ProtectedLayout adminOnly={true}>
                <ProcessStage />
              </ProtectedLayout>
            } />
            
            <Route path="/equipment-info" element={
              <ProtectedLayout adminOnly={true}>
                <EquipmentInfo />
              </ProtectedLayout>
            } />
            
            <Route path="/label-info" element={
              <ProtectedLayout adminOnly={true}>
                <LabelInfo />
              </ProtectedLayout>
            } />
            
            <Route path="/material-grinding" element={<ProtectedLayout><MaterialGrindingPage /></ProtectedLayout>} />
            <Route path="/mashing-process" element={<ProtectedLayout><MashingProcessPage /></ProtectedLayout>} />
            <Route path="/filtration-process" element={<ProtectedLayout><FiltrationProcessPage /></ProtectedLayout>} />
            <Route path="/productionPerformance" element={<ProtectedLayout><ProductionPerformancePage /></ProtectedLayout>} />
            <Route path="/board" element={<ProtectedLayout><Board /></ProtectedLayout>} />
            <Route path="/board-create" element={<ProtectedLayout><BoardCreate /></ProtectedLayout>} />
            <Route path="/board/:boardId" element={<ProtectedLayout><BoardDetail /></ProtectedLayout>} />
            <Route path="/maturation-details" element={<ProtectedLayout><MaturationPage /></ProtectedLayout>} />
            <Route path="/post-maturation-filtration" element={<ProtectedLayout><PostMaturationFiltrationPage /></ProtectedLayout>} />
            <Route path="/carbonation-process" element={<ProtectedLayout><CarbonationProcessPage /></ProtectedLayout>} />
            <Route path="/packaging_and-shipment" element={<ProtectedLayout><PackagingAndShipmentPage /></ProtectedLayout>} />
            <Route path="/boiling-process" element={<ProtectedLayout><BoilingProcessPage /></ProtectedLayout>} />
            <Route path="/cooling-process" element={<ProtectedLayout><CoolingProcessPage /></ProtectedLayout>} />
            <Route path="/fermentation-details" element={<ProtectedLayout><FermentationDetailsPage /></ProtectedLayout>} />

            {/* 404 페이지 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </WebsocketProvider>
  );
};

export default App;
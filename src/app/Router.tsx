import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import MobileApp from './MobileApp';
import { DashboardRoutes } from './dashboard/DashboardRoutes';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MobileApp />} />
        <Route path="/dashboard/*" element={<DashboardRoutes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

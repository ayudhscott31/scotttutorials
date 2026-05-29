import { Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { PlatformsPage } from './pages/PlatformsPage';
import { SectionsPage } from './pages/SectionsPage';
import { TutorialsPage } from './pages/TutorialsPage';

export function DashboardRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHomePage />} />
          <Route path="platforms" element={<PlatformsPage />} />
          <Route path="sections" element={<SectionsPage />} />
          <Route path="tutorials" element={<TutorialsPage />} />
          <Route path="profiles" element={<Navigate to="/dashboard/sections" replace />} />
          <Route path="categories" element={<Navigate to="/dashboard/sections" replace />} />
          <Route path="mobile-preview" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

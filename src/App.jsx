import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Dashboard from './pages/dashboard/Dashboard';

import MembersPage from './pages/members/MembersPage';
import AttendancePage from './pages/attendance/AttendancePage';
import TithesPage from './pages/tithes/TithesPage';
import WelfarePage from './pages/welfare/WelfarePage';
import ReportsPage from './pages/reports/ReportsPage';

import DashboardLayout from './components/layout/DashboardLayout';

import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC ROUTES */}

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MembersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AttendancePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tithes"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TithesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/welfare"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WelfarePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ReportsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Dashboard from './pages/dashboard/Dashboard';
import MembersPage from './pages/members/MembersPage';
import AttendancePage from './pages/attendance/AttendancePage';
import TithesPage from './pages/tithes/TithesPage';
import WelfarePage from './pages/welfare/WelfarePage';
import ReportsPage from './pages/reports/ReportsPage';
import OfferingPage from './pages/offerings/OfferingPage';
import AccountsPage from './pages/accounts/AccountsPage';

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
        {[
          { path: '/dashboard',  El: Dashboard },
          { path: '/members',    El: MembersPage },
          { path: '/attendance', El: AttendancePage },
          { path: '/tithes',     El: TithesPage },
          { path: '/welfare',    El: WelfarePage },
          { path: '/offerings',  El: OfferingPage },
          { path: '/reports',    El: ReportsPage },
          { path: '/accounts',   El: AccountsPage },
        ].map(({ path, El }) => (
          <Route key={path} path={path} element={
            <ProtectedRoute>
              <DashboardLayout>
                <El />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        ))}

      </Routes>
    </BrowserRouter>
  );
}

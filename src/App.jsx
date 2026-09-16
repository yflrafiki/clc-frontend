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

const PROTECTED = [
  { path: '/dashboard',  El: Dashboard      },
  { path: '/members',    El: MembersPage    },
  { path: '/attendance', El: AttendancePage },
  { path: '/tithes',     El: TithesPage     },
  { path: '/welfare',    El: WelfarePage    },
  { path: '/offerings',  El: OfferingPage   },
  { path: '/accounts',   El: AccountsPage   },
  { path: '/reports',    El: ReportsPage    },
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {PROTECTED.map(({ path, El }) => (
          <Route key={path} path={path} element={
            <ProtectedRoute path={path}>
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

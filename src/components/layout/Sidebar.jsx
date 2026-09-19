import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Landmark,
  LayoutDashboard,
  ClipboardList,
  ChartColumn,
  X,
  LogOut,
  Printer,
  Users,
  HeartHandshake,
  HandCoins,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ALL_NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, active: 'bg-[#c59a5a]', roles: [1, 2, 3, 4] },
  { to: '/members', label: 'Members', Icon: Users, active: 'bg-[#4d6c8b]', roles: [1, 2] },
  { to: '/attendance', label: 'Attendance', Icon: ClipboardList, active: 'bg-[#a85d48]', roles: [2] },
  { to: '/tithes', label: 'Tithes', Icon: HandCoins, active: 'bg-[#b86442]', roles: [3] },
  { to: '/welfare', label: 'Welfare', Icon: HeartHandshake, active: 'bg-[#2e4a3d]', roles: [3] },
  { to: '/offerings', label: 'Offerings', Icon: Wallet, active: 'bg-[#6f5aa6]', roles: [1, 3] },
  { to: '/accounts', label: 'Accounts', Icon: Landmark, active: 'bg-[#33556e]', roles: [1, 3, 4] },
  { to: '/prints', label: 'Prints', Icon: Printer, active: 'bg-[#5a8a6e]', roles: [3] },
  { to: '/reports', label: 'Reports', Icon: ChartColumn, active: 'bg-[#7c5a7a]', roles: [1, 4] },
];

const ROLE_LABELS = { 1: 'Admin', 2: 'Members Dept', 3: 'Finance Dept', 4: 'Assistant' };
const BG_PATTERN = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

export default function Sidebar({ onClose }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleId = user?.role_id;
  const navItems = ALL_NAV.filter(item => item.roles.includes(roleId));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-full min-h-screen w-64 flex-col border-r border-[#d9c5a6]/20 bg-[#1f2d3d] text-[#f8f5f1] shadow-[12px_0_40px_rgba(31,45,61,0.18)]">
      <div className="relative overflow-hidden border-b border-[#f4e8d5]/10 bg-[#223245] px-5 py-6">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: BG_PATTERN }}></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c59a5a] shadow-[0_10px_25px_rgba(197,154,90,0.35)]">
              <Landmark className="text-sm text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-white">LifeWay Church</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#e7d8bf]">Church RMS</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#f8f5f1]/60 transition hover:text-white lg:hidden">
            <X className="text-lg" />
          </button>
        </div>
      </div>

      {user && (
        <div className="border-b border-[#f4e8d5]/10 bg-[#1d2b3a] px-5 py-3">
          <p className="truncate text-xs text-[#f5d7b4]">{user.full_name}</p>
          <span className="mt-1 inline-block rounded-full border border-[#d8b384]/20 bg-[#d8b384]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#f8e9d5]">
            {ROLE_LABELS[user.role_id] || 'User'}
          </span>
        </div>
      )}

      <nav className="flex-1 space-y-1.5 px-3 py-4">
        {navItems.map(({ to, label, Icon, active }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? `${active} text-white shadow-[0_12px_28px_rgba(15,23,42,0.22)]`
                  : 'text-[#e9dfd1] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="flex-shrink-0 text-base" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-[#f1e7dc] transition hover:border-[#b86442]/20 hover:bg-[#b86442]/15 hover:text-white"
        >
          <LogOut className="text-base" />
          Logout
        </button>
      </div>

      <div className="border-t border-[#f4e8d5]/10 bg-[#1a2636] px-5 py-4">
        <p className="text-center text-[11px] leading-relaxed text-[#d6c2a2] italic">
          "I can do all things through Christ" — Phil 4:13
        </p>
      </div>
    </div>
  );
}

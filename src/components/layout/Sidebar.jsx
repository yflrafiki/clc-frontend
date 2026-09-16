import { Link, useLocation } from 'react-router-dom';
import { FaCross, FaUsers, FaHeart, FaHandHoldingHeart, FaUniversity } from 'react-icons/fa';
import { LuLayoutDashboard, LuClipboardList, LuChartBar, LuX } from 'react-icons/lu';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',  Icon: LuLayoutDashboard,    active: 'bg-indigo-700'  },
  { to: '/members',    label: 'Members',    Icon: FaUsers,               active: 'bg-indigo-700'  },
  { to: '/attendance', label: 'Attendance', Icon: LuClipboardList,       active: 'bg-rose-700'    },
  { to: '/tithes',     label: 'Tithes',     Icon: FaCross,               active: 'bg-amber-700'   },
  { to: '/welfare',    label: 'Welfare',    Icon: FaHeart,               active: 'bg-emerald-700' },
  { to: '/offerings',  label: 'Offerings',  Icon: FaHandHoldingHeart,    active: 'bg-violet-700'  },
  { to: '/accounts',   label: 'Accounts',   Icon: FaUniversity,          active: 'bg-slate-700'   },
  { to: '/reports',    label: 'Reports',    Icon: LuChartBar,            active: 'bg-purple-700'  },
];

const BG_PATTERN = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

export default function Sidebar({ onClose }) {
  const { pathname } = useLocation();

  return (
    <div className="w-64 h-full min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Branding */}
      <div className="relative overflow-hidden px-5 py-6 border-b border-white/10">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: BG_PATTERN }}></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center shadow">
              <FaCross className="text-white text-sm" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Christian Life Way</p>
              <p className="text-xs text-white/40 leading-tight">Church RMS</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white transition">
            <LuX className="text-lg" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, Icon, active }) => {
          const isActive = pathname === to;
          return (
            <Link key={to} to={to} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? `${active} text-white shadow` : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              <Icon className="text-base flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Scripture Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-xs text-white/30 italic text-center leading-relaxed">
          "I can do all things through Christ" — Phil 4:13
        </p>
      </div>
    </div>
  );
}

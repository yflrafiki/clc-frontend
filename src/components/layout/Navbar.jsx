import { useLocation } from 'react-router-dom';
import { FaCross } from 'react-icons/fa';
import { LuLogOut, LuBell, LuMenu } from 'react-icons/lu';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/attendance': 'Attendance',
  '/tithes': 'Tithes & Offerings',
  '/welfare': 'Welfare & Benevolence',
  '/reports': 'Reports & Exports',
};

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Church RMS';

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm">

      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition"
        >
          <LuMenu className="text-xl" />
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-7 h-7 rounded-md bg-gradient-to-br from-amber-600 to-yellow-500 items-center justify-center shadow-sm">
            <FaCross className="text-white text-xs" />
          </div>
          <div>
            <p className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium leading-none mb-0.5">Christian Life Way</p>
            <h2 className="text-sm font-bold text-gray-800 dark:text-white leading-none">{title}</h2>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Scripture pill — hidden on small screens */}
        <div className="hidden lg:flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-full px-3 py-1">
          <FaCross className="text-amber-600 text-xs" />
          <span className="text-xs text-amber-700 dark:text-amber-400 italic">"To God be the glory"</span>
        </div>

        {/* Bell */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <LuBell className="text-base" />
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm"
        >
          <LuLogOut className="text-sm" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}

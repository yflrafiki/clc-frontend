import { useLocation } from 'react-router-dom';
import { Landmark, LogOut, Bell, Menu } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/attendance': 'Attendance',
  '/tithes': 'Tithes & Offerings',
  '/welfare': 'Welfare & Benevolence',
  '/prints': 'Finance Prints',
  '/reports': 'Reports & Exports',
};

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Church RMS';

  return (
    <div className="sticky top-0 z-10 border-b border-[#eadcc5] bg-[#f8f3ee]/90 px-4 py-3 backdrop-blur-sm md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9c5a6] bg-white text-[#2f4054] transition hover:border-[#b86442] hover:text-[#b86442] lg:hidden"
          >
            <Menu className="text-xl" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-[#c59a5a] text-white shadow-[0_10px_20px_rgba(197,154,90,0.25)] sm:flex">
              <Landmark className="text-xs" />
            </div>
            <div>
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7c705d] sm:block">LifeWay Church</p>
              <h2 className="church-title text-2xl leading-none text-[#1f2d3d]">{title}</h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-[#e5d7be] bg-[#fffaf3] px-3 py-1.5 lg:flex">
            <Landmark className="text-[#b86442] text-[10px]" />
            <span className="text-[11px] italic text-[#5d554d]">"To God be the glory"</span>
          </div>

          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e6d6ba] bg-white text-[#5d554d] transition hover:border-[#b86442] hover:text-[#b86442]">
            <Bell className="text-base" />
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#1f2d3d] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#344a62]"
          >
            <LogOut className="text-sm" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

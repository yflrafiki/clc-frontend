import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { Landmark, Users, Heart, ChartColumn, Wallet, HandCoins, Sprout, ClipboardList, LayoutDashboard } from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import WeeklyAttendanceReport from '../../components/dashboard/WeeklyAttendanceReport';

const BG_PATTERN = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

const ALL_QUICK_LINKS = [
  { label: 'Members',    to: '/members',    Icon: Users,          color: 'from-indigo-800 to-sky-600',     roles: [1,2] },
  { label: 'Attendance', to: '/attendance', Icon: ClipboardList,  color: 'from-rose-800 to-orange-600',    roles: [2]   },
  { label: 'Tithes',     to: '/tithes',     Icon: HandCoins,      color: 'from-amber-700 to-yellow-600',   roles: [3]   },
  { label: 'Welfare',    to: '/welfare',    Icon: Heart,         color: 'from-emerald-800 to-teal-600',   roles: [3]   },
  { label: 'Offerings',  to: '/offerings',  Icon: Wallet,        color: 'from-violet-800 to-purple-600',  roles: [1,3] },
  { label: 'Accounts',   to: '/accounts',   Icon: Landmark,      color: 'from-slate-700 to-zinc-600',     roles: [1,3] },
  { label: 'Reports',    to: '/reports',    Icon: ChartColumn,   color: 'from-violet-800 to-fuchsia-600', roles: [1,4] },
];

export default function Dashboard() {
  const { user } = useAuth();
  const roleId = user?.role_id;
  const isFinanceOrAdmin = roleId === 1 || roleId === 3;

  const day = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);

  useEffect(() => {
    API.get('/dashboard')
      .then(res => { setStats(res.data); setMonthly(res.data.monthly || []); })
      .catch(() => {});
  }, []);

  const cedi = (v) => `GH₵ ${Number(v || 0).toLocaleString()}`;

  const ALL_STATS = [
    { label: 'Total Members',         value: stats ? stats.total_members : '—',          Icon: Users,           bg: 'from-indigo-50 to-blue-50',   border: 'border-indigo-200',  text: 'text-indigo-800',  roles: [1,2,3,4] },
    { label: 'Weekly Attendance',     value: stats ? stats.weekly_attendance : '—',      Icon: ClipboardList,   bg: 'from-rose-50 to-red-50',      border: 'border-rose-200',    text: 'text-rose-800',    roles: [2,3,4]   },
    { label: 'Total Tithes',          value: stats ? cedi(stats.total_tithes) : '—',     Icon: HandCoins,       bg: 'from-amber-50 to-yellow-50',  border: 'border-amber-200',   text: 'text-amber-800',   roles: [1,3]     },
    { label: 'Welfare Contributions', value: stats ? cedi(stats.total_welfare) : '—',    Icon: Heart,           bg: 'from-emerald-50 to-teal-50',  border: 'border-emerald-200', text: 'text-emerald-800', roles: [1,3]     },
    { label: 'Total Offerings',       value: stats ? cedi(stats.total_offering) : '—',   Icon: Wallet,          bg: 'from-violet-50 to-purple-50', border: 'border-violet-200',  text: 'text-violet-800',  roles: [1]       },
    { label: 'Total Donations',       value: stats ? cedi(stats.total_donation) : '—',   Icon: Landmark,        bg: 'from-blue-50 to-sky-50',      border: 'border-blue-200',    text: 'text-blue-800',    roles: [1]       },
    { label: 'Total Seeds',           value: stats ? cedi(stats.total_seed) : '—',       Icon: Sprout,          bg: 'from-green-50 to-emerald-50', border: 'border-green-200',   text: 'text-green-800',   roles: [1]       },
  ];

  const visibleStats = ALL_STATS.filter(s => s.roles.includes(roleId));
  const quickLinks = ALL_QUICK_LINKS.filter(l => l.roles.includes(roleId));

  return (
    <div className="space-y-6">

      <div className="relative overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-[#f8f3ee] p-6 shadow-[var(--church-shadow)] md:p-8">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(120deg, rgba(197,154,90,0.10) 0%, rgba(184,100,66,0.08) 36%, transparent 100%)' }}></div>
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d9c5a6] bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d5d55]">
              <Landmark className="text-[#b86442]" />
              Church Record Management
            </div>
            <h1 className="church-title text-4xl text-[#223042] md:text-5xl">Welcome, {user?.full_name}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#63594f] md:text-base">
              "I was glad when they said to me, Let us go to the house of the Lord" — Psalm 122:1
            </p>
          </div>

          <div className="rounded-[20px] border border-[#e7d9bd] bg-[#fffaf4] px-4 py-3 text-left shadow-sm md:min-w-[200px] md:text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#7d6a5d]">Today</p>
            <p className="church-title mt-1 text-2xl text-[#1f2d3d]">{day}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleStats.map(({ label, value, Icon, bg, border, text }) => (
          <div key={label} className={`rounded-[20px] border ${border} bg-white/80 p-5 shadow-[0_12px_30px_rgba(31,45,61,0.04)]`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bg}`}>
                <Icon className={`text-xl ${text}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl font-bold ${text}`}>{value}</p>
                <p className={`text-[11px] font-medium uppercase tracking-[0.08em] ${text} opacity-75`}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {roleId === 1 && <WeeklyAttendanceReport />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {isFinanceOrAdmin && (
          <div className="lg:col-span-2 rounded-[24px] border border-[#e7d9bd] bg-white/90 p-5 shadow-[var(--church-shadow)]">
            <div className="mb-4 flex items-center gap-2">
              <Landmark className="text-[#b86442]" />
              <h2 className="church-title text-3xl text-[#1f2d3d]">Tithes & Welfare Overview</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthly} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eadcc5" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5d554d' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#5d554d' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '1px solid #eadcc5', boxShadow: '0 12px 30px rgba(31,45,61,0.08)' }}
                  formatter={(value) => [`GH₵ ${value.toLocaleString()}`, undefined]}
                />
                <Bar dataKey="Tithes" fill="#b86442" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Welfare" fill="#2e4a3d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.12em]">
              <span className="flex items-center gap-2 text-[#a35c38]"><span className="h-3 w-3 rounded-sm bg-[#b86442]"></span> Tithes</span>
              <span className="flex items-center gap-2 text-[#2e4a3d]"><span className="h-3 w-3 rounded-sm bg-[#2e4a3d]"></span> Welfare</span>
            </div>
          </div>
        )}

        <div className={`rounded-[24px] border border-[#e7d9bd] bg-[#f9f3eb] p-5 shadow-[var(--church-shadow)] ${!isFinanceOrAdmin ? 'lg:col-span-3' : ''}`}>
          <div className="mb-4 flex items-center gap-2">
            <LayoutDashboard className="text-[#1f2d3d]" />
            <h2 className="church-title text-3xl text-[#1f2d3d]">Quick Access</h2>
          </div>
          <div className="space-y-2.5">
            {quickLinks.map(({ label, to, Icon, color }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-3 rounded-2xl border border-[#e7d9bd] bg-white px-4 py-3 text-sm font-semibold text-[#233245] shadow-sm transition hover:-translate-y-0.5 hover:border-[#b86442] hover:text-[#b86442]`}>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color} text-white`}><Icon className="text-sm" /></span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#e7d9bd] bg-[#1f2d3d] p-5 text-center text-[#f4efe8] shadow-[var(--church-shadow)]">
        <p className="text-base italic opacity-90">"For where two or three gather in my name, there am I with them" — Matthew 18:20</p>
      </div>
    </div>
  );
}

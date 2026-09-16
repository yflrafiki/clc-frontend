import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { FaCross, FaUsers, FaHeart, FaChartBar, FaHandHoldingHeart, FaUniversity, FaSeedling } from 'react-icons/fa';
import { LuClipboardList, LuLayoutDashboard } from 'react-icons/lu';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const BG_PATTERN = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

const ALL_QUICK_LINKS = [
  { label: 'Members',    to: '/members',    Icon: FaUsers,            color: 'from-indigo-800 to-sky-600',     roles: [1,2] },
  { label: 'Attendance', to: '/attendance', Icon: LuClipboardList,    color: 'from-rose-800 to-orange-600',    roles: [2]   },
  { label: 'Tithes',     to: '/tithes',     Icon: FaCross,            color: 'from-amber-700 to-yellow-600',   roles: [3]   },
  { label: 'Welfare',    to: '/welfare',    Icon: FaHeart,            color: 'from-emerald-800 to-teal-600',   roles: [3]   },
  { label: 'Offerings',  to: '/offerings',  Icon: FaHandHoldingHeart, color: 'from-violet-800 to-purple-600',  roles: [1,3] },
  { label: 'Accounts',   to: '/accounts',   Icon: FaUniversity,       color: 'from-slate-700 to-zinc-600',     roles: [1,3] },
  { label: 'Reports',    to: '/reports',    Icon: FaChartBar,         color: 'from-violet-800 to-fuchsia-600', roles: [1,4] },
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
    { label: 'Total Members',         value: stats ? stats.total_members : '—',          Icon: FaUsers,            bg: 'from-indigo-50 to-blue-50',   border: 'border-indigo-200',  text: 'text-indigo-800',  roles: [1,2,3,4] },
    { label: 'Weekly Attendance',     value: stats ? stats.weekly_attendance : '—',      Icon: LuClipboardList,    bg: 'from-rose-50 to-red-50',      border: 'border-rose-200',    text: 'text-rose-800',    roles: [2,3,4]   },
    { label: 'Total Tithes',          value: stats ? cedi(stats.total_tithes) : '—',     Icon: FaCross,            bg: 'from-amber-50 to-yellow-50',  border: 'border-amber-200',   text: 'text-amber-800',   roles: [1,3]     },
    { label: 'Welfare Contributions', value: stats ? cedi(stats.total_welfare) : '—',    Icon: FaHeart,            bg: 'from-emerald-50 to-teal-50',  border: 'border-emerald-200', text: 'text-emerald-800', roles: [1,3]     },
    { label: 'Total Offerings',       value: stats ? cedi(stats.total_offering) : '—',   Icon: FaHandHoldingHeart, bg: 'from-violet-50 to-purple-50', border: 'border-violet-200',  text: 'text-violet-800',  roles: [1]       },
    { label: 'Total Donations',       value: stats ? cedi(stats.total_donation) : '—',   Icon: FaUniversity,       bg: 'from-blue-50 to-sky-50',      border: 'border-blue-200',    text: 'text-blue-800',    roles: [1]       },
    { label: 'Total Seeds',           value: stats ? cedi(stats.total_seed) : '—',       Icon: FaSeedling,         bg: 'from-green-50 to-emerald-50', border: 'border-green-200',   text: 'text-green-800',   roles: [1]       },
  ];

  const visibleStats = ALL_STATS.filter(s => s.roles.includes(roleId));
  const quickLinks = ALL_QUICK_LINKS.filter(l => l.roles.includes(roleId));

  return (
    <div className="space-y-6">

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: BG_PATTERN }}></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaCross className="text-xl" />
              <span className="text-xs font-semibold uppercase tracking-widest opacity-70">Church Record Management</span>
            </div>
            <h1 className="text-3xl font-bold">Welcome, {user?.full_name}</h1>
            <p className="text-sm opacity-70 mt-1">"I was glad when they said to me, Let us go to the house of the Lord" — Psalm 122:1</p>
          </div>
          <div className="bg-white/10 rounded-xl px-5 py-3 text-right">
            <p className="text-xs opacity-60 uppercase tracking-wide">Today</p>
            <p className="text-sm font-semibold">{day}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {visibleStats.map(({ label, value, Icon, bg, border, text }) => (
          <div key={label} className={`bg-gradient-to-br ${bg} border ${border} rounded-xl p-5`}>
            <div className="flex items-center gap-3">
              <Icon className={`text-2xl ${text}`} />
              <div>
                <p className={`text-xl font-bold ${text}`}>{value}</p>
                <p className={`text-xs font-medium ${text} opacity-70`}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Bar Chart — finance/admin only */}
        {isFinanceOrAdmin && (
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaCross className="text-amber-600" />
              <h2 className="font-semibold text-gray-700 dark:text-white text-sm">Tithes & Welfare Overview</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthly} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`GH₵ ${value.toLocaleString()}`, undefined]}
                />
                <Bar dataKey="Tithes" fill="#b45309" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Welfare" fill="#065f46" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-xs text-amber-700"><span className="w-3 h-3 rounded-sm bg-amber-700 inline-block"></span> Tithes</span>
              <span className="flex items-center gap-1 text-xs text-emerald-800"><span className="w-3 h-3 rounded-sm bg-emerald-800 inline-block"></span> Welfare</span>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 ${!isFinanceOrAdmin ? 'md:col-span-3' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <LuLayoutDashboard className="text-indigo-600" />
            <h2 className="font-semibold text-gray-700 dark:text-white text-sm">Quick Access</h2>
          </div>
          <div className="space-y-2">
            {quickLinks.map(({ label, to, Icon, color }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-3 bg-gradient-to-r ${color} text-white px-4 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition`}>
                <Icon /> {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Scripture Footer */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 rounded-xl p-5 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: BG_PATTERN }}></div>
        <p className="relative text-sm italic opacity-80">"For where two or three gather in my name, there am I with them" — Matthew 18:20</p>
      </div>
    </div>
  );
}

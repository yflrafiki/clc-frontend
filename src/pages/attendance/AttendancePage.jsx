import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FaUsers } from 'react-icons/fa';
import { LuClipboardList, LuUserCheck, LuClock, LuSearch, LuCircleCheck } from 'react-icons/lu';

export default function AttendancePage() {
  const [members, setMembers] = useState([]);
  const [marked, setMarked] = useState(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try { const res = await API.get('/members'); setMembers(res.data); } catch {}
  };

  const markAttendance = async (memberId) => {
    try {
      await API.post('/attendance', { member_id: memberId });
      setMarked((prev) => new Set(prev).add(memberId));
      toast.success('Attendance marked — God bless!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const filtered = members.filter((m) =>
    m.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-rose-800 via-red-700 to-orange-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <LuClipboardList className="text-xl" />
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Service Attendance</span>
          </div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-sm opacity-80 mt-1">"Not giving up meeting together" — Hebrews 10:25</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: members.length, Icon: FaUsers, bg: 'from-rose-50 to-red-50', border: 'border-rose-200', text: 'text-rose-800' },
          { label: 'Marked Present', value: marked.size, Icon: LuUserCheck, bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-800' },
          { label: 'Not Yet Marked', value: members.length - marked.size, Icon: LuClock, bg: 'from-orange-50 to-amber-50', border: 'border-orange-200', text: 'text-orange-800' },
        ].map(({ label, value, Icon, bg, border, text }) => (
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

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-rose-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-rose-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <LuClipboardList className="text-rose-600" />
            <div>
              <h2 className="font-semibold text-gray-700 dark:text-white text-sm">Today's Roll Call</h2>
              <p className="text-xs text-gray-400">{today}</p>
            </div>
          </div>
          <div className="relative">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 border border-gray-200 dark:border-gray-600 rounded-lg pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="divide-y divide-rose-50 dark:divide-gray-700">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <LuClipboardList className="text-4xl" />
                <p className="text-sm">No members found.</p>
              </div>
            </div>
          ) : filtered.map((member) => {
            const isMarked = marked.has(member.id);
            return (
              <div key={member.id} className={`flex items-center justify-between px-5 py-4 transition ${
                isMarked ? 'bg-green-50 dark:bg-green-900/10' : 'hover:bg-rose-50 dark:hover:bg-gray-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    isMarked ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {member.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{member.full_name}</p>
                    <p className="text-xs text-gray-400">{member.membership_id || 'No ID'}</p>
                  </div>
                </div>
                {isMarked ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <LuCircleCheck /> Present
                  </span>
                ) : (
                  <button
                    onClick={() => markAttendance(member.id)}
                    className="bg-gradient-to-r from-rose-800 to-orange-600 hover:from-rose-900 hover:to-orange-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition shadow"
                  >
                    Mark Present
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

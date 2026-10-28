import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CalendarDays, ChevronLeft, ChevronRight, UserCheck, UserPlus, UserRoundX, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import API from '../../api/axios';

const shiftWeek = (date, weeks) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return d.toISOString().split('T')[0];
};

const formatDate = (date, options) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', ...options });

const navButton = 'flex h-9 w-9 items-center justify-center rounded-xl border border-[#e6d9c3] bg-white text-[#1f2d3d] transition hover:border-[#b86442] hover:text-[#b86442] disabled:cursor-not-allowed disabled:opacity-40';
const headCell = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d5d55]';
const bodyCell = 'px-4 py-2.5 text-sm text-[#1f2d3d]';

// Admin dashboard: the latest Sunday's attendance, with earlier Sundays one click away
export default function WeeklyAttendanceReport() {
  const [date, setDate] = useState('');
  const [report, setReport] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    API.get('/reports/weekly-attendance', { params: date ? { date } : {} })
      .then(({ data }) => { if (!cancelled) { setReport(data); setFailed(false); } })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [date]);

  if (!report) {
    return (
      <div className="rounded-[24px] border border-[#e7d9bd] bg-white/90 p-6 text-sm text-[#7d6a5d] shadow-[var(--church-shadow)]">
        {failed ? 'The weekly attendance report could not be loaded. Refresh the page to try again.' : 'Loading weekly attendance…'}
      </div>
    );
  }

  const change = report.membersPresent - report.previousMembersPresent;
  const hasData = report.membersPresent > 0 || report.visitors > 0;
  const trend = report.trend.map((t) => ({
    ...t,
    label: formatDate(t.date, { day: 'numeric', month: 'short' }),
    Members: t.members,
    Visitors: t.visitors,
  }));

  return (
    <div className="space-y-4 rounded-[24px] border border-[#e7d9bd] bg-white/90 p-5 shadow-[var(--church-shadow)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-[#b86442]" />
          <div>
            <h2 className="church-title text-3xl text-[#1f2d3d]">Sunday Attendance</h2>
            <p className="text-sm text-[#6d5d55]">
              {formatDate(report.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {report.isCurrentWeek && ' · latest'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className={navButton} onClick={() => setDate(shiftWeek(report.date, -1))} aria-label="Previous Sunday">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className={navButton} onClick={() => setDate(shiftWeek(report.date, 1))} disabled={report.isCurrentWeek} aria-label="Next Sunday">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[18px] border border-[#d8e4d8] bg-[#edf4ef] p-4">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#2e4a3d]">
            <UserCheck className="h-4 w-4" /> Members present
          </div>
          <p className="mt-1 text-2xl font-bold text-[#2e4a3d]">
            {report.membersPresent} <span className="text-base font-semibold opacity-70">/ {report.activeMembers}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[#3f5a4c]">
            {report.attendanceRate}% ·
            {change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {change >= 0 ? '+' : ''}{change} vs previous Sunday
          </p>
        </div>
        <div className="rounded-[18px] border border-[#e6d9c3] bg-[#f9f1eb] p-4">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1f2d3d]">
            <UserPlus className="h-4 w-4" /> Visitors
          </div>
          <p className="mt-1 text-2xl font-bold text-[#1f2d3d]">{report.visitors}</p>
          <p className="mt-0.5 text-xs text-[#5d554d]">{report.firstTimers.length} first time</p>
        </div>
        <div className="rounded-[18px] border border-[#ecd9b8] bg-[#f8f1e7] p-4">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a5f2d]">
            <UserRoundX className="h-4 w-4" /> Absent
          </div>
          <p className="mt-1 text-2xl font-bold text-[#8a5f2d]">{report.absent.length}</p>
          <p className="mt-0.5 text-xs text-[#8a5f2d]">active members</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6d5d55]">Last 8 Sundays · click a bar to open that Sunday</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trend} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eadcc5" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#5d554d' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5d554d' }} axisLine={false} tickLine={false} width={32} />
            <Tooltip cursor={{ fill: 'rgba(197,154,90,0.12)' }} contentStyle={{ borderRadius: '16px', border: '1px solid #eadcc5', boxShadow: '0 12px 30px rgba(31,45,61,0.08)' }} />
            <Bar dataKey="Members" fill="#2e4a3d" radius={[6, 6, 0, 0]} className="cursor-pointer" onClick={(_, index) => setDate(trend[index].date)} />
            <Bar dataKey="Visitors" fill="#c59a5a" radius={[6, 6, 0, 0]} className="cursor-pointer" onClick={(_, index) => setDate(trend[index].date)} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.12em]">
          <span className="flex items-center gap-2 text-[#2e4a3d]"><span className="h-3 w-3 rounded-sm bg-[#2e4a3d]"></span> Members</span>
          <span className="flex items-center gap-2 text-[#8a5f2d]"><span className="h-3 w-3 rounded-sm bg-[#c59a5a]"></span> Visitors</span>
        </div>
      </div>

      {!hasData ? (
        <p className="rounded-2xl border border-dashed border-[#e6d9c3] px-4 py-8 text-center text-sm text-[#7d6a5d]">
          No check-ins were recorded for this Sunday. Members appear here once they scan the QR code or the front desk marks them present.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-[#efe4d5]">
            <table className="w-full min-w-[480px]">
              <thead className="bg-[#faf5ef]">
                <tr>
                  <th className={headCell}>Service</th>
                  <th className={headCell}>Members</th>
                  <th className={headCell}>By QR</th>
                  <th className={headCell}>At desk</th>
                  <th className={headCell}>Visitors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e7db]">
                {report.services.map((s) => (
                  <tr key={s.name}>
                    <td className={`${bodyCell} font-semibold`}>{s.name}</td>
                    <td className={bodyCell}>{s.members}</td>
                    <td className={bodyCell}>{s.qr}</td>
                    <td className={bodyCell}>{s.desk}</td>
                    <td className={bodyCell}>{s.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="min-w-0 overflow-hidden rounded-2xl border border-[#efe4d5]">
              <p className="border-b border-[#efe4d5] bg-[#faf5ef] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6d5d55]">
                First-time visitors to follow up ({report.firstTimers.length})
              </p>
              <div className="max-h-72 divide-y divide-[#f0e7db] overflow-y-auto">
                {report.firstTimers.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-[#7d6a5d]">No first-time visitors this Sunday.</p>
                ) : report.firstTimers.map((v) => (
                  <div key={v.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1f2d3d]">{v.full_name}</p>
                      <p className="text-xs text-[#7d6a5d]">{v.service}</p>
                    </div>
                    <span className="shrink-0 text-sm text-[#1f2d3d]">{v.phone_number || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-[#efe4d5]">
              <p className="border-b border-[#efe4d5] bg-[#faf5ef] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6d5d55]">
                Members absent ({report.absent.length})
              </p>
              <div className="max-h-72 divide-y divide-[#f0e7db] overflow-y-auto">
                {report.absent.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-[#7d6a5d]">Every active member was present.</p>
                ) : report.absent.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1f2d3d]">{m.full_name}</p>
                      <p className="text-xs text-[#7d6a5d]">{m.membership_id || 'No ID'}</p>
                    </div>
                    <span className="shrink-0 text-sm text-[#1f2d3d]">{m.phone_number || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Users, ClipboardList, UserCheck, Clock3, Search, CircleCheckBig, QrCode, UserPlus, Copy, ExternalLink } from 'lucide-react';
import { useMembers } from '../../context/MembersContext';
import { checkInUrl } from '../checkin/checkInUrl';

const REFRESH_MS = 20000;

const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';

export default function AttendancePage() {
  const { members, fetchMembers } = useMembers();
  const [todayData, setTodayData] = useState({ services: [], members: [], visitors: [] });
  const [service, setService] = useState('');
  const [search, setSearch] = useState('');

  const loadToday = useCallback(async () => {
    try {
      const { data } = await API.get('/attendance/today');
      setTodayData(data);
      setService((current) => current || data.services[0] || '');
    } catch {
      // keep showing the last loaded list; the next refresh will retry
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    const first = setTimeout(loadToday, 0);
    const timer = setInterval(loadToday, REFRESH_MS);
    return () => { clearTimeout(first); clearInterval(timer); };
  }, [fetchMembers, loadToday]);

  const markAttendance = async (memberId) => {
    try {
      await API.post('/attendance', { member_id: memberId, service });
      toast.success('Attendance marked — God bless!');
      loadToday();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl());
      toast.success('Check-in link copied');
    } catch {
      toast.error('Could not copy. The link is shown under the code.');
    }
  };

  const checkIns = todayData.members.filter((r) => r.service === service);
  const checkInByMember = new Map(checkIns.map((r) => [r.member_id, r]));
  const visitors = todayData.visitors.filter((v) => v.service === service);
  const firstTimers = visitors.filter((v) => v.first_time).length;

  const filtered = members.filter((m) =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.membership_id?.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-[#fffaf4] p-6 shadow-[var(--church-shadow)] md:p-8">
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(115deg, rgba(184,100,66,0.08) 0%, rgba(197,154,90,0.08) 32%, transparent 70%)' }}></div>
        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d9c5a6] bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d5d55]">
              <ClipboardList className="text-[#b86442]" />
              Service Attendance
            </div>
            <h1 className="church-title text-4xl text-[#223042] md:text-5xl">Attendance</h1>
            <p className="mt-2 text-sm text-[#5d554d]">"Not giving up meeting together" — Hebrews 10:25</p>
          </div>
          <div className="rounded-[20px] border border-[#e7d9bd] bg-white px-4 py-3 text-left md:text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#7d6a5d]">Today</p>
            <p className="church-title mt-1 text-2xl text-[#1f2d3d]">{today}</p>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              aria-label="Service"
              className="mt-2 w-full rounded-xl border border-[#e6d9c3] bg-white px-3 py-2 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a]"
            >
              {todayData.services.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Members', value: members.length, Icon: Users, bg: 'bg-[#f9f1eb]', border: 'border-[#e6d9c3]', text: 'text-[#1f2d3d]' },
          { label: 'Members Present', value: checkIns.length, Icon: UserCheck, bg: 'bg-[#edf4ef]', border: 'border-[#d8e4d8]', text: 'text-[#2e4a3d]' },
          { label: 'Not Yet Marked', value: Math.max(members.length - checkIns.length, 0), Icon: Clock3, bg: 'bg-[#f8f1e7]', border: 'border-[#ecd9b8]', text: 'text-[#8a5f2d]' },
          { label: `Visitors (${firstTimers} new)`, value: visitors.length, Icon: UserPlus, bg: 'bg-[#f9f1eb]', border: 'border-[#e6d9c3]', text: 'text-[#1f2d3d]' },
        ].map(({ label, value, Icon, bg, border, text }) => (
          <div key={label} className={`rounded-[22px] border ${border} ${bg} p-5 shadow-[0_12px_30px_rgba(31,45,61,0.04)]`}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#b86442] shadow-sm">
                <Icon className="text-xl" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${text}`}>{value}</p>
                <p className={`text-[11px] font-medium uppercase tracking-[0.08em] ${text} opacity-80`}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5 rounded-[26px] border border-[#e7d9bd] bg-white/90 p-5 shadow-[var(--church-shadow)] sm:flex-row sm:items-center">
        <div className="mx-auto w-44 shrink-0 rounded-2xl border border-[#e6d9c3] bg-white p-1 sm:mx-0">
          <QRCodeSVG value={checkInUrl()} size={256} level="M" marginSize={4} bgColor="#ffffff" fgColor="#000000" className="h-auto w-full" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <QrCode className="text-[#b86442]" />
            <h2 className="church-title text-3xl text-[#1f2d3d]">QR Check-in</h2>
          </div>
          <p className="text-sm text-[#5d554d]">
            Members scan this code, enter their member ID and are marked present. Visitors can check in with their name and phone.
            Check-ins appear in the list below within {REFRESH_MS / 1000} seconds.
          </p>
          <p className="break-all text-xs text-[#7d6a5d]">{checkInUrl()}</p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/checkin/poster"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1f2d3d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#2a3d4f]"
            >
              <ExternalLink className="h-4 w-4" /> Open poster
            </Link>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-xl border border-[#e6d9c3] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1f2d3d] transition hover:bg-[#faf5ef]"
            >
              <Copy className="h-4 w-4" /> Copy link
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[26px] border border-[#e7d9bd] bg-white/90 shadow-[var(--church-shadow)]">
        <div className="flex flex-col gap-3 border-b border-[#efe4d5] bg-[#faf5ef] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-[#b86442]" />
            <h2 className="church-title text-3xl text-[#1f2d3d]">Today's Roll Call</h2>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7b6c]" />
            <input
              type="text"
              placeholder="Search name or member ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#e6d9c3] bg-white pl-9 pr-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20"
            />
          </div>
        </div>

        <div className="divide-y divide-[#f0e7db]">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-[#7d6a5d]">
              <div className="flex flex-col items-center gap-2">
                <ClipboardList className="text-4xl text-[#c59a5a]" />
                <p className="text-sm">No members found.</p>
              </div>
            </div>
          ) : filtered.map((member) => {
            const checkIn = checkInByMember.get(member.id);
            const isMarked = Boolean(checkIn);
            return (
              <div key={member.id} className={`flex items-center justify-between gap-4 px-5 py-4 transition ${
                isMarked ? 'bg-[#eef7f0]' : 'hover:bg-[#faf5ef]'
              }`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isMarked ? 'bg-[#dfeee3] text-[#2e4a3d]' : 'bg-[#f5dfd3] text-[#b86442]'
                  }`}>
                    {member.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1f2d3d]">{member.full_name}</p>
                    <p className="text-xs text-[#7d6a5d]">{member.membership_id || 'No ID'}</p>
                  </div>
                </div>
                {isMarked ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#dfeee3] px-3 py-1 text-xs font-semibold text-[#2e4a3d]">
                    <CircleCheckBig /> Present · {checkIn.check_in_method === 'qr' ? 'QR' : 'Desk'} {formatTime(checkIn.checked_in_at)}
                  </span>
                ) : (
                  <button
                    onClick={() => markAttendance(member.id)}
                    className="shrink-0 rounded-xl bg-[#1f2d3d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#2a3d4f]"
                  >
                    Mark Present
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-[26px] border border-[#e7d9bd] bg-white/90 shadow-[var(--church-shadow)]">
        <div className="flex items-center gap-2 border-b border-[#efe4d5] bg-[#faf5ef] px-4 py-4">
          <UserPlus className="text-[#b86442]" />
          <h2 className="church-title text-3xl text-[#1f2d3d]">Visitors Today</h2>
        </div>
        <div className="divide-y divide-[#f0e7db]">
          {visitors.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[#7d6a5d]">No visitors have checked in for {service || 'this service'} yet.</p>
          ) : visitors.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="font-semibold text-[#1f2d3d]">{v.full_name}</p>
                <p className="text-xs text-[#7d6a5d]">{v.phone_number || 'No phone'} · {formatTime(v.checked_in_at)}</p>
              </div>
              {v.first_time && (
                <span className="shrink-0 rounded-full bg-[#f8f1e7] px-3 py-1 text-xs font-semibold text-[#8a5f2d]">First time</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

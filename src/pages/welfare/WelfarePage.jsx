import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Heart, Handshake, Coins, CalendarDays, ClipboardList, Plus, X, Users } from 'lucide-react';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useMembers } from '../../context/MembersContext';

const EMPTY_FORM = { member_id: '', amount: '', purpose: '', date_paid: '' };
const PURPOSES = ['Medical', 'Bereavement', 'Education', 'Emergency', 'Other'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const formatCurrency = (value) => `GH₵ ${Number(value || 0).toLocaleString()}`;
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '—';

export default function WelfarePage() {
  const { members, fetchMembers } = useMembers();
  const [contributions, setContributions] = useState([]);
  const [paidMembers, setPaidMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('records');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchMembers(); fetchContributions(); }, [fetchMembers]);
  useEffect(() => { if (activeTab === 'paid') fetchPaidMembers(); }, [activeTab, filterMonth, filterYear]);

  const fetchContributions = async () => {
    try { const res = await API.get('/welfare'); setContributions(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  const fetchPaidMembers = async () => {
    try {
      const res = await API.get(`/welfare/paid-members?month=${filterMonth}&year=${filterYear}`);
      setPaidMembers(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    if (submitting) return;
    setSubmitting(true);
    try {
      await API.post('/welfare', { ...form, date_paid: form.date_paid || new Date() });
      toast.success('Contribution recorded — God bless the cheerful giver!');
      setForm(EMPTY_FORM);
      setShowModal(false);
      fetchContributions();
    } catch {
      toast.error('Failed to record contribution');
    } finally {
      setSubmitting(false);
    }
  };

  const totalContributed = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const thisMonth = contributions
    .filter(c => new Date(c.date_paid).getMonth() === new Date().getMonth())
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-[#fffaf4] p-6 shadow-[var(--church-shadow)] md:p-8">
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(115deg, rgba(46,74,61,0.10) 0%, rgba(197,154,90,0.08) 35%, transparent 72%)' }}></div>
        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d9c5a6] bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d5d55]">
              <Heart className="text-[#2e4a3d]" />
              Welfare & Benevolence
            </div>
            <h1 className="church-title text-4xl text-[#223042] md:text-5xl">Welfare Contributions</h1>
            <p className="mt-2 text-sm text-[#5d554d]">"Each of you should give what you have decided" — 2 Corinthians 9:7</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f2d3d] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#2a3d4f]">
            <Plus className="h-4 w-4" /> Record Contribution
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Contributed', value: `GH₵ ${totalContributed.toLocaleString()}`, Icon: Handshake, bg: 'bg-[#edf4ef]', border: 'border-[#d8e4d8]', text: 'text-[#2e4a3d]' },
          { label: 'This Month', value: `GH₵ ${thisMonth.toLocaleString()}`, Icon: CalendarDays, bg: 'bg-[#f4efe5]', border: 'border-[#e6d9c3]', text: 'text-[#8a5f2d]' },
          { label: 'Total Records', value: contributions.length, Icon: ClipboardList, bg: 'bg-[#eef3fa]', border: 'border-[#dfeaf7]', text: 'text-[#1f2d3d]' },
        ].map(({ label, value, Icon, bg, border, text }) => (
          <div key={label} className={`rounded-[22px] border ${border} ${bg} p-5 shadow-[0_12px_30px_rgba(31,45,61,0.04)]`}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#2e4a3d] shadow-sm">
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

      <div className="flex gap-2">
        <button onClick={() => setActiveTab('records')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] transition ${activeTab === 'records' ? 'bg-[#1f2d3d] text-white' : 'bg-[#f5efe7] text-[#5d554d]'}`}>
          All Records
        </button>
        <button onClick={() => setActiveTab('paid')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] transition ${activeTab === 'paid' ? 'bg-[#1f2d3d] text-white' : 'bg-[#f5efe7] text-[#5d554d]'}`}>
          <Users /> Paid Members
        </button>
      </div>

      {activeTab === 'records' && (
        <div className="overflow-hidden rounded-[26px] border border-[#e7d9bd] bg-white/90 shadow-[var(--church-shadow)]">
          <div className="flex items-center gap-2 border-b border-[#efe4d5] bg-[#faf5ef] px-5 py-4">
            <Heart className="text-[#2e4a3d]" />
            <h2 className="church-title text-3xl text-[#1f2d3d]">Recent Welfare Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f1e8] text-[#584f47] uppercase text-[10px] tracking-[0.14em]">
                <tr>
                  {['Member ID', 'Member', 'Amount', 'Purpose', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3eadf]">
                {contributions.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-[#7d6a5d]">No welfare records yet.</td></tr>
                ) : contributions.map(c => (
                  <tr key={c.id} className="hover:bg-[#faf5ef] transition">
                    <td className="px-4 py-3 text-[#8a7b6c] text-xs">{c.membership_id || '—'}</td>
                    <td className="px-4 py-3 font-medium text-[#1f2d3d]">{c.full_name}</td>
                    <td className="px-4 py-3"><span className="font-semibold text-[#2e4a3d]">GH₵ {Number(c.amount).toLocaleString()}</span></td>
                    <td className="px-4 py-3"><span className="rounded-full bg-[#e4efe7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2e4a3d]">{c.purpose || '—'}</span></td>
                    <td className="px-4 py-3 text-[#5d554d]">{c.date_paid ? new Date(c.date_paid).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'paid' && (
        <div className="overflow-hidden rounded-[26px] border border-[#e7d9bd] bg-white/90 shadow-[var(--church-shadow)]">
          <div className="flex flex-col gap-3 border-b border-[#efe4d5] bg-[#faf5ef] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Users className="text-[#2e4a3d]" />
              <h2 className="church-title text-3xl text-[#1f2d3d]">Members Who Have Paid</h2>
            </div>
            <div className="flex gap-2">
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                className="rounded-xl border border-[#e6d9c3] bg-white px-3 py-2 text-sm text-[#1f2d3d] focus:outline-none focus:ring-2 focus:ring-[#c59a5a]/20">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <input type="number" value={filterYear} onChange={e => setFilterYear(e.target.value)}
                className="w-24 rounded-xl border border-[#e6d9c3] bg-white px-3 py-2 text-sm text-[#1f2d3d] focus:outline-none focus:ring-2 focus:ring-[#c59a5a]/20" />
              <button onClick={fetchPaidMembers}
                className="rounded-xl bg-[#1f2d3d] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#2a3d4f]">Filter</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f1e8] text-[#584f47] uppercase text-[10px] tracking-[0.14em]">
                <tr>
                  {['Member ID', 'Name', 'Phone', 'Total Paid', 'Last Payment'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3eadf]">
                {paidMembers.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-[#7d6a5d]">No members paid for this period.</td></tr>
                ) : paidMembers.map(m => (
                  <tr key={m.id} className="hover:bg-[#faf5ef] transition">
                    <td className="px-4 py-3 text-[#8a7b6c] text-xs">{m.membership_id || '—'}</td>
                    <td className="px-4 py-3 font-medium text-[#1f2d3d]">{m.full_name}</td>
                    <td className="px-4 py-3 text-[#5d554d]">{m.phone_number || '—'}</td>
                    <td className="px-4 py-3"><span className="font-semibold text-[#2e4a3d]">GH₵ {Number(m.total_paid).toLocaleString()}</span></td>
                    <td className="px-4 py-3 text-[#5d554d]">{m.last_paid ? new Date(m.last_paid).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-white shadow-[var(--church-shadow)] mx-4">
            <div className="flex items-center justify-between bg-[#1f2d3d] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Heart />
                <h2 className="text-base font-semibold">Record Contribution</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Member</label>
                <select required value={form.member_id} onChange={e => setForm({ ...form, member_id: e.target.value })}
                  className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20">
                  <option value="">Select a member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name} ({m.membership_id || 'No ID'})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Amount (GH₵)</label>
                  <input type="number" required min="0" step="0.01" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Date</label>
                  <input type="date" value={form.date_paid} onChange={e => setForm({ ...form, date_paid: e.target.value })}
                    className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Purpose</label>
                <div className="grid grid-cols-3 gap-2">
                  {PURPOSES.map(p => (
                    <button type="button" key={p} onClick={() => setForm({ ...form, purpose: p })}
                      className={`rounded-xl border px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                        form.purpose === p ? 'border-[#2e4a3d] bg-[#2e4a3d] text-white' : 'border-[#e6d9c3] bg-[#faf5ef] text-[#5d554d]'
                      }`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-[#e6d9c3] bg-[#faf5ef] py-2.5 text-sm font-medium text-[#5d554d] transition hover:bg-[#f4efe8]">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 rounded-xl bg-[#1f2d3d] py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#2a3d4f] disabled:opacity-60">
                  <span className="inline-flex items-center gap-2"><Heart /> {submitting ? 'Saving...' : 'Record Contribution'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <ConfirmDialog
          message={`Record a welfare contribution of GH₵ ${Number(form.amount).toLocaleString()} for ${members.find(m => String(m.id) === String(form.member_id))?.full_name || 'this member'}?`}
          onConfirm={confirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, HandCoins, CircleDollarSign, Landmark, Sparkles } from 'lucide-react';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useMembers } from '../../context/MembersContext';

const TYPES = ['Offering', 'Donation', 'Seed'];
const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'];
const EMPTY_FORM = { type: 'Offering', amount: '', payment_method: 'Cash', date_collected: '', notes: '' };

const TYPE_STYLES = {
  Offering: { bg: 'from-[#6d5aa8] via-[#685ca8] to-[#4c4d8d]', badge: 'bg-violet-100 text-violet-700', tab: 'bg-[#6d5aa8]' },
  Donation: { bg: 'from-[#3b6a7a] via-[#4d7e95] to-[#51758a]', badge: 'bg-sky-100 text-sky-700', tab: 'bg-[#4d7e95]' },
  Seed: { bg: 'from-[#2e4a3d] via-[#3a6655] to-[#4d7d69]', badge: 'bg-emerald-100 text-emerald-700', tab: 'bg-[#2e4a3d]' },
};

export default function OfferingPage() {
  const { user } = useAuth();
  const { members, fetchMembers } = useMembers();
  const isAdmin = user?.role_id === 1;
  const [offerings, setOfferings] = useState([]);
  const [summary, setSummary] = useState([]);
  const [activeTab, setActiveTab] = useState('Offering');
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchMembers(); fetchOfferings(); fetchSummary(); }, [fetchMembers]);

  const fetchOfferings = async () => {
    try { const res = await API.get('/offerings'); setOfferings(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  const fetchSummary = async () => {
    try { const res = await API.get('/offerings/summary'); setSummary(Array.isArray(res.data) ? res.data : []); } catch {}
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
      const payload = { ...form };
      if (form.type === 'Offering') {
        delete payload.member_id;
      }

      await API.post('/offerings', payload);
      toast.success(`${form.type} recorded successfully!`);
      setForm(EMPTY_FORM);
      setShowModal(false);
      fetchOfferings();
      fetchSummary();
    } catch {
      toast.error('Failed to record');
    } finally {
      setSubmitting(false);
    }
  };

  const getTotal = (type) => summary.find(s => s.type === type)?.total || 0;
  const filtered = offerings.filter(o => o.type === activeTab);
  const style = TYPE_STYLES[activeTab];

  return (
    <div className="space-y-6">
      <div className={`relative overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-gradient-to-r ${style.bg} p-6 text-white shadow-[var(--church-shadow)] md:p-8`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255,255,255,0.25) 0%, transparent 30%), linear-gradient(135deg, rgba(197,154,90,0.15), rgba(255,255,255,0.03))' }}></div>
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f8f0e5]">
              <HandCoins className="text-[#f5d7b4]" />
              Offerings & Giving
            </div>
            <h1 className="church-title text-4xl text-white md:text-5xl">Offerings</h1>
            <p className="mt-2 text-sm text-white/80">"Each of you should give what you have decided" — 2 Cor 9:7</p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => { setForm({ ...EMPTY_FORM, type: activeTab }); setShowModal(true); }}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#1f2d3d] transition hover:bg-[#f7f0e5]"
            >
              <Plus className="h-4 w-4" /> Record {activeTab}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TYPES.map((type) => (
          <div key={type} className="rounded-[22px] border border-[#e7d9bd] bg-[#fffaf4] p-5 shadow-[0_12px_30px_rgba(31,45,61,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4e7d6] text-[#6d5aa8] shadow-sm">
                <CircleDollarSign className="text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1f2d3d]">GH₵ {Number(getTotal(type)).toLocaleString()}</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#6d5d55]">{type} Total</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] transition ${
              activeTab === type ? `${TYPE_STYLES[type].tab} text-white` : 'bg-[#f5efe7] text-[#5d554d]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-[26px] border border-[#e7d9bd] bg-white/90 shadow-[var(--church-shadow)]">
        <div className="flex items-center gap-2 border-b border-[#efe4d5] bg-[#faf5ef] px-5 py-4">
          <Landmark className="text-[#6d5aa8]" />
          <h2 className="church-title text-3xl text-[#1f2d3d]">{activeTab} Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f1e8] text-[#584f47] uppercase text-[10px] tracking-[0.14em]">
              <tr>
                {['Type', 'Amount', 'Payment Method', 'Date', 'Notes'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3eadf]">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[#7d6a5d]">No {activeTab} records yet.</td></tr>
              ) : filtered.map((o) => (
                <tr key={o.id} className="transition hover:bg-[#faf5ef]">
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${TYPE_STYLES[o.type]?.badge}`}>{o.type}</span></td>
                  <td className="px-4 py-3 font-semibold text-[#6d5aa8]">GH₵ {Number(o.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#5d554d]">{o.payment_method}</td>
                  <td className="px-4 py-3 text-[#5d554d]">{o.date_collected ? new Date(o.date_collected).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-[#7d6a5d] italic">{o.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-white shadow-[var(--church-shadow)]">
            <div className={`flex items-center justify-between bg-gradient-to-r ${TYPE_STYLES[form.type]?.bg} px-6 py-4 text-white`}>
              <div className="flex items-center gap-2">
                <HandCoins />
                <h2 className="text-base font-semibold">Record {form.type}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map(t => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => {
                        const nextType = t;
                        const nextMemberId = nextType === 'Offering' ? '' : form.member_id || '';
                        setForm({ ...form, type: nextType, member_id: nextMemberId });
                      }}
                      className={`rounded-xl border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                        form.type === t ? `${TYPE_STYLES[t].tab} text-white border-transparent` : 'border-[#e6d9c3] bg-[#faf5ef] text-[#5d554d]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {form.type !== 'Offering' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Member</label>
                  <select
                    required
                    value={form.member_id || ''}
                    onChange={(e) => setForm({ ...form, member_id: e.target.value })}
                    className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20"
                  >
                    <option value="">Select a member</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>{member.full_name} ({member.membership_id || 'No ID'})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Amount (GH₵)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Date</label>
                  <input
                    type="date"
                    required
                    value={form.date_collected}
                    onChange={e => setForm({ ...form, date_collected: e.target.value })}
                    className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setForm({ ...form, payment_method: m })}
                      className={`rounded-xl border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                        form.payment_method === m ? 'border-[#1f2d3d] bg-[#1f2d3d] text-white' : 'border-[#e6d9c3] bg-[#faf5ef] text-[#5d554d]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="resize-none rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-[#e6d9c3] bg-[#faf5ef] py-2.5 text-sm font-medium text-[#5d554d] transition hover:bg-[#f4efe8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 rounded-xl bg-gradient-to-r ${TYPE_STYLES[form.type]?.bg} py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition disabled:opacity-60`}
                >
                  {submitting ? 'Saving...' : `Save ${form.type}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <ConfirmDialog
          message={`Record a ${form.type} of GH₵ ${Number(form.amount).toLocaleString()}?`}
          onConfirm={confirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

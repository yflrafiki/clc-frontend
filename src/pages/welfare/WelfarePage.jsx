import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FaHeart, FaHandshake } from 'react-icons/fa';
import { LuCoins, LuCalendarDays, LuClipboardList, LuPlus, LuX } from 'react-icons/lu';

const EMPTY_FORM = { member_id: '', amount: '', purpose: '', date_paid: '' };
const PURPOSES = ['Medical', 'Bereavement', 'Education', 'Emergency', 'Other'];

export default function WelfarePage() {
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { fetchMembers(); fetchContributions(); }, []);

  const fetchMembers = async () => {
    try { const res = await API.get('/members'); setMembers(res.data); } catch {}
  };

  const fetchContributions = async () => {
    try { const res = await API.get('/welfare'); setContributions(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/welfare', { ...form, date_paid: form.date_paid || new Date() });
      toast.success('Contribution recorded — God bless the cheerful giver!');
      setForm(EMPTY_FORM);
      setShowModal(false);
      fetchContributions();
    } catch {
      toast.error('Failed to record contribution');
    }
  };

  const totalContributed = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const thisMonth = contributions
    .filter((c) => new Date(c.date_paid).getMonth() === new Date().getMonth())
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const getMemberName = (id) => members.find((m) => m.id === id)?.full_name || '—';

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-800 via-green-700 to-teal-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaHeart className="text-xl" />
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Welfare & Benevolence</span>
            </div>
            <h1 className="text-3xl font-bold">Welfare Contributions</h1>
            <p className="text-sm opacity-80 mt-1">"Each of you should give what you have decided" — 2 Corinthians 9:7</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shadow whitespace-nowrap">
            <LuPlus /> Record Contribution
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Contributed', value: `GH₵ ${totalContributed.toLocaleString()}`, Icon: FaHandshake, bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', text: 'text-emerald-800' },
          { label: 'This Month', value: `GH₵ ${thisMonth.toLocaleString()}`, Icon: LuCalendarDays, bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-800' },
          { label: 'Total Records', value: contributions.length, Icon: LuClipboardList, bg: 'from-teal-50 to-cyan-50', border: 'border-teal-200', text: 'text-teal-800' },
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

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-emerald-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-emerald-100 dark:border-gray-700 flex items-center gap-2">
          <FaHeart className="text-emerald-600" />
          <h2 className="font-semibold text-gray-700 dark:text-white text-sm">Recent Welfare Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50 dark:bg-gray-700 text-emerald-800 dark:text-emerald-300 uppercase text-xs">
              <tr>
                {['Member', 'Amount', 'Purpose', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 dark:divide-gray-700">
              {contributions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <FaHeart className="text-4xl" />
                      <p className="text-sm">No welfare records yet. Record the first contribution!</p>
                    </div>
                  </td>
                </tr>
              ) : contributions.map((c) => (
                <tr key={c.id} className="hover:bg-emerald-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{getMemberName(c.member_id)}</td>
                  <td className="px-4 py-3"><span className="font-semibold text-emerald-700">GH₵ {Number(c.amount).toLocaleString()}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{c.purpose || '—'}</span></td>
                  <td className="px-4 py-3 text-gray-500">{c.date_paid ? new Date(c.date_paid).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <FaHeart />
                <h2 className="text-base font-semibold">Record Contribution</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><LuX /></button>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 border-b border-emerald-100 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 italic text-center">"Whoever is kind to the poor lends to the Lord" — Proverbs 19:17</p>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Member</label>
                <select required value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select a member</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount (GH₵)</label>
                  <input type="number" required min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</label>
                  <input type="date" value={form.date_paid} onChange={(e) => setForm({ ...form, date_paid: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Purpose</label>
                <div className="grid grid-cols-3 gap-2">
                  {PURPOSES.map((p) => (
                    <button type="button" key={p} onClick={() => setForm({ ...form, purpose: p })}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border transition ${
                        form.purpose === p ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-emerald-400'
                      }`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                <button type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-800 to-teal-600 hover:from-emerald-900 hover:to-teal-700 text-white py-2 rounded-lg text-sm font-semibold transition shadow">
                  <FaHeart /> Record Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
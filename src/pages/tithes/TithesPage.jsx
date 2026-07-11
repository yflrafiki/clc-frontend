import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FaCross } from 'react-icons/fa';
import { LuCoins, LuCalendarDays, LuClipboardList, LuPlus, LuX } from 'react-icons/lu';

const EMPTY_FORM = { member_id: '', amount: '', payment_method: 'Cash', date_paid: '', notes: '' };
const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'];

export default function TithesPage() {
  const [members, setMembers] = useState([]);
  const [tithes, setTithes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { fetchMembers(); fetchTithes(); }, []);

  const fetchMembers = async () => {
    try { const res = await API.get('/members'); setMembers(res.data); } catch {}
  };

  const fetchTithes = async () => {
    try { const res = await API.get('/tithes'); setTithes(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tithes', { ...form, date_paid: form.date_paid || new Date() });
      toast.success('Tithe recorded — to God be the glory!');
      setForm(EMPTY_FORM);
      setShowModal(false);
      fetchTithes();
    } catch {
      toast.error('Failed to record tithe');
    }
  };

  const totalCollected = tithes.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const thisMonth = tithes
    .filter((t) => new Date(t.date_paid).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const getMemberName = (id) => members.find((m) => m.id === id)?.full_name || '—';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-500 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaCross className="text-xl" />
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Tithes & Offerings</span>
            </div>
            <h1 className="text-3xl font-bold">Tithe Records</h1>
            <p className="text-sm opacity-80 mt-1">"Bring the whole tithe into the storehouse" — Malachi 3:10</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shadow whitespace-nowrap">
            <LuPlus /> Record Tithe
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Collected', value: `GH₵ ${totalCollected.toLocaleString()}`, Icon: LuCoins, bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', text: 'text-amber-800' },
          { label: 'This Month', value: `GH₵ ${thisMonth.toLocaleString()}`, Icon: LuCalendarDays, bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-800' },
          { label: 'Total Records', value: tithes.length, Icon: LuClipboardList, bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', text: 'text-blue-800' },
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-amber-100 dark:border-gray-700 flex items-center gap-2">
          <FaCross className="text-amber-600" />
          <h2 className="font-semibold text-gray-700 dark:text-white text-sm">Recent Tithe Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 dark:bg-gray-700 text-amber-800 dark:text-amber-300 uppercase text-xs">
              <tr>
                {['Member', 'Amount', 'Payment Method', 'Date Paid', 'Notes'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 dark:divide-gray-700">
              {tithes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <FaCross className="text-4xl" />
                      <p className="text-sm">No tithe records yet. Record the first one!</p>
                    </div>
                  </td>
                </tr>
              ) : tithes.map((t) => (
                <tr key={t.id} className="hover:bg-amber-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{getMemberName(t.member_id)}</td>
                  <td className="px-4 py-3"><span className="font-semibold text-amber-700">GH₵ {Number(t.amount).toLocaleString()}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">{t.payment_method}</span></td>
                  <td className="px-4 py-3 text-gray-500">{t.date_paid ? new Date(t.date_paid).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-400 italic">{t.notes || '—'}</td>
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
            <div className="bg-gradient-to-r from-amber-700 to-yellow-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <FaCross />
                <h2 className="text-base font-semibold">Record Tithe</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><LuX /></button>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-3 border-b border-amber-100 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-400 italic text-center">"Honor the Lord with your wealth" — Proverbs 3:9</p>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Member</label>
                <select required value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="">Select a member</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount (GH₵)</label>
                  <input type="number" required min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date Paid</label>
                  <input type="date" value={form.date_paid} onChange={(e) => setForm({ ...form, date_paid: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button type="button" key={method} onClick={() => setForm({ ...form, payment_method: method })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        form.payment_method === method ? 'bg-amber-600 text-white border-amber-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-amber-400'
                      }`}>{method}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Notes (optional)</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                <button type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-800 hover:to-yellow-700 text-white py-2 rounded-lg text-sm font-semibold transition shadow">
                  <FaCross /> Record Tithe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

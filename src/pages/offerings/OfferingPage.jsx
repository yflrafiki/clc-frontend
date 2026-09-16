import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { LuPlus, LuX } from 'react-icons/lu';
import { FaHandHoldingHeart } from 'react-icons/fa';

const TYPES = ['Offering', 'Donation', 'Seed'];
const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'];
const EMPTY_FORM = { type: 'Offering', amount: '', payment_method: 'Cash', date_collected: '', notes: '' };

const TYPE_STYLES = {
  Offering: { bg: 'from-violet-700 to-purple-600', badge: 'bg-violet-100 text-violet-700', tab: 'bg-violet-700' },
  Donation: { bg: 'from-blue-700 to-sky-600',      badge: 'bg-blue-100 text-blue-700',    tab: 'bg-blue-700'   },
  Seed:     { bg: 'from-green-700 to-emerald-600', badge: 'bg-green-100 text-green-700',  tab: 'bg-green-700'  },
};

export default function OfferingPage() {
  const [offerings, setOfferings] = useState([]);
  const [summary, setSummary] = useState([]);
  const [activeTab, setActiveTab] = useState('Offering');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchOfferings(); fetchSummary(); }, []);

  const fetchOfferings = async () => {
    try { const res = await API.get('/offerings'); setOfferings(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  const fetchSummary = async () => {
    try { const res = await API.get('/offerings/summary'); setSummary(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await API.post('/offerings', form);
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

      {/* Header */}
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${style.bg} p-6 text-white shadow-lg`}>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaHandHoldingHeart className="text-xl" />
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Offerings & Giving</span>
            </div>
            <h1 className="text-3xl font-bold">Offerings</h1>
            <p className="text-sm opacity-80 mt-1">"Each of you should give what you have decided" — 2 Cor 9:7</p>
          </div>
          <button onClick={() => { setForm({ ...EMPTY_FORM, type: activeTab }); setShowModal(true); }}
            className="flex items-center gap-2 bg-white text-violet-700 hover:bg-violet-50 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shadow whitespace-nowrap">
            <LuPlus /> Record {activeTab}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TYPES.map((type) => (
          <div key={type} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <FaHandHoldingHeart className="text-2xl text-violet-600" />
              <div>
                <p className="text-xl font-bold text-gray-800 dark:text-white">GH₵ {Number(getTotal(type)).toLocaleString()}</p>
                <p className="text-xs font-medium text-gray-500">{type} Total</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TYPES.map((type) => (
          <button key={type} onClick={() => setActiveTab(type)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === type ? `${TYPE_STYLES[type].tab} text-white` : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>{type}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <FaHandHoldingHeart className="text-violet-600" />
          <h2 className="font-semibold text-gray-700 dark:text-white text-sm">{activeTab} Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                {['Type', 'Amount', 'Payment Method', 'Date', 'Notes'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">No {activeTab} records yet.</td></tr>
              ) : filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_STYLES[o.type]?.badge}`}>{o.type}</span></td>
                  <td className="px-4 py-3 font-semibold text-violet-700">GH₵ {Number(o.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{o.payment_method}</td>
                  <td className="px-4 py-3 text-gray-500">{o.date_collected ? new Date(o.date_collected).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-400 italic">{o.notes || '—'}</td>
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
            <div className={`bg-gradient-to-r ${TYPE_STYLES[form.type]?.bg} px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-2 text-white">
                <FaHandHoldingHeart />
                <h2 className="text-base font-semibold">Record {form.type}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><LuX /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map(t => (
                    <button type="button" key={t} onClick={() => setForm({ ...form, type: t })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        form.type === t ? `${TYPE_STYLES[t].tab} text-white border-transparent` : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount (GH₵)</label>
                  <input type="number" required min="0" step="0.01" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
                  <input type="date" required value={form.date_collected}
                    onChange={e => setForm({ ...form, date_collected: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button type="button" key={m} onClick={() => setForm({ ...form, payment_method: m })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        form.payment_method === m ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                      }`}>{m}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes (optional)</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={submitting}
                  className={`flex-1 bg-gradient-to-r ${TYPE_STYLES[form.type]?.bg} text-white py-2 rounded-lg text-sm font-semibold transition shadow disabled:opacity-60 disabled:cursor-not-allowed`}>
                  {submitting ? 'Saving...' : `Save ${form.type}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FaHeart, FaHandshake } from 'react-icons/fa';
import { LuCoins, LuCalendarDays, LuClipboardList, LuPlus, LuX, LuUsers } from 'react-icons/lu';

const EMPTY_FORM = { member_id: '', amount: '', purpose: '', date_paid: '' };
const PURPOSES = ['Medical', 'Bereavement', 'Education', 'Emergency', 'Other'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function WelfarePage() {
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [paidMembers, setPaidMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('records');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchMembers(); fetchContributions(); }, []);
  useEffect(() => { if (activeTab === 'paid') fetchPaidMembers(); }, [activeTab, filterMonth, filterYear]);

  const fetchMembers = async () => {
    try { const res = await API.get('/members'); setMembers(res.data); } catch {}
  };

  const fetchContributions = async () => {
    try { const res = await API.get('/welfare'); setContributions(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  const fetchPaidMembers = async () => {
    try {
      const res = await API.get(`/welfare/paid-members?month=${filterMonth}&year=${filterYear}`);
      setPaidMembers(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-800 via-green-700 to-teal-600 p-6 text-white shadow-lg">
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

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('records')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'records' ? 'bg-emerald-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          All Records
        </button>
        <button onClick={() => setActiveTab('paid')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'paid' ? 'bg-emerald-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          <LuUsers /> Paid Members
        </button>
      </div>

      {/* Records Table */}
      {activeTab === 'records' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-emerald-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-emerald-100 dark:border-gray-700 flex items-center gap-2">
            <FaHeart className="text-emerald-600" />
            <h2 className="font-semibold text-gray-700 dark:text-white text-sm">Recent Welfare Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 dark:bg-gray-700 text-emerald-800 dark:text-emerald-300 uppercase text-xs">
                <tr>
                  {['Member ID', 'Member', 'Amount', 'Purpose', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 dark:divide-gray-700">
                {contributions.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">No welfare records yet.</td></tr>
                ) : contributions.map(c => (
                  <tr key={c.id} className="hover:bg-emerald-50 dark:hover:bg-gray-700 transition">
                    <td className="px-4 py-3 text-gray-400 text-xs">{c.membership_id || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{c.full_name}</td>
                    <td className="px-4 py-3"><span className="font-semibold text-emerald-700">GH₵ {Number(c.amount).toLocaleString()}</span></td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{c.purpose || '—'}</span></td>
                    <td className="px-4 py-3 text-gray-500">{c.date_paid ? new Date(c.date_paid).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paid Members Tab */}
      {activeTab === 'paid' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-emerald-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-emerald-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <LuUsers className="text-emerald-600" />
              <h2 className="font-semibold text-gray-700 dark:text-white text-sm">Members Who Have Paid</h2>
            </div>
            <div className="flex gap-2 ml-auto">
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <input type="number" value={filterYear} onChange={e => setFilterYear(e.target.value)}
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm w-24 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <button onClick={fetchPaidMembers}
                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">Filter</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 dark:bg-gray-700 text-emerald-800 dark:text-emerald-300 uppercase text-xs">
                <tr>
                  {['Member ID', 'Name', 'Phone', 'Total Paid', 'Last Payment'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 dark:divide-gray-700">
                {paidMembers.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">No members paid for this period.</td></tr>
                ) : paidMembers.map(m => (
                  <tr key={m.id} className="hover:bg-emerald-50 dark:hover:bg-gray-700 transition">
                    <td className="px-4 py-3 text-gray-400 text-xs">{m.membership_id || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{m.full_name}</td>
                    <td className="px-4 py-3 text-gray-500">{m.phone_number || '—'}</td>
                    <td className="px-4 py-3"><span className="font-semibold text-emerald-700">GH₵ {Number(m.total_paid).toLocaleString()}</span></td>
                    <td className="px-4 py-3 text-gray-500">{m.last_paid ? new Date(m.last_paid).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Member</label>
                <select required value={form.member_id} onChange={e => setForm({ ...form, member_id: e.target.value })}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select a member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name} ({m.membership_id || 'No ID'})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount (GH₵)</label>
                  <input type="number" required min="0" step="0.01" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</label>
                  <input type="date" value={form.date_paid} onChange={e => setForm({ ...form, date_paid: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Purpose</label>
                <div className="grid grid-cols-3 gap-2">
                  {PURPOSES.map(p => (
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
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-800 to-teal-600 hover:from-emerald-900 hover:to-teal-700 text-white py-2 rounded-lg text-sm font-semibold transition shadow disabled:opacity-60 disabled:cursor-not-allowed">
                  <FaHeart /> {submitting ? 'Saving...' : 'Record Contribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

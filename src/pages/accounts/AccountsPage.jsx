import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { LuPlus, LuX, LuReceipt, LuWallet } from 'react-icons/lu';
import { FaUniversity } from 'react-icons/fa';
import ConfirmDialog from '../../components/common/ConfirmDialog';

import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Tithe', 'Welfare', 'Offering', 'Donation', 'Seed'];
const EMPTY_FORM = { category: 'Tithe', amount: '', bank_name: '', transaction_date: '', notes: '', receipt_image: null };

export default function AccountsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1;
  const [summary, setSummary] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState('summary');
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { fetchSummary(); fetchReceipts(); }, []);

  const fetchSummary = async () => {
    try { const res = await API.get('/accounts/summary'); setSummary(res.data); } catch {}
  };

  const fetchReceipts = async () => {
    try { const res = await API.get('/accounts/receipts'); setReceipts(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, receipt_image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.receipt_image) return toast.error('Please attach a receipt image');
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    if (submitting) return;
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });
      await API.post('/accounts/receipts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Receipt uploaded successfully!');
      setForm(EMPTY_FORM);
      setPreview(null);
      setShowModal(false);
      fetchReceipts();
      fetchSummary();
    } catch {
      toast.error('Failed to upload receipt');
    } finally {
      setSubmitting(false);
    }
  };

  const SUMMARY_CARDS = summary ? [
    { label: 'Tithes', value: summary.tithe, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Welfare', value: summary.welfare, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Offerings', value: summary.offering, color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
    { label: 'Donations', value: summary.donation, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Seeds', value: summary.seed, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    { label: 'Grand Total', value: summary.grand_total, color: 'text-gray-900 dark:text-white', bg: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' },
  ] : [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-800 via-gray-700 to-zinc-600 p-6 text-white shadow-lg">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaUniversity className="text-xl" />
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Accounts Department</span>
            </div>
            <h1 className="text-3xl font-bold">Financial Accounts</h1>
            <p className="text-sm opacity-80 mt-1">{isAdmin ? 'View all church financial records' : 'Manage all church finances and bank receipts'}</p>
          </div>
          {!isAdmin && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-white text-slate-800 hover:bg-slate-50 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shadow whitespace-nowrap">
              <LuPlus /> Upload Receipt
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'summary' ? 'bg-slate-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          <LuWallet /> Financial Summary
        </button>
        <button onClick={() => setActiveTab('receipts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'receipts' ? 'bg-slate-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          <LuReceipt /> Bank Receipts
        </button>
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUMMARY_CARDS.map(({ label, value, color, bg }) => (
            <div key={label} className={`border rounded-xl p-6 ${bg}`}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>GH₵ {Number(value || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Receipts Tab */}
      {activeTab === 'receipts' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <LuReceipt className="text-slate-600" />
            <h2 className="font-semibold text-gray-700 dark:text-white text-sm">Bank Receipts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                <tr>
                  {['Category', 'Amount', 'Bank', 'Date', 'Uploaded By', 'Receipt', 'Notes'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {receipts.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No receipts uploaded yet.</td></tr>
                ) : receipts.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">{r.category}</span></td>
                    <td className="px-4 py-3 font-semibold text-slate-700">GH₵ {Number(r.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{r.bank_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.transaction_date ? new Date(r.transaction_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.uploaded_by_name || '—'}</td>
                    <td className="px-4 py-3">
                      <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/receipts/${r.receipt_image}`}
                        target="_blank" rel="noreferrer"
                        className="text-blue-600 hover:underline text-xs font-medium">View</a>
                    </td>
                    <td className="px-4 py-3 text-gray-400 italic">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal — finance only */}
      {showModal && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-zinc-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <LuReceipt />
                <h2 className="text-base font-semibold">Upload Bank Receipt</h2>
              </div>
              <button onClick={() => { setShowModal(false); setPreview(null); }} className="text-white/70 hover:text-white"><LuX /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount (GH₵)</label>
                  <input type="number" required min="0" step="0.01" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Transaction Date</label>
                  <input type="date" required value={form.transaction_date}
                    onChange={e => setForm({ ...form, transaction_date: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bank Name</label>
                <input type="text" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })}
                  placeholder="e.g. GCB Bank"
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Receipt Image (JPG/PNG/PDF)</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} required
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none" />
                {preview && (
                  <img src={preview} alt="Preview" className="mt-2 rounded-lg max-h-32 object-contain border border-gray-200" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes (optional)</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setPreview(null); }}
                  className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-slate-800 to-zinc-600 text-white py-2 rounded-lg text-sm font-semibold transition shadow disabled:opacity-60">
                  {submitting ? 'Uploading...' : 'Upload Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <ConfirmDialog
          message={`Upload a ${form.category} receipt of GH₵ ${Number(form.amount).toLocaleString()} from ${form.bank_name || 'the bank'}?`}
          onConfirm={confirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

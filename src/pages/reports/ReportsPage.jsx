import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { LuChartBar, LuPlus, LuX, LuClipboardList } from 'react-icons/lu';

const CATEGORIES = ['Tithe', 'Welfare', 'Offering', 'Attendance', 'General'];
const EMPTY_FORM = { title: '', category: 'General', content: '', report_date: '' };

const CAT_BADGE = {
  Tithe:      'bg-amber-100 text-amber-700',
  Welfare:    'bg-emerald-100 text-emerald-700',
  Offering:   'bg-violet-100 text-violet-700',
  Attendance: 'bg-blue-100 text-blue-700',
  General:    'bg-gray-100 text-gray-700',
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try { const res = await API.get('/reports'); setReports(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await API.post('/reports', form);
      toast.success('Report submitted successfully!');
      setForm(EMPTY_FORM);
      setShowModal(false);
      fetchReports();
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-800 via-purple-700 to-indigo-600 p-6 text-white shadow-lg">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LuChartBar className="text-xl" />
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Reports</span>
            </div>
            <h1 className="text-3xl font-bold">Report Submissions</h1>
            <p className="text-sm opacity-80 mt-1">Submit physical reports into the system</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-violet-800 hover:bg-violet-50 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shadow whitespace-nowrap">
            <LuPlus /> Submit Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {CATEGORIES.map(cat => (
          <div key={cat} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {reports.filter(r => r.category === cat).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">{cat}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <LuClipboardList className="text-violet-600" />
          <h2 className="font-semibold text-gray-700 dark:text-white text-sm">All Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                {['Title', 'Category', 'Report Date', 'Submitted By', 'Content'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {reports.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">No reports submitted yet.</td></tr>
              ) : reports.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{r.title}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${CAT_BADGE[r.category]}`}>{r.category}</span></td>
                  <td className="px-4 py-3 text-gray-500">{r.report_date ? new Date(r.report_date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{r.submitted_by_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{r.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-800 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <LuChartBar />
                <h2 className="text-base font-semibold">Submit Report</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><LuX /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Report Title</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Sunday Service Tithe Report"
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Report Date</label>
                  <input type="date" required value={form.report_date} onChange={e => setForm({ ...form, report_date: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Report Content</label>
                <textarea rows={5} required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter the full report details here..."
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-violet-800 to-indigo-600 hover:from-violet-900 hover:to-indigo-700 text-white py-2 rounded-lg text-sm font-semibold transition shadow disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

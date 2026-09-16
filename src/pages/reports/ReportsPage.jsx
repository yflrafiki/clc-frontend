import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { LuChartBar, LuPlus, LuX, LuClipboardList, LuCheck, LuTriangleAlert, LuDownload } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const CATEGORIES = [
  'Choir', 'Media', 'Ushers', 'Women Ministries',
  'Men Ministries', 'Children Ministries', 'Youth',
  'Instrumentalist', 'Tithe', 'Welfare', 'Offering',
  'Attendance', 'General'
];

const EMPTY_FORM = { title: '', category: 'General', content: '', report_date: '' };

const CAT_BADGE = {
  Tithe: 'bg-amber-100 text-amber-700', Welfare: 'bg-emerald-100 text-emerald-700',
  Offering: 'bg-violet-100 text-violet-700', Attendance: 'bg-blue-100 text-blue-700',
  Choir: 'bg-pink-100 text-pink-700', Media: 'bg-cyan-100 text-cyan-700',
  Ushers: 'bg-orange-100 text-orange-700', 'Women Ministries': 'bg-rose-100 text-rose-700',
  'Men Ministries': 'bg-indigo-100 text-indigo-700', 'Children Ministries': 'bg-yellow-100 text-yellow-700',
  Youth: 'bg-teal-100 text-teal-700', Instrumentalist: 'bg-purple-100 text-purple-700',
  General: 'bg-gray-100 text-gray-700',
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const exportPDF = (report) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229);
  doc.text('LifeWay Church — Report', 14, 20);
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  autoTable(doc, {
    startY: 28,
    head: [['Field', 'Details']],
    body: [
      ['Title', report.title],
      ['Category', report.category],
      ['Report Date', formatDate(report.report_date)],
      ['Submitted By', report.submitted_by_name || '—'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 10 },
  });
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text('Report Content:', 14, finalY);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const lines = doc.splitTextToSize(report.content || '', 180);
  doc.text(lines, 14, finalY + 8);
  doc.save(`${report.title.replace(/\s+/g, '_')}_report.pdf`);
};



export default function ReportsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1;

  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);

  useEffect(() => { if (isAdmin) fetchReports(); }, []);

  const fetchReports = async () => {
    try { const res = await API.get('/reports'); setReports(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  const handleSubmit = (e) => { e.preventDefault(); setShowConfirm(true); };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      await API.post('/reports', form);
      toast.success('Report submitted to admin successfully!');
      setLastSubmitted({ ...form, submitted_by_name: user?.full_name });
      setForm(EMPTY_FORM);
      setShowModal(false);
      if (isAdmin) fetchReports();
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
            <h1 className="text-3xl font-bold">{isAdmin ? 'All Reports' : 'Submit Report'}</h1>
            <p className="text-sm opacity-80 mt-1">
              {isAdmin ? 'Reports submitted by assistants' : 'Submit your department report to the admin'}
            </p>
          </div>
          {!isAdmin && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-white text-violet-800 hover:bg-violet-50 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shadow whitespace-nowrap">
              <LuPlus /> Submit Report
            </button>
          )}
        </div>
      </div>

      {/* Admin stats */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Choir', 'Media', 'Youth', 'General'].map(cat => (
            <div key={cat} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {reports.filter(r => r.category === cat).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">{cat}</p>
            </div>
          ))}
        </div>
      )}

      {/* Admin table */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <LuClipboardList className="text-violet-600" />
            <h2 className="font-semibold text-gray-700 dark:text-white text-sm">All Submitted Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                <tr>
                  {['Title', 'Category', 'Report Date', 'Submitted By', 'Content', 'Download'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {reports.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No reports submitted yet.</td></tr>
                ) : reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{r.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${CAT_BADGE[r.category] || 'bg-gray-100 text-gray-700'}`}>
                        {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(r.report_date)}</td>
                    <td className="px-4 py-3 text-gray-500">{r.submitted_by_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{r.content}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => exportPDF(r)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-semibold transition">
                          <LuDownload className="text-xs" /> PDF
                        </button>
          
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assistant — last submitted report + export */}
      {!isAdmin && lastSubmitted && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LuClipboardList className="text-violet-500" />
              <h2 className="font-semibold text-gray-700 dark:text-white text-sm">Last Submitted Report</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportPDF(lastSubmitted)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition">
                <LuDownload /> PDF
              </button>

            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold text-gray-600 dark:text-gray-300">Title:</span> <span className="text-gray-800 dark:text-white">{lastSubmitted.title}</span></p>
            <p><span className="font-semibold text-gray-600 dark:text-gray-300">Category:</span> <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${CAT_BADGE[lastSubmitted.category]}`}>{lastSubmitted.category}</span></p>
            <p><span className="font-semibold text-gray-600 dark:text-gray-300">Date:</span> <span className="text-gray-500">{formatDate(lastSubmitted.report_date)}</span></p>
            <p className="font-semibold text-gray-600 dark:text-gray-300">Content:</p>
            <p className="text-gray-500 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 rounded-lg p-3">{lastSubmitted.content}</p>
          </div>
        </div>
      )}

      {/* Assistant placeholder */}
      {!isAdmin && !lastSubmitted && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <LuClipboardList className="text-5xl text-violet-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Click "Submit Report" above to send a report to the admin.</p>
        </div>
      )}

      {/* Submit Modal */}
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Report Title</label>
                  <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Sunday Choir Report"
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Report Date</label>
                  <input type="date" required value={form.report_date} onChange={e => setForm({ ...form, report_date: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Report Content</label>
                <textarea rows={8} required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your full report here..."
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-violet-800 to-indigo-600 text-white py-2 rounded-lg text-sm font-semibold transition shadow disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <LuTriangleAlert className="text-2xl text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Submit Report?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This report will be sent to the admin. Are you sure you want to submit?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                No, Cancel
              </button>
              <button onClick={confirmSubmit}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-700 hover:bg-violet-800 text-white py-2 rounded-lg text-sm font-semibold transition">
                <LuCheck /> Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

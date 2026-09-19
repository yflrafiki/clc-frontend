import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { ChartColumn, Plus, X, ClipboardList, Check, TriangleAlert, Download, Search, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORIES = ['Choir', 'Media', 'Ushers', 'Women Ministries', 'Men Ministries', 'Children Ministries', 'Youth', 'Instrumentalist', 'Tithe', 'Welfare', 'Offering', 'Attendance', 'General'];
const EMPTY_FORM = { title: '', category: 'General', content: '', report_date: '' };
const CAT_BADGE = {
  Tithe: 'bg-[#f8ebd7] text-[#8a5f2d]', Welfare: 'bg-[#e6f1ea] text-[#2e4a3d]', Offering: 'bg-[#eee9fb] text-[#5b4c8d]', Attendance: 'bg-[#edf6fb] text-[#3b6a7a]',
  Choir: 'bg-[#f8e7ee] text-[#884f69]', Media: 'bg-[#eaf7fb] text-[#3f7186]', Ushers: 'bg-[#f8efe0] text-[#8d6644]', 'Women Ministries': 'bg-[#fdeceb] text-[#9c5a5a]',
  'Men Ministries': 'bg-[#edf1ff] text-[#495a8d]', 'Children Ministries': 'bg-[#fff4dd] text-[#8f7438]', Youth: 'bg-[#eaf9f4] text-[#2d7662]', Instrumentalist: 'bg-[#f3edfb] text-[#5f4ba0]',
  General: 'bg-[#f3f4f6] text-[#5d554d]',
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const exportPDF = (report) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(31, 45, 61);
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
    headStyles: { fillColor: [31, 45, 61] },
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

const exportMemberReportPDF = (report) => {
  if (!report?.member) return;

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(31, 45, 61);
  doc.text('LifeWay Church — Member Report', 14, 20);
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);

  autoTable(doc, {
    startY: 28,
    head: [['Field', 'Details']],
    body: [
      ['Member', report.member.full_name],
      ['Membership ID', report.member.membership_id || '—'],
      ['Phone', report.member.phone_number || '—'],
      ['Email', report.member.email || '—'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [31, 45, 61] },
    styles: { fontSize: 10 },
  });

  const summaryY = doc.lastAutoTable.finalY + 12;
  autoTable(doc, {
    startY: summaryY,
    head: [['Category', 'Amount']],
    body: [
      ['Tithe', `GH₵ ${Number(report.totals?.tithe || 0).toLocaleString()}`],
      ['Welfare', `GH₵ ${Number(report.totals?.welfare || 0).toLocaleString()}`],
      ['Donation', `GH₵ ${Number(report.totals?.donation || 0).toLocaleString()}`],
      ['Seed', `GH₵ ${Number(report.totals?.seed || 0).toLocaleString()}`],
      ['Total Giving', `GH₵ ${Number(report.totals?.totalGiving || 0).toLocaleString()}`],
      ['Attendance', `${report.totals?.attendance || 0} present days`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [68, 99, 80] },
    styles: { fontSize: 10 },
  });

  const attendanceY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text('Recent Attendance', 14, attendanceY);

  const attendanceRows = (report.attendance || []).slice(0, 10).map((item) => [formatDate(item.service_date), item.attendance_status ? 'Present' : 'Absent']);

  autoTable(doc, {
    startY: attendanceY + 6,
    head: [['Date', 'Status']],
    body: attendanceRows.length ? attendanceRows : [['—', 'No attendance recorded']],
    theme: 'grid',
    headStyles: { fillColor: [143, 120, 76] },
    styles: { fontSize: 9 },
  });

  doc.save(`${report.member.full_name.replace(/\s+/g, '_')}_member_report.pdf`);
};

export default function ReportsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1;
  const isFinance = user?.role_id === 3;

  const [reports, setReports] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberReport, setMemberReport] = useState(null);
  const [loadingMemberReport, setLoadingMemberReport] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);

  useEffect(() => { if (isAdmin) fetchReports(); }, []);

  const fetchReports = async () => {
    try { const res = await API.get('/reports'); setReports(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  const handleMemberLookup = async () => {
    const query = memberSearch.trim();
    if (!query) {
      toast.error('Please enter a member name or ID');
      return;
    }

    setLoadingMemberReport(true);
    try {
      const res = await API.get(`/reports/member-search?query=${encodeURIComponent(query)}`);
      setMemberReport(res.data);
    } catch (error) {
      setMemberReport(null);
      toast.error(error.response?.data?.message || 'Member report not found');
    } finally {
      setLoadingMemberReport(false);
    }
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
      <div className="relative overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-gradient-to-r from-[#2b1d36] via-[#4d2f57] to-[#6c4d72] p-6 text-white shadow-[var(--church-shadow)] md:p-8">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255,255,255,0.2) 0%, transparent 30%), linear-gradient(135deg, rgba(197,154,90,0.14), rgba(255,255,255,0.03))' }}></div>
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f5d7b4]">
              <ChartColumn className="text-[#f5d7b4]" />
              {isFinance ? 'Finance Prints' : 'Reports'}
            </div>
            <h1 className="church-title text-4xl text-white md:text-5xl">
              {isFinance ? 'Member Giving Printout' : isAdmin ? 'All Reports' : 'Submit Report'}
            </h1>
            <p className="mt-2 text-sm text-white/80">
              {isFinance
                ? 'Search a member by name or ID and print their tithe, welfare, donation and seed history.'
                : isAdmin
                  ? 'Reports submitted by assistants'
                  : 'Submit your department report to the admin'}
            </p>
          </div>
          {!isAdmin && !isFinance && (
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#2b1d36] transition hover:bg-[#f7f0e5]">
              <Plus /> Submit Report
            </button>
          )}
        </div>
      </div>

      {isFinance && (
        <div className="rounded-[26px] border border-[#e7d9bd] bg-white/90 p-5 shadow-[var(--church-shadow)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="church-title text-3xl text-[#1f2d3d]">Member Report Lookup</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#7d6a5d]">Search by member ID or full name</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7b6c]" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Enter member name or ID"
                className="w-full rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] py-2.5 pl-10 pr-3 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20"
              />
            </div>
            <button onClick={handleMemberLookup} disabled={loadingMemberReport} className="rounded-xl bg-[#2b1d36] px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#3a2a46] disabled:opacity-60">
              {loadingMemberReport ? 'Loading...' : 'Load Report'}
            </button>
          </div>

          {memberReport && (
            <div className="mt-5 rounded-[22px] border border-[#e7d9bd] bg-[#faf5ef] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a5d]">Member</p>
                  <h3 className="mt-1 text-lg font-bold text-[#1f2d3d]">{memberReport.member.full_name}</h3>
                </div>
                <button onClick={() => exportMemberReportPDF(memberReport)} className="inline-flex items-center gap-2 rounded-xl bg-[#f7e7de] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a4c3a] transition hover:bg-[#f3d9cf]">
                  <Download /> Print PDF
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ['Tithe', `GH₵ ${Number(memberReport.totals?.tithe || 0).toLocaleString()}`],
                  ['Welfare', `GH₵ ${Number(memberReport.totals?.welfare || 0).toLocaleString()}`],
                  ['Donation', `GH₵ ${Number(memberReport.totals?.donation || 0).toLocaleString()}`],
                  ['Seed', `GH₵ ${Number(memberReport.totals?.seed || 0).toLocaleString()}`],
                  ['Attendance', `${memberReport.totals?.attendance || 0} days`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[#e7d9bd] bg-white p-3">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#7d6a5d]">{label}</p>
                    <p className="mt-1 text-sm font-bold text-[#1f2d3d]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {['Choir', 'Media', 'Youth', 'General'].map(cat => (
            <div key={cat} className="rounded-[20px] border border-[#e7d9bd] bg-[#fffaf4] p-4 text-center shadow-[0_12px_30px_rgba(31,45,61,0.04)]">
              <p className="text-2xl font-bold text-[#1f2d3d]">{reports.filter(r => r.category === cat).length}</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#6d5d55]">{cat}</p>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="overflow-hidden rounded-[26px] border border-[#e7d9bd] bg-white/90 shadow-[var(--church-shadow)]">
          <div className="flex items-center gap-2 border-b border-[#efe4d5] bg-[#faf5ef] px-5 py-4">
            <ClipboardList className="text-[#2b1d36]" />
            <h2 className="church-title text-3xl text-[#1f2d3d]">All Submitted Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f1e8] text-[#584f47] uppercase text-[10px] tracking-[0.14em]">
                <tr>
                  {['Title', 'Category', 'Report Date', 'Submitted By', 'Content', 'Download'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3eadf]">
                {reports.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-[#7d6a5d]">No reports submitted yet.</td></tr>
                ) : reports.map(r => (
                  <tr key={r.id} className="transition hover:bg-[#faf5ef]">
                    <td className="px-4 py-3 font-medium text-[#1f2d3d]">{r.title}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${CAT_BADGE[r.category] || 'bg-gray-100 text-gray-700'}`}>{r.category}</span></td>
                    <td className="px-4 py-3 text-[#5d554d]">{formatDate(r.report_date)}</td>
                    <td className="px-4 py-3 text-[#5d554d]">{r.submitted_by_name || '—'}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-[#7d6a5d]">{r.content}</td>
                    <td className="px-4 py-3"><button onClick={() => exportPDF(r)} className="inline-flex items-center gap-2 rounded-lg bg-[#f7e7de] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a4c3a] transition hover:bg-[#f3d9cf]"><Download className="h-3 w-3" /> PDF</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isAdmin && !isFinance && lastSubmitted && (
        <div className="rounded-[26px] border border-[#e7d9bd] bg-white/90 p-6 shadow-[var(--church-shadow)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-[#2b1d36]" />
              <h2 className="church-title text-3xl text-[#1f2d3d]">Last Submitted Report</h2>
            </div>
            <button onClick={() => exportPDF(lastSubmitted)} className="inline-flex items-center gap-2 rounded-xl bg-[#f7e7de] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a4c3a] transition hover:bg-[#f3d9cf]">
              <Download /> PDF
            </button>
          </div>
          <div className="space-y-2 text-sm text-[#5d554d]">
            <p><span className="font-semibold text-[#1f2d3d]">Title:</span> {lastSubmitted.title}</p>
            <p><span className="font-semibold text-[#1f2d3d]">Category:</span> <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${CAT_BADGE[lastSubmitted.category]}`}>{lastSubmitted.category}</span></p>
            <p><span className="font-semibold text-[#1f2d3d]">Date:</span> {formatDate(lastSubmitted.report_date)}</p>
            <p className="pt-2 font-semibold text-[#1f2d3d]">Content:</p>
            <p className="whitespace-pre-wrap rounded-2xl border border-[#e7d9bd] bg-[#faf5ef] p-3 text-[#5d554d]">{lastSubmitted.content}</p>
          </div>
        </div>
      )}

      {!isAdmin && !isFinance && !lastSubmitted && (
        <div className="rounded-[26px] border border-[#e7d9bd] bg-white/90 p-12 text-center shadow-[var(--church-shadow)]">
          <FileText className="mx-auto mb-3 text-5xl text-[#7c5a7a]" />
          <p className="text-sm text-[#5d554d]">Click "Submit Report" above to send a report to the admin.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-white shadow-[var(--church-shadow)]">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#2b1d36] to-[#6c4d72] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <ChartColumn />
                <h2 className="text-base font-semibold">Submit Report</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Report Title</label>
                  <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Sunday Choir Report" className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Report Date</label>
                  <input type="date" required value={form.report_date} onChange={e => setForm({ ...form, report_date: e.target.value })} className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Report Content</label>
                <textarea rows={8} required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your full report here..." className="resize-y rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-[#e6d9c3] bg-[#faf5ef] py-2.5 text-sm font-medium text-[#5d554d] transition hover:bg-[#f4efe8]">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-gradient-to-r from-[#2b1d36] to-[#6c4d72] py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-[var(--church-shadow)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
              <TriangleAlert className="text-2xl text-violet-600" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#1f2d3d]">Submit Report?</h3>
            <p className="mb-6 text-sm text-[#5d554d]">This report will be sent to the admin. Are you sure you want to submit?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 rounded-xl border border-[#e6d9c3] bg-[#faf5ef] py-2 text-sm font-medium text-[#5d554d] transition hover:bg-[#f4efe8]">No, Cancel</button>
              <button onClick={confirmSubmit} className="flex-1 rounded-xl bg-[#2b1d36] py-2 text-sm font-semibold text-white transition hover:bg-[#3a2a46]"> <span className="inline-flex items-center justify-center gap-2"><Check /> Yes, Submit</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

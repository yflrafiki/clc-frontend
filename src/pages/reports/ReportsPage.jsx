import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FaCross, FaHeart, FaFileExcel } from 'react-icons/fa';
import { LuClipboardList, LuChartBar, LuFolderOpen, LuDownload } from 'react-icons/lu';

const REPORTS = [
  {
    type: 'attendance',
    label: 'Attendance Report',
    description: 'Export a full record of all church attendance sessions.',
    Icon: LuClipboardList,
    bg: 'from-indigo-50 to-blue-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    btn: 'from-indigo-800 to-sky-600 hover:from-indigo-900 hover:to-sky-700',
  },
  {
    type: 'tithes',
    label: 'Tithes Report',
    description: 'Export all tithe contributions and payment records.',
    Icon: FaCross,
    bg: 'from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    btn: 'from-amber-700 to-yellow-600 hover:from-amber-800 hover:to-yellow-700',
  },
  {
    type: 'welfare',
    label: 'Welfare Report',
    description: 'Export all welfare and benevolence contribution records.',
    Icon: FaHeart,
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    btn: 'from-emerald-800 to-teal-600 hover:from-emerald-900 hover:to-teal-700',
  },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState('');

  const downloadReport = async (type) => {
    setLoading(type);
    try {
      const res = await API.get(`/reports/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${type} report downloaded!`);
    } catch {
      toast.error(`Failed to download ${type} report`);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-800 via-purple-700 to-fuchsia-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <LuChartBar className="text-xl" />
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Church Reports</span>
          </div>
          <h1 className="text-3xl font-bold">Reports & Exports</h1>
          <p className="text-sm opacity-80 mt-1">"Let all things be done decently and in order" — 1 Corinthians 14:40</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl px-5 py-4 flex items-center gap-3">
        <LuFolderOpen className="text-violet-500 text-xl" />
        <p className="text-sm text-violet-700 dark:text-violet-300">Select a report below to export it as an Excel (.xlsx) file.</p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {REPORTS.map(({ type, label, description, Icon, bg, border, text, btn }) => (
          <div key={type} className={`bg-gradient-to-br ${bg} border ${border} rounded-xl p-5 flex flex-col gap-4`}>
            <div className="flex items-center gap-3">
              <Icon className={`text-3xl ${text}`} />
              <div>
                <p className={`font-bold text-base ${text}`}>{label}</p>
                <p className={`text-xs ${text} opacity-70`}>{description}</p>
              </div>
            </div>
            <button
              onClick={() => downloadReport(type)}
              disabled={loading === type}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${btn} text-white py-2 rounded-lg text-sm font-semibold transition shadow disabled:opacity-60`}
            >
              {loading === type ? <LuDownload className="animate-bounce" /> : <LuDownload />}
              {loading === type ? 'Downloading...' : `Export ${label}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FaUsers, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { LuUserPlus, LuSearch, LuX } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';

const EMPTY_FORM = {
  full_name: '', email: '', gender: '', date_of_birth: '', phone_number: '',
  address: '', date_joined: '', emergency_contact: '', status: 'Active',
};

export default function MembersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1;

  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    try { const res = await API.get('/members'); setMembers(res.data); }
    catch { toast.error('Failed to load members'); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await API.post('/members', form);
      toast.success('Member added successfully');
      setForm(EMPTY_FORM);
      setShowModal(false);
      fetchMembers();
    } catch {
      toast.error('Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const active = members.filter(m => m.status === 'Active').length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-800 via-blue-700 to-sky-600 p-6 text-white shadow-lg">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaUsers className="text-xl" />
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Church Members</span>
            </div>
            <h1 className="text-3xl font-bold">Members</h1>
            <p className="text-sm opacity-80 mt-1">"You are the body of Christ" — 1 Corinthians 12:27</p>
          </div>
          {!isAdmin && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-white text-indigo-800 hover:bg-indigo-50 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shadow whitespace-nowrap">
              <LuUserPlus /> Add Member
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: members.length, Icon: FaUsers, bg: 'from-indigo-50 to-blue-50', border: 'border-indigo-200', text: 'text-indigo-800' },
          { label: 'Active', value: active, Icon: FaUserCheck, bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-800' },
          { label: 'Inactive', value: members.length - active, Icon: FaUserTimes, bg: 'from-red-50 to-rose-50', border: 'border-red-200', text: 'text-red-800' },
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-indigo-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <FaUsers className="text-indigo-600" />
            <h2 className="font-semibold text-gray-700 dark:text-white text-sm">Church Members</h2>
          </div>
          <div className="relative">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input type="text" placeholder="Search by name or email..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-72 border border-gray-200 dark:border-gray-600 rounded-lg pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-indigo-50 dark:bg-gray-700 text-indigo-800 dark:text-indigo-300 uppercase text-xs">
              <tr>
                {['ID', 'Name', 'Email', 'Gender', 'Phone', 'Address', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <FaUsers className="text-4xl" />
                      <p className="text-sm">{isAdmin ? 'No members found.' : 'No members found. Add the first one!'}</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(m => (
                <tr key={m.id} className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-3 text-gray-400 text-xs">{m.membership_id || '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{m.full_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{m.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{m.gender || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{m.phone_number || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{m.address || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal — members dept only */}
      {showModal && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-800 to-sky-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <LuUserPlus />
                <h2 className="text-base font-semibold">Add New Member</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><LuX /></button>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 border-b border-indigo-100 dark:border-indigo-800">
              <p className="text-xs text-indigo-700 dark:text-indigo-400 italic text-center">
                "Welcome one another as Christ has welcomed you" — Romans 15:7
              </p>
            </div>
            <form onSubmit={handleSubmit} className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name',         key: 'full_name',         type: 'text',  required: true },
                { label: 'Email Address',     key: 'email',             type: 'email' },
                { label: 'Phone Number',      key: 'phone_number',      type: 'text' },
                { label: 'Date of Birth',     key: 'date_of_birth',     type: 'date' },
                { label: 'Date Joined',       key: 'date_joined',       type: 'date' },
                { label: 'Address',           key: 'address',           type: 'text' },
                { label: 'Emergency Contact', key: 'emergency_contact', type: 'text' },
              ].map(({ label, key, type, required }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>
                  <input type={type} required={required} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Male', 'Female'].map(g => (
                    <button type="button" key={g} onClick={() => setForm({ ...form, gender: g })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        form.gender === g ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-400'
                      }`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Active', 'Inactive'].map(s => (
                    <button type="button" key={s} onClick={() => setForm({ ...form, status: s })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        form.status === s ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-400'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-800 to-sky-600 text-white py-2 rounded-lg text-sm font-semibold transition shadow disabled:opacity-60">
                  <LuUserPlus /> {submitting ? 'Saving...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

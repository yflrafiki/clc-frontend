import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, UserCheck, UserRoundX, UserPlus, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMembers } from '../../context/MembersContext';

const EMPTY_FORM = {
  full_name: '', email: '', gender: '', date_of_birth: '', phone_number: '',
  address: '', date_joined: '', emergency_contact: '', status: 'Active',
};

export default function MembersPage() {
  const { user } = useAuth();
  const { members, fetchMembers } = useMembers();
  const isAdmin = user?.role_id === 1;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        await fetchMembers(true);
      } catch {
        toast.error('Failed to load members');
      }
    };

    loadMembers();
  }, [fetchMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await API.post('/members', form);
      toast.success('Member added successfully');
      setForm(EMPTY_FORM);
      setShowModal(false);
      fetchMembers(true);
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
      <div className="relative overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-[#fffaf4] p-6 shadow-[var(--church-shadow)] md:p-8">
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(115deg, rgba(31,45,61,0.08) 0%, rgba(197,154,90,0.08) 35%, transparent 72%)' }}></div>
        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d9c5a6] bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d5d55]">
              <Users className="text-[#b86442]" />
              Church Members
            </div>
            <h1 className="church-title text-4xl text-[#223042] md:text-5xl">Members</h1>
            <p className="mt-2 text-sm text-[#5d554d]">"You are the body of Christ" — 1 Corinthians 12:27</p>
          </div>
          {!isAdmin && (
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1f2d3d] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#2a3d4f]">
              <UserPlus className="h-4 w-4" /> Add Member
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Members', value: members.length, Icon: Users, bg: 'bg-[#eef3fa]', border: 'border-[#dfeaf7]', text: 'text-[#1f2d3d]' },
          { label: 'Active', value: active, Icon: UserCheck, bg: 'bg-[#edf4ef]', border: 'border-[#d8e4d8]', text: 'text-[#2e4a3d]' },
          { label: 'Inactive', value: members.length - active, Icon: UserRoundX, bg: 'bg-[#f8f1ef]', border: 'border-[#e9d0ca]', text: 'text-[#8a4c3a]' },
        ].map(({ label, value, Icon, bg, border, text }) => (
          <div key={label} className={`rounded-[22px] border ${border} ${bg} p-5 shadow-[0_12px_30px_rgba(31,45,61,0.04)]`}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#b86442] shadow-sm">
                <Icon className="text-xl" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${text}`}>{value}</p>
                <p className={`text-[11px] font-medium uppercase tracking-[0.08em] ${text} opacity-80`}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[26px] border border-[#e7d9bd] bg-white/90 shadow-[var(--church-shadow)]">
        <div className="flex flex-col gap-3 border-b border-[#efe4d5] bg-[#faf5ef] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="text-[#b86442]" />
            <h2 className="church-title text-3xl text-[#1f2d3d]">Church Members</h2>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7b6c]" />
            <input type="text" placeholder="Search by name or email..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#e6d9c3] bg-white pl-9 pr-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f1e8] text-[#584f47] uppercase text-[10px] tracking-[0.14em]">
              <tr>
                {['ID', 'Name', 'Email', 'Gender', 'Phone', 'Address', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3eadf]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#7d6a5d]">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="text-4xl text-[#c59a5a]" />
                      <p className="text-sm">{isAdmin ? 'No members found.' : 'No members found. Add the first one!'}</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(m => (
                <tr key={m.id} className="hover:bg-[#faf5ef] transition">
                  <td className="px-4 py-3 text-[#8a7b6c] text-xs">{m.membership_id || '—'}</td>
                  <td className="px-4 py-3 font-medium text-[#1f2d3d]">{m.full_name}</td>
                  <td className="px-4 py-3 text-[#5d554d]">{m.email || '—'}</td>
                  <td className="px-4 py-3 text-[#5d554d]">{m.gender || '—'}</td>
                  <td className="px-4 py-3 text-[#5d554d]">{m.phone_number || '—'}</td>
                  <td className="px-4 py-3 text-[#5d554d]">{m.address || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      m.status === 'Active' ? 'bg-[#dfeee3] text-[#2e4a3d]' : 'bg-[#f7e4df] text-[#8a4c3a]'
                    }`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-white shadow-[var(--church-shadow)] mx-4">
            <div className="flex items-center justify-between bg-[#1f2d3d] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <UserPlus />
                <h2 className="text-base font-semibold">Add New Member</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><X /></button>
            </div>
            <div className="border-b border-[#efe4d5] bg-[#faf5ef] px-6 py-3">
              <p className="text-center text-xs italic text-[#5d554d]">
                "Welcome one another as Christ has welcomed you" — Romans 15:7
              </p>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-2">
              {[
                { label: 'Full Name',         key: 'full_name',         type: 'text',  required: true },
                { label: 'Email Address',     key: 'email',             type: 'email' },
                { label: 'Phone Number',      key: 'phone_number',      type: 'text' },
                { label: 'Date of Birth',     key: 'date_of_birth',     type: 'date' },
                { label: 'Date Joined',       key: 'date_joined',       type: 'date' },
                { label: 'Address',           key: 'address',           type: 'text' },
                { label: 'Emergency Contact', key: 'emergency_contact', type: 'text' },
              ].map(({ label, key, type, required }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">{label}</label>
                  <input type={type} required={required} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Male', 'Female'].map(g => (
                    <button type="button" key={g} onClick={() => setForm({ ...form, gender: g })}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                        form.gender === g ? 'border-[#1f2d3d] bg-[#1f2d3d] text-white' : 'border-[#e6d9c3] bg-[#faf5ef] text-[#5d554d]'
                      }`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Active', 'Inactive'].map(s => (
                    <button type="button" key={s} onClick={() => setForm({ ...form, status: s })}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                        form.status === s ? 'border-[#1f2d3d] bg-[#1f2d3d] text-white' : 'border-[#e6d9c3] bg-[#faf5ef] text-[#5d554d]'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-[#e6d9c3] bg-[#faf5ef] py-2.5 text-sm font-medium text-[#5d554d] transition hover:bg-[#f4efe8]">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 rounded-xl bg-[#1f2d3d] py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#2a3d4f] disabled:opacity-60">
                  <span className="inline-flex items-center gap-2"><UserPlus /> {submitting ? 'Saving...' : 'Add Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

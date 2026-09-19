import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, ReceiptText, Wallet, Landmark, UserPlus, ShieldCheck, Users, Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Tithe', 'Welfare', 'Offering', 'Donation', 'Seed'];
const EMPTY_FORM = { category: 'Tithe', amount: '', bank_name: '', transaction_date: '', notes: '', receipt_image: null };

const ROLE_OPTIONS = [
  { value: 1, label: 'Admin' },
  { value: 2, label: 'Members Dept' },
  { value: 3, label: 'Finance Dept' },
  { value: 4, label: 'Assistant' },
];

const EMPTY_ACCOUNT_FORM = { full_name: '', email: '', password: '', role_id: 2 };

export default function AccountsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1;
  const canViewFinance = [1, 3].includes(user?.role_id);
  const canManageUsers = [1, 4].includes(user?.role_id);
  const [summary, setSummary] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [accountForm, setAccountForm] = useState(EMPTY_ACCOUNT_FORM);
  const [activeTab, setActiveTab] = useState(canViewFinance ? 'summary' : 'users');
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingAccount, setSubmittingAccount] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (canViewFinance) {
      fetchSummary();
      fetchReceipts();
    }

    if (canManageUsers) {
      fetchUsers();
    }
  }, [user, canViewFinance, canManageUsers]);

  useEffect(() => {
    if (!canViewFinance && canManageUsers) {
      setActiveTab('users');
    }
  }, [canViewFinance, canManageUsers]);

  const fetchSummary = async () => { try { const res = await API.get('/accounts/summary'); setSummary(res.data); } catch {} };
  const fetchReceipts = async () => { try { const res = await API.get('/accounts/receipts'); setReceipts(Array.isArray(res.data) ? res.data : []); } catch {} };
  const fetchUsers = async () => { try { const res = await API.get('/auth/users'); setUsers(Array.isArray(res.data) ? res.data : []); } catch {} };

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

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setSubmittingAccount(true);
    try {
      const payload = { ...accountForm, role_id: Number(accountForm.role_id) };
      await API.post('/auth/create-account', payload);
      toast.success('Account created successfully');
      setAccountForm(EMPTY_ACCOUNT_FORM);
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      setSubmittingAccount(false);
    }
  };

  const openEditUser = (userEntry) => {
    setEditingUser(userEntry);
    setAccountForm({
      full_name: userEntry.full_name,
      email: userEntry.email,
      password: '',
      role_id: String(userEntry.role_id),
    });
    setShowUserModal(true);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmittingAccount(true);
    try {
      const payload = {
        full_name: accountForm.full_name,
        email: accountForm.email,
        role_id: Number(accountForm.role_id),
      };
      if (accountForm.password.trim()) payload.password = accountForm.password;

      await API.put(`/auth/users/${editingUser.id}`, payload);
      toast.success('User updated successfully');
      setAccountForm(EMPTY_ACCOUNT_FORM);
      setEditingUser(null);
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update account');
    } finally {
      setSubmittingAccount(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await API.delete(`/auth/users/${userToDelete.id}`);
      toast.success('User deleted successfully');
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
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
    { label: 'Tithes', value: summary.tithe, color: 'text-[#8a5f2d]', bg: 'bg-[#f9f1eb] border-[#ead6b0]' },
    { label: 'Welfare', value: summary.welfare, color: 'text-[#2e4a3d]', bg: 'bg-[#edf4ef] border-[#d8e4d8]' },
    { label: 'Offerings', value: summary.offering, color: 'text-[#5b4c8d]', bg: 'bg-[#f1eefb] border-[#d9d1f3]' },
    { label: 'Donations', value: summary.donation, color: 'text-[#3b6a7a]', bg: 'bg-[#edf6fb] border-[#cfe3eb]' },
    { label: 'Seeds', value: summary.seed, color: 'text-[#2b5e3c]', bg: 'bg-[#ecf7ef] border-[#d5ead9]' },
    { label: 'Grand Total', value: summary.grand_total, color: 'text-[#1f2d3d]', bg: 'bg-[#f3f4f6] border-[#dfe3ea]' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-gradient-to-r from-[#1f2d3d] via-[#2b3a4d] to-[#3a586d] p-6 text-white shadow-[var(--church-shadow)] md:p-8">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.24) 0%, transparent 30%), linear-gradient(135deg, rgba(197,154,90,0.12), rgba(255,255,255,0.02))' }}></div>
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fbe8c9]">
              <Landmark className="text-[#f5d7b4]" />
              Accounts Department
            </div>
            <h1 className="church-title text-4xl text-white md:text-5xl">Financial Accounts</h1>
            <p className="mt-2 text-sm text-white/80">{isAdmin ? 'View all church financial records' : 'Manage all church finances and bank receipts'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isAdmin && (
              <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#1f2d3d] transition hover:bg-[#f7f0e5]">
                <Plus className="h-4 w-4" /> Upload Receipt
              </button>
            )}
            {canManageUsers && (
              <button onClick={() => setShowUserModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#c59a5a] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#d2a56d]">
                <UserPlus className="h-4 w-4" /> Create Account
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {canViewFinance && (
          <button onClick={() => setActiveTab('summary')} className={`rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] transition ${activeTab === 'summary' ? 'bg-[#1f2d3d] text-white' : 'bg-[#f5efe7] text-[#5d554d]'}`}>
            <span className="inline-flex items-center gap-2"><Wallet /> Summary</span>
          </button>
        )}
        {canViewFinance && (
          <button onClick={() => setActiveTab('receipts')} className={`rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] transition ${activeTab === 'receipts' ? 'bg-[#1f2d3d] text-white' : 'bg-[#f5efe7] text-[#5d554d]'}`}>
            <span className="inline-flex items-center gap-2"><ReceiptText /> Receipts</span>
          </button>
        )}
        {canManageUsers && (
          <button onClick={() => setActiveTab('users')} className={`rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] transition ${activeTab === 'users' ? 'bg-[#1f2d3d] text-white' : 'bg-[#f5efe7] text-[#5d554d]'}`}>
            <span className="inline-flex items-center gap-2"><ShieldCheck /> Users</span>
          </button>
        )}
      </div>

      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SUMMARY_CARDS.map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-[22px] border ${bg} p-5 shadow-[0_12px_30px_rgba(31,45,61,0.04)]`}>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#6d5d55]">{label}</p>
              <p className={`mt-3 text-2xl font-bold ${color}`}>GH₵ {Number(value || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="overflow-hidden rounded-[26px] border border-[#e7d9bd] bg-white/90 shadow-[var(--church-shadow)]">
          <div className="flex items-center gap-2 border-b border-[#efe4d5] bg-[#faf5ef] px-5 py-4">
            <ReceiptText className="text-[#1f2d3d]" />
            <h2 className="church-title text-3xl text-[#1f2d3d]">Bank Receipts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f1e8] text-[#584f47] uppercase text-[10px] tracking-[0.14em]">
                <tr>
                  {['Category', 'Amount', 'Bank', 'Date', 'Uploaded By', 'Receipt', 'Notes'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3eadf]">
                {receipts.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-[#7d6a5d]">No receipts uploaded yet.</td></tr>
                ) : receipts.map(r => (
                  <tr key={r.id} className="transition hover:bg-[#faf5ef]">
                    <td className="px-4 py-3"><span className="rounded-full bg-[#f1f3f5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f2d3d]">{r.category}</span></td>
                    <td className="px-4 py-3 font-semibold text-[#1f2d3d]">GH₵ {Number(r.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#5d554d]">{r.bank_name || '—'}</td>
                    <td className="px-4 py-3 text-[#5d554d]">{r.transaction_date ? new Date(r.transaction_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-[#5d554d]">{r.uploaded_by_name || '—'}</td>
                    <td className="px-4 py-3"><a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/receipts/${r.receipt_image}`} target="_blank" rel="noreferrer" className="text-[#3b6a7a] underline-offset-2 hover:underline">View</a></td>
                    <td className="px-4 py-3 text-[#7d6a5d] italic">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && canManageUsers && (
        <div className="overflow-hidden rounded-[26px] border border-[#e7d9bd] bg-white/90 shadow-[var(--church-shadow)]">
          <div className="flex items-center gap-2 border-b border-[#efe4d5] bg-[#faf5ef] px-5 py-4">
            <Users className="text-[#1f2d3d]" />
            <h2 className="church-title text-3xl text-[#1f2d3d]">System Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f1e8] text-[#584f47] uppercase text-[10px] tracking-[0.14em]">
                <tr>
                  {['Name', 'Email', 'Role', 'Role ID', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3eadf]">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-[#7d6a5d]">No users found.</td></tr>
                ) : users.map(userEntry => (
                  <tr key={userEntry.id} className="transition hover:bg-[#faf5ef]">
                    <td className="px-4 py-3 font-medium text-[#1f2d3d]">{userEntry.full_name}</td>
                    <td className="px-4 py-3 text-[#5d554d]">{userEntry.email}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-[#f1f3f5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f2d3d]">{userEntry.role_label}</span></td>
                    <td className="px-4 py-3 text-[#5d554d]">{userEntry.role_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditUser(userEntry)} className="inline-flex items-center gap-1 rounded-lg bg-[#edf3fd] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#214d69] hover:bg-[#e0ebfa]"><Pencil className="h-3 w-3" /> Edit</button>
                        <button onClick={() => setUserToDelete(userEntry)} className="inline-flex items-center gap-1 rounded-lg bg-[#fceeee] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a4c3a] hover:bg-[#fbe1e1]"><Trash2 className="h-3 w-3" /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-white shadow-[var(--church-shadow)]">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#1f2d3d] via-[#2d4056] to-[#49677d] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <ReceiptText />
                <h2 className="text-base font-semibold">Upload Bank Receipt</h2>
              </div>
              <button onClick={() => { setShowModal(false); setPreview(null); }} className="text-white/70 hover:text-white"><X /></button>
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
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Amount (GH₵)</label>
                  <input type="number" required min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Transaction Date</label>
                  <input type="date" required value={form.transaction_date} onChange={e => setForm({ ...form, transaction_date: e.target.value })} className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Bank Name</label>
                <input type="text" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="e.g. GCB Bank" className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Receipt Image (JPG/PNG/PDF)</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} required className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
                {preview && <img src={preview} alt="Preview" className="mt-2 max-h-32 rounded-xl border border-[#e7d9bd] object-contain" />}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Notes (optional)</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="resize-none rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setPreview(null); }} className="flex-1 rounded-xl border border-[#e6d9c3] bg-[#faf5ef] py-2.5 text-sm font-medium text-[#5d554d] transition hover:bg-[#f4efe8]">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-gradient-to-r from-[#1f2d3d] to-[#49677d] py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110 disabled:opacity-60">
                  {submitting ? 'Uploading...' : 'Upload Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserModal && canManageUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md overflow-hidden rounded-[28px] border border-[#e7d9bd] bg-white shadow-[var(--church-shadow)]">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#2e4a3d] via-[#3a603d] to-[#4d7d69] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <UserPlus />
                <h2 className="text-base font-semibold">{editingUser ? 'Edit Account' : 'Create New Account'}</h2>
              </div>
              <button onClick={() => { setShowUserModal(false); setEditingUser(null); setAccountForm(EMPTY_ACCOUNT_FORM); }} className="text-white/70 hover:text-white"><X /></button>
            </div>

            <form onSubmit={editingUser ? handleUpdateAccount : handleCreateAccount} className="space-y-4 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Full Name</label>
                <input type="text" required value={accountForm.full_name} onChange={e => setAccountForm({ ...accountForm, full_name: e.target.value })} className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Email</label>
                <input type="email" required value={accountForm.email} onChange={e => setAccountForm({ ...accountForm, email: e.target.value })} className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
              </div>

              {!editingUser && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Password</label>
                  <input type="password" required value={accountForm.password} onChange={e => setAccountForm({ ...accountForm, password: e.target.value })} className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
                </div>
              )}

              {editingUser && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">New Password (optional)</label>
                  <input type="password" value={accountForm.password} onChange={e => setAccountForm({ ...accountForm, password: e.target.value })} placeholder="Leave blank to keep current password" className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20" />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Role</label>
                <select value={accountForm.role_id} onChange={e => setAccountForm({ ...accountForm, role_id: e.target.value })} className="rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] px-3 py-2.5 text-sm text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20">
                  {ROLE_OPTIONS.filter(option => user?.role_id === 1 ? true : option.value !== 1).map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowUserModal(false); setEditingUser(null); setAccountForm(EMPTY_ACCOUNT_FORM); }} className="flex-1 rounded-xl border border-[#e6d9c3] bg-[#faf5ef] py-2.5 text-sm font-medium text-[#5d554d] transition hover:bg-[#f4efe8]">Cancel</button>
                <button type="submit" disabled={submittingAccount} className="flex-1 rounded-xl bg-gradient-to-r from-[#2e4a3d] to-[#4d7d69] py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110 disabled:opacity-60">
                  {submittingAccount ? (editingUser ? 'Saving...' : 'Creating...') : (editingUser ? 'Save Changes' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-[var(--church-shadow)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <X className="text-2xl text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#1f2d3d]">Delete user?</h3>
            <p className="mb-6 text-sm text-[#5d554d]">This will permanently remove <span className="font-semibold text-[#1f2d3d]">{userToDelete.full_name}</span> from the system.</p>
            <div className="flex gap-3">
              <button onClick={() => setUserToDelete(null)} className="flex-1 rounded-xl border border-[#e6d9c3] bg-[#faf5ef] py-2 text-sm font-medium text-[#5d554d] transition hover:bg-[#f4efe8]">Cancel</button>
              <button onClick={handleDeleteUser} className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-700">Delete</button>
            </div>
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

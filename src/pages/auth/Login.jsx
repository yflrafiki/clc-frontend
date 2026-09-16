import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FaCross } from 'react-icons/fa';
import { LuMail, LuLock, LuLogIn, LuEye, LuEyeOff } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';

const BG_PATTERN = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success('Welcome back! God bless you.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-900 flex-col items-center justify-center p-12 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: BG_PATTERN }}></div>
        <div className="relative flex flex-col items-center text-center gap-6 max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center shadow-2xl">
            <FaCross className="text-white text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">LifeWay Church</h1>
            {/* <p className="text-sm text-white/50 mt-1 uppercase tracking-widest">Church Record Management</p> */}
          </div>
          <div className="border-t border-white/10 pt-6 space-y-4 w-full">
            {[
              { ref: 'Psalm 122:1', text: '"I was glad when they said to me, Let us go to the house of the Lord."' },
              { ref: 'Matthew 18:20', text: '"For where two or three gather in my name, there am I with them."' },
            ].map((s) => (
              <div key={s.ref} className="bg-white/5 rounded-xl px-4 py-3 text-left border border-white/10">
                <p className="text-xs text-white/60 italic">{s.text}</p>
                <p className="text-xs text-amber-400 font-semibold mt-1">{s.ref}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile branding */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center shadow">
              <FaCross className="text-white text-sm" />
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-white text-sm">Christian Life Way</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Church RMS</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome Back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Password</label>
              <div className="relative">
                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <LuEyeOff /> : <LuEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-800 to-sky-600 hover:from-indigo-900 hover:to-sky-700 text-white py-2.5 rounded-lg text-sm font-semibold transition shadow disabled:opacity-60"
            >
              <LuLogIn />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
            <p className="text-xs text-center text-gray-400 italic">"To God be the glory, great things He has done" — Fanny Crosby</p>
          </div>
        </div>
      </div>
    </div>
  );
}

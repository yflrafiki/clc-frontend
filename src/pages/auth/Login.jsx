import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Landmark, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
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
    <div className="flex min-h-screen bg-[#f5efe7]">
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[#1f2d3d] text-white">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255,255,255,0.25) 0%, transparent 32%), linear-gradient(135deg, rgba(197,154,90,0.12), rgba(184,100,66,0.08) 50%, rgba(52,74,98,0.06))' }}></div>
        <div className="relative flex w-full flex-col justify-center p-12">
          <div className="mx-auto flex max-w-sm flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#c59a5a] shadow-[0_20px_45px_rgba(197,154,90,0.4)]">
              <Landmark className="text-3xl text-white" />
            </div>
            <h1 className="church-title text-5xl text-white">LifeWay Church</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.26em] text-[#e7d8bf]">Church Record Management</p>

            <div className="mt-8 w-full space-y-4 border-t border-white/10 pt-6">
              {[
                { ref: 'Psalm 122:1', text: '"I was glad when they said to me, Let us go to the house of the Lord."' },
                { ref: 'Matthew 18:20', text: '"For where two or three gather in my name, there am I with them."' },
              ].map((s) => (
                <div key={s.ref} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left">
                  <p className="text-sm italic text-[#f6eadb]">{s.text}</p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d6b071]">{s.ref}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c59a5a] text-white shadow-[0_10px_25px_rgba(197,154,90,0.25)]">
              <Landmark className="text-sm" />
            </div>
            <div>
              <p className="church-title text-2xl text-[#1f2d3d]">LifeWay Church</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7d6a5d]">Church RMS</p>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#e7d9bd] bg-white/85 p-6 shadow-[var(--church-shadow)] md:p-8">
            <div className="mb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b86442]">Welcome back</p>
              <h2 className="church-title text-4xl text-[#1f2d3d]">Sign in</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7b6c]" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] pl-10 pr-3 py-3 text-sm text-[#1f2d3d] outline-none transition focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7b6c]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] pl-10 pr-11 py-3 text-sm text-[#1f2d3d] outline-none transition focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7b6c] hover:text-[#1f2d3d]"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#1f2d3d] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#2a3d4f] disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2"><LogIn /> {loading ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-2xl border border-[#e7d9bd] bg-[#fffaf3] px-4 py-3 text-center text-xs italic text-[#6a5e52]">
            "To God be the glory, great things He has done" — Fanny Crosby
          </div>
        </div>
      </div>
    </div>
  );
}

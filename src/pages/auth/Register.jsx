import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Landmark, Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';

const BG_PATTERN = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/register', form);
      toast.success('Account created! Welcome to the family.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5efe7]">
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[#1f2d3d] text-white">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.24) 0%, transparent 30%), linear-gradient(135deg, rgba(46,74,61,0.18), rgba(197,154,90,0.12) 45%, rgba(184,100,66,0.08))' }}></div>
        <div className="relative flex w-full flex-col justify-center p-12">
          <div className="mx-auto flex max-w-sm flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#c59a5a] shadow-[0_20px_45px_rgba(197,154,90,0.35)]">
              <Landmark className="text-3xl text-white" />
            </div>
            <h1 className="church-title text-5xl text-white">Join the family</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#e7d8bf]">Christian Life Way Church</p>

            <div className="mt-8 w-full space-y-4 border-t border-white/10 pt-6">
              {[
                { ref: '1 Corinthians 12:27', text: '"Now you are the body of Christ, and each one of you is a part of it."' },
                { ref: 'Romans 15:7', text: '"Welcome one another as Christ has welcomed you, for the glory of God."' },
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b86442]">New account</p>
              <h2 className="church-title text-4xl text-[#1f2d3d]">Create account</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#705f53]">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7b6c]" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full rounded-2xl border border-[#e6d9c3] bg-[#faf5ef] pl-10 pr-3 py-3 text-sm text-[#1f2d3d] outline-none transition focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20"
                  />
                </div>
              </div>

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
                <span className="inline-flex items-center gap-2"><UserPlus /> {loading ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#5d554d]">
              Already have an account?{' '}
              <Link to="/" className="font-semibold text-[#2e4a3d] underline-offset-4 hover:underline">Sign in</Link>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#e7d9bd] bg-[#fffaf3] px-4 py-3 text-center text-xs italic text-[#6a5e52]">
            "Welcome one another as Christ has welcomed you" — Romans 15:7
          </div>
        </div>
      </div>
    </div>
  );
}

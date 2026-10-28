import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { CircleCheckBig, UserRound, UserPlus } from 'lucide-react';

const REMEMBER_KEY = 'checkin_member_id';
const SERVICE_KEY = 'checkin_service';

const read = (key) => { try { return localStorage.getItem(key) || ''; } catch { return ''; } };
const write = (key, value) => {
  try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch { /* storage blocked */ }
};

const inputClass = 'w-full rounded-2xl border border-[#e6d9c3] bg-white px-4 py-3.5 text-base text-[#1f2d3d] outline-none focus:border-[#c59a5a] focus:ring-2 focus:ring-[#c59a5a]/20';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6d5d55]';

export default function CheckInPage() {
  const [services, setServices] = useState([]);
  const [service, setService] = useState(read(SERVICE_KEY));
  const [mode, setMode] = useState('member');
  const [memberId, setMemberId] = useState(read(REMEMBER_KEY));
  const [remember, setRemember] = useState(true);
  const [visitor, setVisitor] = useState({ full_name: '', phone_number: '', first_time: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // The server sleeps when idle and can take up to a minute to wake, so retry a few times
    const load = async (attempt = 1) => {
      try {
        const { data } = await API.get('/attendance/services', { timeout: 70000 });
        if (cancelled) return;
        setServices(data);
        setService((current) => (data.includes(current) ? current : data[0]));
      } catch {
        if (cancelled) return;
        if (attempt < 3) return load(attempt + 1);
        setError('Check-in is not reachable right now. Refresh the page, or see the front desk.');
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const chooseService = (value) => {
    setService(value);
    write(SERVICE_KEY, value);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const { data } = mode === 'member'
        ? await API.post('/attendance/checkin', { membership_id: memberId, service })
        : await API.post('/attendance/visitor', { ...visitor, service });

      if (mode === 'member') write(REMEMBER_KEY, remember ? memberId.trim().toUpperCase() : '');
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed. Please try again or see the front desk.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError('');
    setMemberId(read(REMEMBER_KEY));
    setVisitor({ full_name: '', phone_number: '', first_time: true });
  };

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b86442]">LifeWay Church</p>
          <h1 className="church-title mt-1 text-5xl text-[#1f2d3d]">Check in</h1>
          <p className="mt-1 text-sm text-[#6d5d55]">{today}</p>
        </header>

        {result ? (
          <div className="rounded-[26px] border border-[#d8e4d8] bg-[#edf4ef] p-8 text-center shadow-[var(--church-shadow)]">
            <CircleCheckBig className="mx-auto h-14 w-14 text-[#2e4a3d]" />
            <h2 className="church-title mt-4 text-4xl text-[#2e4a3d]">
              {result.already ? `You're already in, ${result.first_name}` : `Welcome, ${result.first_name}!`}
            </h2>
            <p className="mt-2 text-sm text-[#3f5a4c]">
              You're marked present for <strong>{result.service}</strong> today. God bless you.
            </p>
            <button
              onClick={reset}
              className="mt-6 w-full rounded-2xl border border-[#2e4a3d]/30 bg-white px-4 py-3.5 text-sm font-semibold text-[#2e4a3d] transition hover:bg-[#f6faf7]"
            >
              Check in someone else
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 rounded-[26px] border border-[#e7d9bd] bg-white/90 p-6 shadow-[var(--church-shadow)]">
            <div>
              <label htmlFor="service" className={labelClass}>Service</label>
              <select id="service" value={service} onChange={(e) => chooseService(e.target.value)} className={inputClass}>
                {services.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f5efe7] p-1" role="tablist">
              {[
                { key: 'member', label: "I'm a member", Icon: UserRound },
                { key: 'visitor', label: "I'm visiting", Icon: UserPlus },
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={mode === key}
                  onClick={() => { setMode(key); setError(''); }}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    mode === key ? 'bg-white text-[#1f2d3d] shadow-sm' : 'text-[#6d5d55]'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>

            {mode === 'member' ? (
              <div className="space-y-3">
                <div>
                  <label htmlFor="memberId" className={labelClass}>Member ID</label>
                  <input
                    id="memberId"
                    required
                    autoComplete="off"
                    autoCapitalize="characters"
                    placeholder="LC/2025/001"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-[#7d6a5d]">Don't know your ID? Ask the front desk.</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-[#5d554d]">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#2e4a3d]" />
                  Remember my ID on this phone
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className={labelClass}>Full name</label>
                  <input
                    id="fullName"
                    required
                    autoComplete="name"
                    value={visitor.full_name}
                    onChange={(e) => setVisitor({ ...visitor, full_name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone number</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={visitor.phone_number}
                    onChange={(e) => setVisitor({ ...visitor, phone_number: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <fieldset>
                  <legend className={labelClass}>Is this your first time here?</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ value: true, label: 'Yes, first time' }, { value: false, label: "No, I've visited" }].map(({ value, label }) => (
                      <label
                        key={label}
                        className={`cursor-pointer rounded-2xl border px-3 py-3 text-center text-sm font-semibold transition ${
                          visitor.first_time === value ? 'border-[#2e4a3d] bg-[#edf4ef] text-[#2e4a3d]' : 'border-[#e6d9c3] bg-white text-[#5d554d]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="firstTime"
                          className="sr-only"
                          checked={visitor.first_time === value}
                          onChange={() => setVisitor({ ...visitor, first_time: value })}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {services.length === 0 && !error && (
              <p className="text-center text-xs text-[#7d6a5d]">Connecting to check-in. This can take up to a minute the first time.</p>
            )}

            {error && (
              <p className="rounded-2xl border border-[#ecc9b8] bg-[#fbeee7] px-4 py-3 text-sm text-[#8a3f22]">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy || services.length === 0}
              className="w-full rounded-2xl bg-[#1f2d3d] px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#2a3d4f] disabled:opacity-60"
            >
              {busy ? 'Checking in…' : services.length === 0 ? 'Connecting…' : 'Mark me present'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

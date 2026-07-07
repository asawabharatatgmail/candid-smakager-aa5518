import { useState, useEffect } from 'react';
import { api, saveSession } from '../services/api';

interface Props {
  onAuth: () => void;
  showToast: (msg: string, type?: 'error' | 'success') => void;
}

// Loading messages cycling during cold-start wait
const WAKE_MSGS = [
  '⏳ Connecting to server…',
  '🔄 Server is waking up (free tier sleeps when idle)…',
  '☕ Almost there — first request takes up to 60 seconds…',
  '✅ Nearly ready…',
];

export default function AuthScreen({ onAuth, showToast }: Props) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  // Login fields
  const [lemail, setLemail] = useState('');
  const [lpass, setLpass] = useState('');

  // Register fields
  const [rname, setRname] = useState('');
  const [remail, setRemail] = useState('');
  const [rpass, setRpass] = useState('');
  const [rmobile, setRmobile] = useState('');
  const [rgrade, setRgrade] = useState('Class 10');

  useEffect(() => {
    // Warm up backend immediately so it's ready by the time user fills the form
    api.ping();
  }, []);

  // Cycle through wake-up messages every 15s while loading
  useEffect(() => {
    if (!loading) { setLoadingMsg(''); return; }
    let i = 0;
    setLoadingMsg(WAKE_MSGS[0]);
    const t = setInterval(() => {
      i = Math.min(i + 1, WAKE_MSGS.length - 1);
      setLoadingMsg(WAKE_MSGS[i]);
    }, 15000);
    return () => clearInterval(t);
  }, [loading]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!lemail || !lpass) { showToast('Please fill in all fields', 'error'); return; }
    setLoading(true);
    try {
      const resp = await api.login(lemail.trim(), lpass);
      saveSession(resp);
      showToast(`Welcome back, ${resp.user.name.split(' ')[0]}!`, 'success');
      setTimeout(onAuth, 400);
    } catch (err: any) {
      showToast(err?.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!rname || !remail || !rpass) {
      showToast('Please fill in name, email and password', 'error');
      return;
    }
    if (rpass.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    setLoading(true);
    try {
      const resp = await api.register(rname.trim(), remail.trim(), rpass, rmobile.trim(), rgrade);
      saveSession(resp);
      showToast(`Welcome, ${resp.user.name.split(' ')[0]}! Your 7-day trial has started. 🎉`, 'success');
      setTimeout(onAuth, 600);
    } catch (err: any) {
      showToast(err?.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <div className="auth-logo">System4Learn</div>
        <div className="auth-tagline">AI-Powered Student Learning Platform</div>
      </div>

      {/* Cold-start banner — visible while any request is in flight */}
      {loading && loadingMsg && (
        <div style={{
          margin: '12px 20px 0',
          padding: '12px 16px',
          background: 'rgba(124,58,237,0.1)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 12,
          fontSize: 13,
          color: 'var(--primary-l)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          lineHeight: 1.4,
        }}>
          <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, flexShrink: 0 }} />
          {loadingMsg}
        </div>
      )}

      <div className="auth-tabs">
        <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
          Login
        </button>
        <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
          Register
        </button>
      </div>

      {tab === 'login' ? (
        <form className="auth-form" onSubmit={handleLogin}>
          <div>
            <label className="field-label">Email Address</label>
            <input
              className="field-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={lemail}
              onChange={e => setLemail(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={lpass}
              onChange={e => setLpass(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in…</> : '🔓 Login to Your Account'}
          </button>
          <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            Don't have an account?{' '}
            <span
              style={{ color: 'var(--primary-l)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setTab('register')}
            >
              Register free
            </span>
          </p>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleRegister}>
          <div>
            <label className="field-label">Full Name</label>
            <input
              className="field-input"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={rname}
              onChange={e => setRname(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Email Address</label>
            <input
              className="field-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={remail}
              onChange={e => setRemail(e.target.value)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="field-label">Mobile (optional)</label>
              <input
                className="field-input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                value={rmobile}
                onChange={e => setRmobile(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Grade</label>
              <select
                className="field-input"
                value={rgrade}
                onChange={e => setRgrade(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6',
                  'Class 7','Class 8','Class 9','Class 10','Class 11','Class 12',
                  'College','Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              autoComplete="new-password"
              placeholder="Min 8 characters"
              value={rpass}
              onChange={e => setRpass(e.target.value)}
            />
          </div>
          <div className="card" style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
            🎁 Start with a <strong style={{ color: 'var(--warn)' }}>7-day free trial</strong> — full access, no credit card required.
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account…</> : '🚀 Create Free Account'}
          </button>
          <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            Already registered?{' '}
            <span
              style={{ color: 'var(--primary-l)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setTab('login')}
            >
              Login here
            </span>
          </p>
        </form>
      )}
    </div>
  );
}

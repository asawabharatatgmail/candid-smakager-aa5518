import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { DEMO_CREDENTIALS } from '../data/seedData';
import { forgotPassword as apiForgotPassword, resetPassword as apiResetPassword } from '../services/apiClient';

type LoginTab = 'institute' | 'parent' | 'student';
type ExtMode = 'login' | 'register';

const PYTHON_API = import.meta.env.VITE_API_URL || 'https://eduveda-api.onrender.com';
const GRADE_OPTIONS = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'];
const SUBJECT_OPTIONS = ['Mathematics','Physics','Chemistry','Biology','English','Hindi','History','Geography','Social Science','Computer Science','Economics'];

// ── Password strength ─────────────────────────────────────────────────────────

function pwStrength(pw: string): { score: number; label: string; color: string; bg: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'text-red-500', bg: 'bg-red-400' };
  if (score === 2) return { score, label: 'Fair', color: 'text-orange-500', bg: 'bg-orange-400' };
  if (score === 3) return { score, label: 'Good', color: 'text-yellow-500', bg: 'bg-yellow-400' };
  return { score, label: 'Strong', color: 'text-green-600', bg: 'bg-green-500' };
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color, bg } = pwStrength(password);
  const pct = (score / 5) * 100;
  return (
    <div className="mt-1.5">
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${bg}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-xs mt-0.5 font-medium ${color}`}>{label}</p>
    </div>
  );
}

// ── Field validators (client-side mirror of backend) ──────────────────────────

function validateName(v: string): string {
  if (v.length < 2) return 'At least 2 characters required.';
  if (!/^[A-Za-z\s.\-']+$/.test(v.trim())) return 'Letters, spaces, hyphens, apostrophes only.';
  return '';
}
function validateMobile(v: string): string {
  const clean = v.replace(/[\s\-\(\)\+]/g, '').replace(/^91(\d{10})$/, '$1');
  if (!/^[6-9]\d{9}$/.test(clean)) return 'Valid 10-digit Indian number required.';
  return '';
}
function validateEmail(v: string): string {
  if (!v) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address (e.g. you@gmail.com).';
  return '';
}
function validateCity(v: string): string {
  if (!v) return '';
  if (!/^[A-Za-z\s.\-']+$/.test(v.trim())) return 'Letters and spaces only.';
  return '';
}

// ── Inline field error ─────────────────────────────────────────────────────────

const FieldError: React.FC<{ msg: string }> = ({ msg }) =>
  msg ? <p className="text-xs text-red-500 mt-0.5">{msg}</p> : null;

// ── Trial badge ───────────────────────────────────────────────────────────────

const TrialBadge: React.FC<{ color?: string }> = ({ color = 'indigo' }) => (
  <div className={`flex items-center gap-2 bg-${color}-50 border border-${color}-200 rounded-xl px-3 py-2 text-xs`}>
    <span className="text-base">🎁</span>
    <span className={`text-${color}-700 font-medium`}>
      <strong>7-day free trial</strong> included — no credit card required
    </span>
  </div>
);

// ── Forgot / Reset inline flow ────────────────────────────────────────────────

const ForgotPasswordInline: React.FC<{ accentColor: string; onBack: () => void }> = ({ accentColor, onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErr(''); setLoading(true);
    try { await apiForgotPassword(email); } catch { /* always show success */ }
    finally { setLoading(false); setDone(true); }
  };

  if (done) return (
    <div className="text-center py-4 space-y-3">
      <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">✉️</div>
      <p className="font-semibold text-slate-800">Check your email</p>
      <p className="text-xs text-slate-500">If an account with <strong>{email}</strong> exists, a reset link has been sent (valid 1 hour).</p>
      <button onClick={onBack} className="text-xs text-blue-600 hover:underline">← Back to sign in</button>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm text-slate-600">Enter your email to receive a password reset link.</p>
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
      {err && <p className="text-xs text-red-500">{err}</p>}
      <button type="submit" disabled={loading}
        className={`w-full py-3 rounded-xl font-bold text-sm text-white bg-${accentColor}-600 hover:bg-${accentColor}-700 flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}>
        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : 'Send Reset Link'}
      </button>
      <button type="button" onClick={onBack} className="w-full text-xs text-slate-400 hover:text-slate-600">← Back to sign in</button>
    </form>
  );
};

// ── Reset password page (shown when ?token= is in URL) ────────────────────────

const ResetPasswordForm: React.FC<{ token: string }> = ({ token }) => {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) { setErr('Passwords do not match.'); return; }
    setErr(''); setLoading(true);
    try {
      await apiResetPassword(token, pw);
      setDone(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } catch (ex: any) {
      setErr(ex.message || 'Invalid or expired reset link. Please request a new one.');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
        <h2 className="text-xl font-bold text-slate-900">Password updated!</h2>
        <p className="text-sm text-slate-500">You can now sign in with your new password.</p>
        <button onClick={() => window.history.replaceState({}, '', window.location.pathname)}
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Go to Sign In
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <i className="ri-lock-password-line text-white text-lg" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Set new password</h2>
            <p className="text-xs text-slate-500">System4Learn</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
            <input type="password" required value={pw} onChange={e => setPw(e.target.value)}
              placeholder="Min 8 chars, uppercase, number, symbol"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
            <PasswordStrengthBar password={pw} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
            <input type="password" required value={pw2} onChange={e => setPw2(e.target.value)}
              placeholder="Repeat new password"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
            {pw2 && pw !== pw2 && <p className="text-xs text-red-500 mt-0.5">Passwords don't match.</p>}
          </div>
          {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
          <button type="submit" disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}>
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Main LoginPage ────────────────────────────────────────────────────────────

const LoginPage: React.FC = () => {
  const { login, setShowLoginPage, openForgotPasswordModal, institutes, loginExternal, registerExternalParent, registerExternalStudent, roleConfigs } = useAppContext();

  // Check for password reset token in URL
  const urlToken = new URLSearchParams(window.location.search).get('token');
  if (urlToken) return <ResetPasswordForm token={urlToken} />;

  const [activeTab, setActiveTab]   = useState<LoginTab>('institute');
  const [extMode, setExtMode]       = useState<ExtMode>('login');
  const [showForgotExt, setShowForgotExt] = useState(false);

  // Institute login
  const [instituteName, setInstituteName] = useState(institutes[0]?.name || '');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  // External shared
  const [extEmail, setExtEmail]     = useState('');
  const [extPwd, setExtPwd]         = useState('');
  const [extShowPwd, setExtShowPwd] = useState(false);
  const [extError, setExtError]     = useState('');
  const [extLoading, setExtLoading] = useState(false);

  // Register extra
  const [regName, setRegName]       = useState('');
  const [regMobile, setRegMobile]   = useState('');
  const [regCity, setRegCity]       = useState('');
  const [regGrade, setRegGrade]     = useState('Class 10');
  const [regAge, setRegAge]         = useState('15');
  const [regSubjects, setRegSubjects] = useState<string[]>([]);
  const [regSchool, setRegSchool]   = useState('');

  // Validation touched state
  const [touched, setTouched] = useState({ name: false, email: false, mobile: false, city: false });

  useEffect(() => {
    if (institutes.length > 0 && !instituteName) setInstituteName(institutes[0].name);
  }, [institutes]);

  // Wake up the Render backend on mount so it's warm before the user submits
  useEffect(() => {
    fetch(`${PYTHON_API}/health`, { method: 'GET' }).catch(() => {});
  }, []);

  const parentRegOpen  = roleConfigs.find(rc => rc.role === 'External Parent')?.registrationOpen ?? true;
  const studentRegOpen = roleConfigs.find(rc => rc.role === 'External Student')?.registrationOpen ?? true;

  const toggleSubject = (s: string) => setRegSubjects(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const resetExt = () => {
    setExtEmail(''); setExtPwd(''); setExtError('');
    setRegName(''); setRegMobile(''); setRegCity('');
    setRegGrade('Class 10'); setRegAge('15'); setRegSubjects([]); setRegSchool('');
    setTouched({ name: false, email: false, mobile: false, city: false });
    setShowForgotExt(false);
  };

  // ── Institute login ──
  const handleInstituteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const ok = await login(instituteName, identifier, password || undefined);
      if (!ok) setError('Invalid credentials. Check your institute, email / mobile, and password.');
    } catch { setError('An unexpected error occurred.'); }
    finally { setLoading(false); }
  };

  const fillDemo = (email: string) => {
    setIdentifier(email); setPassword(''); setError('');
    if (institutes.length > 0) setInstituteName(institutes[0].name);
  };

  // ── External login ──
  const handleExtLogin = async () => {
    if (!extEmail || !extPwd) return;
    setExtError(''); setExtLoading(true);
    try {
      const result = await loginExternal(extEmail, extPwd);
      if (!result) setExtError('Invalid email or password. Please try again.');
    } finally {
      setExtLoading(false);
    }
  };

  // ── External register (parent) ──
  const handleRegParent = async () => {
    const nameErr = validateName(regName);
    const emailErr = validateEmail(extEmail);
    const mobileErr = validateMobile(regMobile);
    const cityErr = validateCity(regCity);
    setTouched({ name: true, email: true, mobile: true, city: true });
    if (nameErr || emailErr || mobileErr || cityErr) { setExtError('Please fix the highlighted fields.'); return; }
    if (!extPwd) { setExtError('Password is required.'); return; }
    setExtError(''); setExtLoading(true);
    try {
      await registerExternalParent({ name: regName, email: extEmail, password: extPwd, mobile: regMobile, city: regCity });
    } catch (e: any) {
      const msg = e?.message || '';
      setExtError(msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')
        ? 'Server is starting up — your request is being retried automatically. Please wait a moment…'
        : msg || 'Registration failed. Please try again.');
    } finally {
      setExtLoading(false);
    }
  };

  // ── External register (student) ──
  const handleRegStudent = async () => {
    const nameErr = validateName(regName);
    const emailErr = validateEmail(extEmail);
    const mobileErr = regMobile ? validateMobile(regMobile) : '';
    const cityErr = validateCity(regCity);
    setTouched({ name: true, email: true, mobile: true, city: true });
    if (nameErr || emailErr || mobileErr || cityErr) { setExtError('Please fix the highlighted fields.'); return; }
    if (!extPwd) { setExtError('Password is required.'); return; }
    setExtError(''); setExtLoading(true);
    try {
      await registerExternalStudent({ name: regName, email: extEmail, password: extPwd, mobile: regMobile, grade: regGrade, age: parseInt(regAge) || 15, subjectsOfInterest: regSubjects, schoolName: regSchool, city: regCity });
    } catch (e: any) {
      const msg = e?.message || '';
      setExtError(msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')
        ? 'Server is starting up — your request is being retried automatically. Please wait a moment…'
        : msg || 'Registration failed. Please try again.');
    } finally {
      setExtLoading(false);
    }
  };

  // ── Tab config ──
  const tabs: { id: LoginTab; label: string; icon: string; desc: string; color: string; activeColor: string }[] = [
    { id: 'institute', label: 'Institute',   icon: '🏫', desc: 'Admins, teachers, students', color: 'hover:border-blue-300',   activeColor: 'border-blue-500 bg-blue-600 text-white' },
    { id: 'parent',    label: 'Parent',      icon: '👨‍👩‍👧', desc: 'Independent parent portal',  color: 'hover:border-indigo-300', activeColor: 'border-indigo-500 bg-indigo-600 text-white' },
    { id: 'student',   label: 'Student',     icon: '🎓', desc: 'Self-learning platform',       color: 'hover:border-violet-300', activeColor: 'border-violet-500 bg-violet-600 text-white' },
  ];

  // ── Register common fields with inline validation ──
  const renderRegisterCommon = (requireMobile = true) => (
    <>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
        <input type="text" value={regName}
          onChange={e => setRegName(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, name: true }))}
          placeholder="Your full name"
          className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 ${touched.name && validateName(regName) ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
        {touched.name && <FieldError msg={validateName(regName)} />}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
          <input type="email" value={extEmail}
            onChange={e => setExtEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            placeholder="you@gmail.com"
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 ${touched.email && validateEmail(extEmail) ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
          {touched.email && <FieldError msg={validateEmail(extEmail)} />}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password *</label>
          <input type="password" value={extPwd} onChange={e => setExtPwd(e.target.value)} placeholder="Create password"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
          <PasswordStrengthBar password={extPwd} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mobile{requireMobile ? ' *' : ''}</label>
          <input type="tel" value={regMobile}
            onChange={e => setRegMobile(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, mobile: true }))}
            placeholder="9900001234"
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 ${touched.mobile && validateMobile(regMobile) ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
          {touched.mobile && <FieldError msg={validateMobile(regMobile)} />}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
          <input type="text" value={regCity}
            onChange={e => setRegCity(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, city: true }))}
            placeholder="Mumbai"
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 ${touched.city && validateCity(regCity) ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
          {touched.city && <FieldError msg={validateCity(regCity)} />}
        </div>
      </div>
    </>
  );

  const renderExtLoginForm = (type: LoginTab, accentColor: string) => {
    if (showForgotExt) {
      return <ForgotPasswordInline accentColor={accentColor} onBack={() => setShowForgotExt(false)} />;
    }
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
          <input type="email" value={extEmail} onChange={e => setExtEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-600">Password</label>
            <button type="button" onClick={() => setShowForgotExt(true)}
              className={`text-xs text-${accentColor}-600 hover:underline font-medium`}>Forgot password?</button>
          </div>
          <div className="relative">
            <input type={extShowPwd ? 'text' : 'password'} value={extPwd} onChange={e => setExtPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 pr-12" />
            <button type="button" onClick={() => setExtShowPwd(!extShowPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
              {extShowPwd ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {extError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{extError}</p>}
        <button onClick={handleExtLogin} disabled={extLoading}
          className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-colors flex items-center justify-center gap-2
            ${type === 'parent' ? `bg-${accentColor}-600 hover:bg-${accentColor}-700` : `bg-${accentColor}-600 hover:bg-${accentColor}-700`}
            ${extLoading ? 'opacity-70' : ''}`}>
          {extLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : 'Sign In'}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-10 text-white"
        style={{ background: 'linear-gradient(160deg, #1E1B4B 0%, #1E3A8A 55%, #2563EB 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <i className="ri-graduation-cap-line text-white text-xl" />
          </div>
          <span className="text-xl font-bold">System4Learn</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black leading-tight">One platform,<br />three gateways.</h2>
          {[
            { icon: '🏫', title: 'Institute',  desc: 'Full academic management — admins, teachers, students, fees, analytics' },
            { icon: '👨‍👩‍👧', title: 'Parent',    desc: 'Monitor your children, AI progress reports, multi-child support' },
            { icon: '🎓', title: 'Student',   desc: 'Self-study with AI, challenges, public library, leaderboards' },
          ].map(t => (
            <div key={t.title} className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="font-bold text-sm">{t.title}</p>
                <p className="text-xs text-indigo-200 leading-snug">{t.desc}</p>
              </div>
            </div>
          ))}
          {/* Password policy hint */}
          <div className="bg-white/10 rounded-xl px-4 py-3 text-xs text-indigo-200 space-y-1">
            <p className="font-semibold text-white">Password requirements</p>
            <p>Min 8 chars · Uppercase · Lowercase · Number · Special char</p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="bg-white/10 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-semibold text-indigo-200 uppercase mb-2">Institute Demo Access</p>
          {DEMO_CREDENTIALS.map(c => (
            <button key={c.email} onClick={() => { setActiveTab('institute'); setTimeout(() => fillDemo(c.email), 100); }}
              className="w-full flex items-center justify-between text-left bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-colors group">
              <div>
                <p className="text-xs font-semibold text-white">{c.role}</p>
                <p className="text-xs text-indigo-300">{c.email}</p>
              </div>
              <i className="ri-arrow-right-line text-indigo-400 group-hover:text-white" />
            </button>
          ))}
          <div className="border-t border-white/10 pt-2 mt-1 space-y-1 text-xs">
            <p className="text-indigo-300 font-semibold">External Demos:</p>
            <p className="text-indigo-200">👨‍👩‍👧 sunita@external.com / parent123</p>
            <p className="text-indigo-200">🎓 prateek@external.com / student123</p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <i className="ri-graduation-cap-line text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">System4Learn</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-6">Choose your access type to continue</p>

          {/* ── 3 Tab Switcher ── */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-slate-100 rounded-2xl">
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setExtMode('login'); resetExt(); setError(''); }}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all text-sm font-bold
                  ${activeTab === t.id ? t.activeColor + ' shadow-md' : 'border-transparent text-slate-500 hover:text-slate-700 ' + t.color}`}>
                <span className="text-xl">{t.icon}</span>
                <span className="text-xs font-semibold">{t.label}</span>
              </button>
            ))}
          </div>

          {/* ──────────── INSTITUTE TAB ──────────── */}
          {activeTab === 'institute' && (
            <form onSubmit={handleInstituteLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Institute</label>
                <div className="relative">
                  <i className="ri-building-2-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select required value={instituteName} onChange={e => setInstituteName(e.target.value)}
                    className="input-field pl-9 appearance-none w-full">
                    {institutes.length === 0 && <option value="">No institutes found</option>}
                    {institutes.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email or Mobile</label>
                <div className="relative">
                  <i className="ri-user-3-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" required value={identifier} onChange={e => setIdentifier(e.target.value)}
                    className="input-field pl-9 w-full" placeholder="your.email@example.com" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600">Password</label>
                  <span className="text-xs text-slate-400">Leave blank for demo mode</span>
                </div>
                <div className="relative">
                  <i className="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    className="input-field pl-9 pr-10 w-full" placeholder="Leave blank for demo" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <i className={showPwd ? 'ri-eye-off-line' : 'ri-eye-line'} />
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-xl p-3">
                  <i className="ri-error-warning-line text-red-500 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 text-sm justify-center disabled:opacity-60">
                {loading ? <><i className="ri-loader-4-line animate-spin" /> Signing in…</> : <><i className="ri-login-circle-line" /> Sign In</>}
              </button>
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={openForgotPasswordModal} className="text-blue-600 hover:underline font-medium">Forgot password?</button>
                <button type="button" onClick={() => setShowLoginPage(false)} className="text-slate-400 hover:text-slate-600">← Back to home</button>
              </div>

              {/* Mobile demo */}
              <div className="lg:hidden bg-blue-50 rounded-2xl p-4 border border-blue-100 space-y-2">
                <p className="text-xs font-semibold text-blue-700">Quick Demo — tap to fill</p>
                {DEMO_CREDENTIALS.map(c => (
                  <button key={c.email} type="button" onClick={() => fillDemo(c.email)}
                    className="w-full flex items-center justify-between bg-white border border-blue-100 rounded-xl px-3 py-2 hover:border-blue-300 transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{c.role}</p>
                      <p className="text-xs text-blue-600">{c.email}</p>
                    </div>
                    <i className="ri-arrow-right-line text-blue-400" />
                  </button>
                ))}
              </div>
            </form>
          )}

          {/* ──────────── PARENT TAB ──────────── */}
          {activeTab === 'parent' && (
            <div className="space-y-4">
              {/* Login / Register toggle */}
              {!showForgotExt && (
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                  {(['login', ...(parentRegOpen ? ['register'] : [])] as ExtMode[]).map(m => (
                    <button key={m} onClick={() => { setExtMode(m); resetExt(); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${extMode === m ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
                      {m === 'login' ? '🔑 Sign In' : '✨ Register Free'}
                    </button>
                  ))}
                </div>
              )}

              {!showForgotExt && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm">
                  <p className="font-semibold text-indigo-800">👨‍👩‍👧 External Parent Portal</p>
                  <p className="text-xs text-indigo-600 mt-0.5">Independent of any institute — manage your children's learning with AI tools</p>
                </div>
              )}

              {extMode === 'login' ? (
                <>
                  {renderExtLoginForm('parent', 'indigo')}
                  {!showForgotExt && <p className="text-xs text-center text-slate-400">Demo: sunita@external.com / parent123</p>}
                </>
              ) : (
                <div className="space-y-3">
                  <TrialBadge color="indigo" />
                  {renderRegisterCommon(true)}
                  {extError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{extError}</p>}
                  <button onClick={handleRegParent} disabled={extLoading}
                    className={`w-full py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 ${extLoading ? 'opacity-70' : ''}`}>
                    {extLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : 'Create Parent Account — Free'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ──────────── STUDENT TAB ──────────── */}
          {activeTab === 'student' && (
            <div className="space-y-4">
              {/* Login / Register toggle */}
              {!showForgotExt && (
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                  {(['login', ...(studentRegOpen ? ['register'] : [])] as ExtMode[]).map(m => (
                    <button key={m} onClick={() => { setExtMode(m); resetExt(); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${extMode === m ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}>
                      {m === 'login' ? '🔑 Sign In' : '✨ Register Free'}
                    </button>
                  ))}
                </div>
              )}

              {!showForgotExt && (
                <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
                  <p className="font-semibold text-violet-800 text-sm">🎓 External Student Platform</p>
                  <p className="text-xs text-violet-600 mt-0.5">AI quizzes, study challenges, public library, progress tracking — completely independent</p>
                </div>
              )}

              {extMode === 'login' ? (
                <>
                  {renderExtLoginForm('student', 'violet')}
                  {!showForgotExt && <p className="text-xs text-center text-slate-400">Demo: prateek@external.com / student123</p>}
                </>
              ) : (
                <div className="space-y-3">
                  <TrialBadge color="violet" />
                  {renderRegisterCommon(false)}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Grade *</label>
                      <select value={regGrade} onChange={e => setRegGrade(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400">
                        {GRADE_OPTIONS.map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Age *</label>
                      <input type="number" min={8} max={22} value={regAge} onChange={e => setRegAge(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">School Name</label>
                    <input type="text" value={regSchool} onChange={e => setRegSchool(e.target.value)} placeholder="Your school"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subjects of Interest</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SUBJECT_OPTIONS.map(s => (
                        <button key={s} type="button" onClick={() => toggleSubject(s)}
                          className={`text-xs px-2 py-1 rounded-full border font-medium transition-colors ${regSubjects.includes(s) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {extError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{extError}</p>}
                  <button onClick={handleRegStudent} disabled={extLoading}
                    className={`w-full py-3 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-2 ${extLoading ? 'opacity-70' : ''}`}>
                    {extLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : 'Create Student Account — Free'}
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-center text-slate-400 mt-5">
            <button onClick={() => setShowLoginPage(false)} className="hover:text-slate-600">← Back to home</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { DEMO_CREDENTIALS } from '../data/seedData';

type LoginTab = 'institute' | 'parent' | 'student';
type ExtMode = 'login' | 'register';

const GRADE_OPTIONS = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'];
const SUBJECT_OPTIONS = ['Mathematics','Physics','Chemistry','Biology','English','Hindi','History','Geography','Social Science','Computer Science','Economics'];

const LoginPage: React.FC = () => {
  const { login, setShowLoginPage, openForgotPasswordModal, institutes, loginExternal, registerExternalParent, registerExternalStudent, roleConfigs } = useAppContext();

  const [activeTab, setActiveTab]   = useState<LoginTab>('institute');
  const [extMode, setExtMode]       = useState<ExtMode>('login');

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

  useEffect(() => {
    if (institutes.length > 0 && !instituteName) setInstituteName(institutes[0].name);
  }, [institutes]);

  const parentRegOpen  = roleConfigs.find(rc => rc.role === 'External Parent')?.registrationOpen ?? true;
  const studentRegOpen = roleConfigs.find(rc => rc.role === 'External Student')?.registrationOpen ?? true;

  const toggleSubject = (s: string) => setRegSubjects(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const resetExt = () => {
    setExtEmail(''); setExtPwd(''); setExtError('');
    setRegName(''); setRegMobile(''); setRegCity('');
    setRegGrade('Class 10'); setRegAge('15'); setRegSubjects([]); setRegSchool('');
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
      if (!result) setExtError('Invalid email or password, or the server is unreachable. Please try again.');
    } finally {
      setExtLoading(false);
    }
  };

  // ── External register (parent) ──
  const handleRegParent = async () => {
    if (!regName || !extEmail || !extPwd || !regMobile) { setExtError('Please fill all required fields.'); return; }
    setExtError(''); setExtLoading(true);
    try {
      const ok = await registerExternalParent({ name: regName, email: extEmail, password: extPwd, mobile: regMobile, city: regCity });
      if (!ok) setExtError('An account with this email already exists, or the server is unreachable.');
    } finally {
      setExtLoading(false);
    }
  };

  // ── External register (student) ──
  const handleRegStudent = async () => {
    if (!regName || !extEmail || !extPwd) { setExtError('Please fill all required fields.'); return; }
    setExtError(''); setExtLoading(true);
    try {
      const ok = await registerExternalStudent({ name: regName, email: extEmail, password: extPwd, mobile: regMobile, grade: regGrade, age: parseInt(regAge) || 15, subjectsOfInterest: regSubjects, schoolName: regSchool, city: regCity });
      if (!ok) setExtError('An account with this email already exists, or the server is unreachable.');
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

  const renderExtLoginForm = (type: LoginTab) => (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
        <input type="email" value={extEmail} onChange={e => setExtEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
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
          ${type === 'parent' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-violet-600 hover:bg-violet-700'}
          ${extLoading ? 'opacity-70' : ''}`}>
        {extLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : 'Sign In'}
      </button>
    </div>
  );

  const renderRegisterCommon = () => (
    <>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
        <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Your full name"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
          <input type="email" value={extEmail} onChange={e => setExtEmail(e.target.value)} placeholder="you@email.com"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password *</label>
          <input type="password" value={extPwd} onChange={e => setExtPwd(e.target.value)} placeholder="Create password"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mobile</label>
          <input type="tel" value={regMobile} onChange={e => setRegMobile(e.target.value)} placeholder="9900001234"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
          <input type="text" value={regCity} onChange={e => setRegCity(e.target.value)} placeholder="Mumbai"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
      </div>
    </>
  );

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

        {/* Tab Highlights */}
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
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                {(['login', ...(parentRegOpen ? ['register'] : [])] as ExtMode[]).map(m => (
                  <button key={m} onClick={() => { setExtMode(m); resetExt(); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${extMode === m ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
                    {m === 'login' ? '🔑 Sign In' : '✨ Register Free'}
                  </button>
                ))}
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm">
                <p className="font-semibold text-indigo-800">👨‍👩‍👧 External Parent Portal</p>
                <p className="text-xs text-indigo-600 mt-0.5">Independent of any institute — manage your children's learning with AI tools</p>
              </div>

              {extMode === 'login' ? (
                <>
                  {renderExtLoginForm('parent')}
                  <p className="text-xs text-center text-slate-400">Demo: sunita@external.com / parent123</p>
                </>
              ) : (
                <div className="space-y-3">
                  {renderRegisterCommon()}
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
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                {(['login', ...(studentRegOpen ? ['register'] : [])] as ExtMode[]).map(m => (
                  <button key={m} onClick={() => { setExtMode(m); resetExt(); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${extMode === m ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}>
                    {m === 'login' ? '🔑 Sign In' : '✨ Register Free'}
                  </button>
                ))}
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
                <p className="font-semibold text-violet-800 text-sm">🎓 External Student Platform</p>
                <p className="text-xs text-violet-600 mt-0.5">AI quizzes, study challenges, public library, progress tracking — completely independent</p>
              </div>

              {extMode === 'login' ? (
                <>
                  {renderExtLoginForm('student')}
                  <p className="text-xs text-center text-slate-400">Demo: prateek@external.com / student123</p>
                </>
              ) : (
                <div className="space-y-3">
                  {renderRegisterCommon()}
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

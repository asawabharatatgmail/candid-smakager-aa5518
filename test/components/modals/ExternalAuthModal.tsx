import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

type Mode = 'choice' | 'parent-login' | 'parent-register' | 'student-login' | 'student-register';

const GRADE_OPTIONS = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'];
const SUBJECT_OPTIONS = ['Mathematics','Physics','Chemistry','Biology','English','Hindi','History','Geography','Social Science','Computer Science','Economics'];

const ExternalAuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { loginExternal, registerExternalParent, registerExternalStudent, roleConfigs } = useAppContext();
  const [mode, setMode] = useState<Mode>('choice');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');

  // Register form
  const [regName, setRegName]   = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPwd, setRegPwd]     = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regCity, setRegCity]   = useState('');
  // Student extras
  const [regGrade, setRegGrade] = useState('Class 10');
  const [regAge, setRegAge]     = useState('15');
  const [regSubjects, setRegSubjects] = useState<string[]>([]);
  const [regSchool, setRegSchool] = useState('');

  const parentRoleConfig  = roleConfigs.find(rc => rc.role === 'External Parent');
  const studentRoleConfig = roleConfigs.find(rc => rc.role === 'External Student');

  const handleLogin = (type: 'parent' | 'student') => {
    if (!email || !password) return;
    setError(''); setLoading(true);
    setTimeout(() => {
      const result = loginExternal(email, password);
      setLoading(false);
      if (!result) setError('Invalid email or password. Please try again.');
      else onClose();
    }, 600);
  };

  const handleRegisterParent = () => {
    if (!regName || !regEmail || !regPwd || !regMobile) { setError('Please fill all required fields.'); return; }
    setError(''); setLoading(true);
    setTimeout(() => {
      const ok = registerExternalParent({ name: regName, email: regEmail, password: regPwd, mobile: regMobile, city: regCity });
      setLoading(false);
      if (!ok) setError('An account with this email already exists.');
      else onClose();
    }, 800);
  };

  const handleRegisterStudent = () => {
    if (!regName || !regEmail || !regPwd) { setError('Please fill all required fields.'); return; }
    setError(''); setLoading(true);
    setTimeout(() => {
      const ok = registerExternalStudent({ name: regName, email: regEmail, password: regPwd, mobile: regMobile, grade: regGrade, age: parseInt(regAge) || 15, subjectsOfInterest: regSubjects, schoolName: regSchool, city: regCity });
      setLoading(false);
      if (!ok) setError('An account with this email already exists.');
      else onClose();
    }, 800);
  };

  const toggleSubject = (s: string) => setRegSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const renderChoice = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🌐</div>
        <h3 className="text-xl font-black text-slate-800">External Access</h3>
        <p className="text-sm text-slate-500 mt-1">Independent of any institute — sign in or create your own account</p>
      </div>
      <div className="space-y-3">
        {/* Parent option */}
        {parentRoleConfig?.isActive ? (
          <div className="border-2 border-indigo-200 rounded-2xl p-4 bg-indigo-50 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👨‍👩‍👧</span>
              <div>
                <p className="font-bold text-indigo-800">Parent Account</p>
                <p className="text-xs text-indigo-600">Manage multiple children's AI learning. Subscribe for reports & AI tools.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode('parent-login')} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">Sign In</button>
              {parentRoleConfig?.registrationOpen && (
                <button onClick={() => setMode('parent-register')} className="flex-1 bg-white border border-indigo-300 text-indigo-700 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors">Register Free</button>
              )}
            </div>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center text-sm text-slate-400">
            👨‍👩‍👧 External Parent accounts are currently disabled
          </div>
        )}

        {/* Student option */}
        {studentRoleConfig?.isActive ? (
          <div className="border-2 border-violet-200 rounded-2xl p-4 bg-violet-50 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎓</span>
              <div>
                <p className="font-bold text-violet-800">Student Account</p>
                <p className="text-xs text-violet-600">Self-learning with AI quizzes, flashcards, notes. Free AI key required.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode('student-login')} className="flex-1 bg-violet-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors">Sign In</button>
              {studentRoleConfig?.registrationOpen && (
                <button onClick={() => setMode('student-register')} className="flex-1 bg-white border border-violet-300 text-violet-700 py-2 rounded-xl text-sm font-bold hover:bg-violet-50 transition-colors">Register Free</button>
              )}
            </div>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center text-sm text-slate-400">
            🎓 External Student accounts are currently disabled
          </div>
        )}
      </div>

      {/* Demo credentials */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
        <p className="text-xs font-semibold text-slate-500 mb-2">Demo Accounts</p>
        <div className="space-y-1 text-xs text-slate-600">
          <div className="flex justify-between"><span>👨‍👩‍👧 External Parent:</span><span className="font-mono">sunita@external.com / parent123</span></div>
          <div className="flex justify-between"><span>🎓 External Student:</span><span className="font-mono">prateek@external.com / student123</span></div>
        </div>
      </div>
    </div>
  );

  const renderLogin = (type: 'parent' | 'student') => (
    <div className="space-y-4">
      <button onClick={() => { setMode('choice'); setError(''); }} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
        ← Back
      </button>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{type === 'parent' ? '👨‍👩‍👧' : '🎓'}</span>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{type === 'parent' ? 'External Parent' : 'External Student'} Sign In</h3>
          <p className="text-xs text-slate-400">Independent of any institute</p>
        </div>
      </div>
      <div className="space-y-3">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
        <button onClick={() => handleLogin(type)} disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-colors flex items-center justify-center gap-2 ${type === 'parent' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-violet-600 hover:bg-violet-700'} ${loading ? 'opacity-70' : ''}`}>
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : 'Sign In'}
        </button>
        {(type === 'parent' ? parentRoleConfig : studentRoleConfig)?.registrationOpen && (
          <p className="text-xs text-center text-slate-500">
            No account?{' '}
            <button onClick={() => setMode(type === 'parent' ? 'parent-register' : 'student-register')} className="text-indigo-600 font-semibold hover:underline">
              Register free
            </button>
          </p>
        )}
      </div>
    </div>
  );

  const renderRegisterParent = () => (
    <div className="space-y-4">
      <button onClick={() => { setMode('choice'); setError(''); }} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">← Back</button>
      <div className="flex items-center gap-3">
        <span className="text-3xl">👨‍👩‍👧</span>
        <h3 className="font-bold text-slate-800 text-lg">Create Parent Account</h3>
      </div>
      <div className="space-y-3">
        {[{ label: 'Full Name *', val: regName, set: setRegName, type: 'text', placeholder: 'Sunita Reddy' },
          { label: 'Email *', val: regEmail, set: setRegEmail, type: 'email', placeholder: 'you@email.com' },
          { label: 'Password *', val: regPwd, set: setRegPwd, type: 'password', placeholder: '••••••••' },
          { label: 'Mobile *', val: regMobile, set: setRegMobile, type: 'tel', placeholder: '9900001234' },
          { label: 'City', val: regCity, set: setRegCity, type: 'text', placeholder: 'Mumbai' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
        ))}
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
        <button onClick={handleRegisterParent} disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}>
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : 'Create Account & Start Free'}
        </button>
        <p className="text-xs text-slate-400 text-center">Free plan included · Upgrade any time for AI features</p>
      </div>
    </div>
  );

  const renderRegisterStudent = () => (
    <div className="space-y-4">
      <button onClick={() => { setMode('choice'); setError(''); }} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">← Back</button>
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎓</span>
        <h3 className="font-bold text-slate-800 text-lg">Create Student Account</h3>
      </div>
      <div className="space-y-3">
        {[{ label: 'Full Name *', val: regName, set: setRegName, type: 'text', placeholder: 'Prateek Shah' },
          { label: 'Email *', val: regEmail, set: setRegEmail, type: 'email', placeholder: 'you@email.com' },
          { label: 'Password *', val: regPwd, set: setRegPwd, type: 'password', placeholder: '••••••••' },
          { label: 'Mobile', val: regMobile, set: setRegMobile, type: 'tel', placeholder: '9900001234' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Grade *</label>
            <select value={regGrade} onChange={e => setRegGrade(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400">
              {GRADE_OPTIONS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Age *</label>
            <input type="number" min={8} max={20} value={regAge} onChange={e => setRegAge(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">School Name</label>
          <input type="text" value={regSchool} onChange={e => setRegSchool(e.target.value)} placeholder="Ryan International School"
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
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
        <button onClick={handleRegisterStudent} disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}>
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : 'Create Account — Free'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-200 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500">External Access Portal</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 text-lg leading-none">✕</button>
        </div>
        <div className="p-6">
          {mode === 'choice'           && renderChoice()}
          {mode === 'parent-login'     && renderLogin('parent')}
          {mode === 'student-login'    && renderLogin('student')}
          {mode === 'parent-register'  && renderRegisterParent()}
          {mode === 'student-register' && renderRegisterStudent()}
        </div>
      </div>
    </div>
  );
};

export default ExternalAuthModal;

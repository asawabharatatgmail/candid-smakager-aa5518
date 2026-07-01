import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';

// ─── Phase definitions ────────────────────────────────────────────────────────

type PhaseStatus = 'complete' | 'blocked' | 'in-progress' | 'pending';

interface PhaseStep {
  label: string;
  done: boolean;
  command?: string;
  note?: string;
}

interface Phase {
  id: string;
  number: string;
  title: string;
  status: PhaseStatus;
  steps: PhaseStep[];
  blockerNote?: string;
}

const PHASES: Phase[] = [
  {
    id: 'p0',
    number: '0',
    title: 'Security Hygiene',
    status: 'complete',
    steps: [
      { label: 'Hardcoded DB password removed from run_schema.py', done: true },
      { label: '.env files gitignored in test/ and eduveda-python/', done: true },
      { label: 'Git repo initialized and pushed to private GitHub', done: true },
      { label: 'XSS in ParentReportsView fixed (react-markdown)', done: true },
      { label: 'Credential rotation steps documented', done: true },
    ],
    blockerNote: 'Rotate Supabase keys in dashboard (project: lpoqediyncfjaeauruhb). Then set SUPABASE_KEY, SUPABASE_URL, SECRET_KEY as env vars.',
  },
  {
    id: 'p1',
    number: '1',
    title: 'Real Auth (External Parent & Student)',
    status: 'complete',
    steps: [
      { label: 'external_parents / external_students tables in Supabase schema', done: true },
      { label: 'FastAPI external auth router (register / login / me)', done: true },
      { label: 'Frontend loginExternal/registerExternal wired to backend', done: true },
      { label: 'bcrypt password hashing + JWT — no more plaintext browser auth', done: true },
    ],
  },
  {
    id: 'p2a',
    number: '2a',
    title: 'External Role Data Layer',
    status: 'complete',
    steps: [
      { label: 'Migration 0002: linked_children, personal_ai_configs, saved_ai_content, activity_sessions', done: true },
      { label: 'FastAPI external-data CRUD router', done: true },
      { label: 'Frontend write-through: children, AI config/content, activity', done: true },
    ],
  },
  {
    id: 'p2b',
    number: '2b',
    title: 'Institute Core Data Write-Through',
    status: 'complete',
    steps: [
      { label: 'Branches, Students, Teachers, Classes, Subjects sync to backend', done: true },
      { label: 'hydrateInstituteData pulls real data on login (replaces seed)', done: true },
      { label: 'addRecord / updateRecord / deleteRecord fire best-effort backend sync', done: true },
    ],
  },
  {
    id: 'p2c',
    number: '2c',
    title: 'Fees, Leads & CRM Write-Through',
    status: 'complete',
    steps: [
      { label: 'Leads synced via isSyncableCategory (full CRUD)', done: true },
      { label: 'Fee structures and discounts create/delete synced', done: true },
      { label: 'Lead reminders and email templates synced to backend', done: true },
      { label: 'hydrateInstituteData extended to 10 parallel fetches', done: true },
    ],
  },
  {
    id: 'p2d',
    number: '2d',
    title: 'Fee Profiles & Payment Recording',
    status: 'complete',
    steps: [
      { label: 'GET /api/fees/profiles endpoint added', done: true },
      { label: 'setStudentPaymentPlan syncs full profile to backend', done: true },
      { label: 'Real backend UUIDs swap temp local IDs on success', done: true },
      { label: 'recordPayment fires apiRecordPayment with real installment IDs', done: true },
    ],
  },
  {
    id: 'p3',
    number: '3',
    title: 'Deploy Backend (Render)',
    status: 'blocked',
    blockerNote: 'Requires: (1) Supabase credentials rotated, (2) Render account, (3) GitHub push.',
    steps: [
      { label: 'Dockerfile + render.yaml for eduveda-python/', done: false },
      {
        label: 'Set Render env vars: SUPABASE_URL, SUPABASE_KEY, SECRET_KEY',
        done: false,
        note: 'Never commit these — set in Render dashboard only',
      },
      {
        label: 'Update frontend .env: VITE_API_URL=https://your-app.onrender.com',
        done: false,
        command: 'echo "VITE_API_URL=https://your-app.onrender.com" > test/.env',
      },
      { label: 'Redeploy frontend to Netlify', done: false },
      { label: 'Verify /health reachable and CORS locked to frontend origin', done: false },
    ],
  },
  {
    id: 'p4',
    number: '4',
    title: 'Automated Testing',
    status: 'pending',
    steps: [
      {
        label: 'Backend: pytest suite for auth, fee math, CRUD round-trips',
        done: false,
        command: 'cd eduveda-python && pip install pytest httpx && pytest tests/',
      },
      {
        label: 'Frontend: vitest + React Testing Library setup',
        done: false,
        command: 'cd test && npm install -D vitest @testing-library/react @testing-library/user-event jsdom',
      },
      { label: 'Enable TypeScript strict mode incrementally', done: false },
      { label: 'Manual QA checklist across all 7 roles', done: false },
    ],
  },
  {
    id: 'p5',
    number: '5',
    title: 'Security Report',
    status: 'pending',
    steps: [
      { label: 'Write SECURITY.md: auth model, secrets management, RLS summary', done: false },
      {
        label: 'Run npm audit and pip-audit, document results',
        done: false,
        command: 'cd test && npm audit --json && cd ../eduveda-python && pip-audit',
      },
      { label: 'Document XSS fix, CORS posture, minor data handling', done: false },
    ],
  },
  {
    id: 'p6',
    number: '6',
    title: 'Load & Scale Testing',
    status: 'pending',
    steps: [
      { label: 'Target: 500 concurrent users, 5 000 students, 50 institutes', done: false },
      {
        label: 'k6 script: login, dashboard fetch, AI quiz, fee payment',
        done: false,
        command: 'k6 run tests/load/main.js --vus 500 --duration 60s',
      },
      { label: 'Document Supabase free-tier connection cap, Render cold-start, AI rate limits', done: false },
      { label: 'Write upgrade-trigger runbook (p95 thresholds → next tier)', done: false },
    ],
  },
  {
    id: 'p7',
    number: '7',
    title: 'Ongoing Ops Agents',
    status: 'pending',
    steps: [
      { label: 'Daily health-check: ping /health + Supabase + Netlify → notify on fail', done: false },
      { label: 'Weekly marketing draft: summarize shipped features → human review', done: false },
      { label: 'Daily support triage: summarize new requests → draft replies for approval', done: false },
    ],
  },
  {
    id: 'p8',
    number: '8',
    title: 'Go-to-Market Plan',
    status: 'pending',
    steps: [
      { label: 'Target segments: coaching institutes / small schools (wedge)', done: false },
      { label: 'Pricing aligned to SubscriptionPackage / ParentPlan / StudentPlan models', done: false },
      { label: 'Channel strategy + week-1 metrics to track', done: false },
      { label: 'GTM document produced and reviewed', done: false },
    ],
  },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PhaseStatus, { label: string; bg: string; text: string; dot: string }> = {
  complete:    { label: 'Complete',    bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  blocked:     { label: 'Blocked',     bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500' },
  'in-progress': { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700',   dot: 'bg-amber-500' },
  pending:     { label: 'Pending',     bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-300' },
};

// ─── Copy-to-clipboard ────────────────────────────────────────────────────────

const CopyCommand: React.FC<{ cmd: string }> = ({ cmd }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div className="mt-1.5 flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-2 font-mono text-xs text-slate-200 overflow-x-auto">
      <span className="flex-1 whitespace-nowrap">{cmd}</span>
      <button
        onClick={copy}
        className="ml-2 shrink-0 text-slate-400 hover:text-white transition-colors"
        title="Copy to clipboard"
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
        )}
      </button>
    </div>
  );
};

// ─── Phase card ───────────────────────────────────────────────────────────────

const PhaseCard: React.FC<{ phase: Phase }> = ({ phase }) => {
  const [open, setOpen] = useState(phase.status === 'blocked' || phase.status === 'in-progress');
  const cfg = STATUS_CONFIG[phase.status];
  const doneCount = phase.steps.filter(s => s.done).length;

  return (
    <div className={`rounded-2xl border transition-all ${phase.status === 'complete' ? 'border-emerald-200 bg-emerald-50/30' : phase.status === 'blocked' ? 'border-red-200 bg-red-50/20' : 'border-slate-200 bg-white'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        {/* Phase badge */}
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${cfg.bg} ${cfg.text}`}>
          {phase.number}
        </div>

        {/* Title + progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{phase.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          {phase.status !== 'pending' && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full max-w-[120px]">
                <div
                  className={`h-1.5 rounded-full ${phase.status === 'complete' ? 'bg-emerald-500' : phase.status === 'blocked' ? 'bg-red-400' : 'bg-amber-400'}`}
                  style={{ width: `${(doneCount / phase.steps.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">{doneCount}/{phase.steps.length}</span>
            </div>
          )}
        </div>

        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
          {phase.blockerNote && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>{phase.blockerNote}</span>
            </div>
          )}
          {phase.steps.map((step, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex items-start gap-2.5">
                <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${step.done ? 'bg-emerald-500' : 'border-2 border-slate-300'}`}>
                  {step.done && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </span>
                <div className="flex-1">
                  <p className={`text-xs leading-snug ${step.done ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{step.label}</p>
                  {step.note && <p className="text-xs text-slate-400 mt-0.5 italic">{step.note}</p>}
                  {step.command && <CopyCommand cmd={step.command} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Role activation toggles ──────────────────────────────────────────────────

const RoleToggles: React.FC = () => {
  const { roleConfigs, setRoleConfigs } = useAppContext();

  const externalRoles = roleConfigs.filter(rc => !rc.isInstituteRole);
  if (externalRoles.length === 0) return null;

  const toggle = (role: UserRole, field: 'isActive' | 'registrationOpen') =>
    setRoleConfigs(prev => prev.map(rc => rc.role === role ? { ...rc, [field]: !rc[field] } : rc));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 text-sm mb-1">External Role Controls</h3>
      <p className="text-xs text-slate-500 mb-4">Activate external-facing roles and open / close registration — same controls as Role Manager, surfaced here for launch readiness.</p>
      <div className="space-y-3">
        {externalRoles.map(rc => (
          <div key={rc.role} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div>
              <p className="text-xs font-medium text-slate-700">{rc.label}</p>
              <p className="text-xs text-slate-400">{rc.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-xs text-slate-500">Active</span>
                <button
                  onClick={() => toggle(rc.role, 'isActive')}
                  className={`w-9 h-5 rounded-full relative transition-colors ${rc.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rc.isActive ? 'translate-x-4' : ''}`} />
                </button>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-xs text-slate-500">Registration</span>
                <button
                  onClick={() => toggle(rc.role, 'registrationOpen')}
                  className={`w-9 h-5 rounded-full relative transition-colors ${rc.registrationOpen ? 'bg-indigo-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rc.registrationOpen ? 'translate-x-4' : ''}`} />
                </button>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main view ────────────────────────────────────────────────────────────────

const LaunchControlView: React.FC = () => {
  const complete = PHASES.filter(p => p.status === 'complete').length;
  const total = PHASES.length;
  const pct = Math.round((complete / total) * 100);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900">Launch Control</h1>
          <p className="text-sm text-slate-500 mt-0.5">Phase-by-phase deployment checklist — track, penetrate, and ship.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5">
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={pct === 100 ? '#10b981' : '#6366f1'}
                strokeWidth="3"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-800">{pct}%</span>
          </div>
          <div>
            <p className="text-xl font-black text-slate-800 leading-none">{complete}/{total}</p>
            <p className="text-xs text-slate-400">phases done</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Role activation panel */}
      <RoleToggles />

      {/* Credential rotation quick-ref */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
          <h3 className="text-sm font-semibold text-amber-800">Credential Rotation (do this first)</h3>
        </div>
        <p className="text-xs text-amber-700">1. Supabase dashboard → Settings → API → Regenerate service-role key + anon key.</p>
        <p className="text-xs text-amber-700">2. Generate new JWT secret:</p>
        <CopyCommand cmd={'python -c "import secrets; print(secrets.token_hex(32))"'} />
        <p className="text-xs text-amber-700 mt-1">3. Apply DB migrations (after setting SUPABASE_DB_URL):</p>
        <CopyCommand cmd="python migrations/apply_migration.py migrations/0001_external_roles.sql" />
        <CopyCommand cmd="python migrations/apply_migration.py migrations/0002_external_data.sql" />
        <p className="text-xs text-amber-700 mt-1">4. Update eduveda-python/.env with the new values, then restart the backend.</p>
      </div>

      {/* Phase cards */}
      <div className="space-y-3">
        {PHASES.map(phase => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-400 text-center pb-2">
        Statuses reflect completed code work. Backend deployment and live testing require the credential rotation above.
      </p>
    </div>
  );
};

export default LaunchControlView;

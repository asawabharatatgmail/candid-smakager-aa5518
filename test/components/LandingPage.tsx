import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

/* ─── Static data ──────────────────────────────────────────────────────────── */

const faqs = [
  { q: "What is System4Learn?", a: "System4Learn is an all-in-one intelligent platform for educational institutes — combining administration, AI-powered learning tools, fee management, lead CRM, and analytics in one beautiful place." },
  { q: "Is it suitable for a multi-branch institute?", a: "Absolutely. Multi-branch management is core to the platform. Branch Admins manage their locations independently while Class Admins get a holistic view across the whole organisation." },
  { q: "How does AI content creation work?", a: "Teachers provide a topic and instantly receive quizzes, flashcard sets, and detailed study guides — saved directly to the shared content library for students to access." },
  { q: "Can parents pay fees online?", a: "Yes. Parents have a dedicated portal with detailed fee breakdowns, installment schedules, applied discounts, and secure payment gateway integration." },
  { q: "How does the AI Study Tool help students?", a: "The AI Study Tool acts as a personal tutor — answering subject questions, generating comprehensive study guides, creating practice quizzes, and tracking academic progress." },
  { q: "Is my data secure?", a: "All data is scoped to your institute with role-based access control. The platform uses JWT authentication backed by Supabase Row-Level Security policies." },
  { q: "Do parents need a separate login from the institute?", a: "Yes. Parents access a dedicated external portal designed specifically for tracking their child's progress, fees, and communication — independent of the institute's internal system." },
  { q: "Can students use the platform independently?", a: "Yes. External Students get their own portal with AI study tools, challenges, personalised progress tracking, and curated content — accessible anytime, anywhere." },
];

const features = [
  { icon: 'ri-robot-2-line',        title: 'AI-Powered Tools',   desc: 'Generate quizzes, flashcards, study guides, personalised emails, and game challenges instantly with cutting-edge AI.', color: 'from-violet-500 to-purple-700' },
  { icon: 'ri-dashboard-3-line',    title: 'Unified Admin',      desc: 'Manage branches, users, classes, and subjects from one control panel. Bulk upload via CSV with smart validation.', color: 'from-blue-500 to-blue-700' },
  { icon: 'ri-bank-card-line',      title: 'Fee Management',     desc: 'Define fee structures, discounts, installment plans, and track payments with automated PDF receipts.', color: 'from-emerald-400 to-teal-600' },
  { icon: 'ri-bar-chart-box-line',  title: 'Lead CRM',           desc: 'Track admission leads, set reminders, generate AI-personalised outreach emails, and run targeted campaigns.', color: 'from-orange-400 to-orange-600' },
  { icon: 'ri-gamepad-line',        title: 'Gamification',       desc: 'Create multi-level educational game challenges with leaderboards to keep students engaged and motivated.', color: 'from-pink-500 to-rose-600' },
  { icon: 'ri-calendar-check-line', title: 'Smart Scheduler',    desc: 'Let AI build an optimised weekly timetable based on subjects, teacher availability, and student groups.', color: 'from-cyan-400 to-sky-600' },
  { icon: 'ri-group-line',          title: 'Role-Based Access',  desc: '6 distinct roles — Product Owner, Class Admin, Branch Admin, Teacher, Student, Parent — each with precise permissions.', color: 'from-amber-400 to-amber-600' },
  { icon: 'ri-bar-chart-grouped-line', title: 'Analytics Hub',   desc: 'Real-time dashboards across enrolments, fees, attendance, and academic performance for data-driven decisions.', color: 'from-indigo-500 to-indigo-700' },
  { icon: 'ri-shield-check-line',   title: 'Enterprise Security', desc: 'JWT auth, Row-Level Security, encrypted storage, and audit trails protect every record in your organisation.', color: 'from-slate-500 to-slate-700' },
];

const stats = [
  { value: '10K+', label: 'Students', icon: 'ri-user-star-line' },
  { value: '500+', label: 'Institutes', icon: 'ri-community-line' },
  { value: '16+',  label: 'AI Features', icon: 'ri-robot-2-line' },
  { value: '6',    label: 'User Roles', icon: 'ri-shield-check-line' },
];

const howItWorks = [
  { step: '01', icon: 'ri-building-2-line', title: 'Institute Onboards', desc: 'Register your institute, configure branches, and invite staff. Up and running in under 10 minutes.', color: 'text-blue-400' },
  { step: '02', icon: 'ri-settings-3-line', title: 'Customise & Activate', desc: 'Set fee structures, define roles, upload student data, and tune AI tools to your curriculum.', color: 'text-violet-400' },
  { step: '03', icon: 'ri-rocket-line',     title: 'Everyone Joins', desc: 'Teachers, students, and parents get their own dedicated portals — personalised and ready to use.', color: 'text-emerald-400' },
];

const testimonials = [
  { name: 'Principal A. Sharma', org: 'Apex Coaching Centre', text: 'Fee collection used to take two days. Now it is done before lunch. The automated reminders and PDF receipts alone are worth it.', avatar: 'AS' },
  { name: 'Dr. R. Mehta', org: 'Meridian Academy', text: 'The AI quiz generator has transformed how our teachers create assessments. What took an hour now takes two minutes.', avatar: 'RM' },
  { name: 'Parent — K. Patel', org: 'Guardian, Grade 9 Student', text: 'I can see my child\'s attendance, upcoming tests, and fee dues from my phone. Absolute peace of mind.', avatar: 'KP' },
];

const plans = [
  { name: 'Starter', price: 'Free Trial', period: '7-day trial', color: 'border-slate-600', badge: '', features: ['1 Branch', 'Up to 50 Students', 'AI Content Tools', 'Fee Management', 'Email Support'] },
  { name: 'Pro', price: '₹2,999', period: '/month', color: 'border-blue-500', badge: 'Most Popular', features: ['5 Branches', 'Up to 1,000 Students', 'All AI Features', 'Lead CRM', 'Analytics Dashboard', 'Priority Support'] },
  { name: 'Enterprise', price: 'Custom', period: 'tailored pricing', color: 'border-violet-500', badge: '', features: ['Unlimited Branches', 'Unlimited Students', 'Dedicated Infra', 'Custom Integrations', 'SLA-backed Support', 'Training & Onboarding'] },
];

/* ─── Component ────────────────────────────────────────────────────────────── */

const LandingPage: React.FC = () => {
  const { setShowLoginPage, loginAsProductOwner, roleConfigs } = useAppContext();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activePortal, setActivePortal] = useState<'institute' | 'parent' | 'student'>('institute');

  const isPOMode = typeof window !== 'undefined' && window.location.hash === '#admin';

  const parentRegOpen = roleConfigs.find(rc => rc.role === UserRole.ExternalParent)?.registrationOpen ?? true;
  const studentRegOpen = roleConfigs.find(rc => rc.role === UserRole.ExternalStudent)?.registrationOpen ?? true;

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    document.title = 'System4Learn — AI-Powered Education Management Platform';
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta) {
      meta.content = 'System4Learn is an all-in-one AI-powered platform for educational institutes — combining administration, LMS, fee management, lead CRM, gamification, and analytics in one place.';
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'System4Learn is an all-in-one AI-powered platform for educational institutes — combining administration, LMS, fee management, lead CRM, gamification, and analytics in one place.';
      document.head.appendChild(m);
    }
  }, []);

  const portalCards = [
    {
      id: 'institute' as const,
      icon: 'ri-community-line',
      label: 'Institute',
      title: 'Institute Workspace',
      subtitle: 'For Admins, Teachers & Staff',
      desc: 'Run your entire institution from one control panel — branches, classes, fees, leads, and AI-powered teaching tools.',
      bullets: ['Multi-branch management', 'Fee & installment tracking', 'AI lesson & quiz builder', 'Lead CRM & admissions', 'Analytics dashboard'],
      ctaLabel: 'Sign In to Institute',
      ctaIcon: 'ri-building-2-line',
      gradient: 'from-blue-600 to-blue-800',
      glow: 'shadow-blue-900/60',
      border: 'border-blue-400/40',
      badgeBg: 'bg-blue-500/20',
      badgeText: 'text-blue-300',
      action: () => setShowLoginPage(true),
      open: true,
    },
    {
      id: 'parent' as const,
      icon: 'ri-parent-line',
      label: 'Parent',
      title: 'Parent Portal',
      subtitle: 'For Guardians & Families',
      desc: 'Stay completely in sync with your child\'s education — fees, attendance, performance, and real-time AI progress insights.',
      bullets: ["Child's attendance & grades", 'Fee dues & payment history', 'AI academic progress reports', 'Direct teacher communication', 'Personalised learning alerts'],
      ctaLabel: parentRegOpen ? 'Register as Parent' : 'Coming Soon',
      ctaIcon: 'ri-parent-line',
      gradient: 'from-indigo-600 to-indigo-800',
      glow: 'shadow-indigo-900/60',
      border: 'border-indigo-400/40',
      badgeBg: 'bg-indigo-500/20',
      badgeText: 'text-indigo-300',
      action: () => setShowLoginPage(true),
      open: parentRegOpen,
    },
    {
      id: 'student' as const,
      icon: 'ri-graduation-cap-line',
      label: 'Student',
      title: 'Student Portal',
      subtitle: 'For Learners Everywhere',
      desc: 'Your personal AI tutor that generates study guides, quizzes, and challenges — keeping you on track and ahead of the curve.',
      bullets: ['AI-generated study guides', 'Practice quizzes & flashcards', 'Game challenges & leaderboards', 'Progress analytics', 'Personalised learning path'],
      ctaLabel: studentRegOpen ? 'Start Learning Free' : 'Coming Soon',
      ctaIcon: 'ri-graduation-cap-line',
      gradient: 'from-violet-600 to-purple-800',
      glow: 'shadow-violet-900/60',
      border: 'border-violet-400/40',
      badgeBg: 'bg-violet-500/20',
      badgeText: 'text-violet-300',
      action: () => setShowLoginPage(true),
      open: studentRegOpen,
    },
  ];

  const active = portalCards.find(p => p.id === activePortal)!;

  return (
    <div className="min-h-screen landing-bg text-white overflow-x-hidden">

      {/* Background effects */}
      <div className="fixed inset-0 landing-grid pointer-events-none opacity-50" />
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/12 rounded-full blur-3xl pointer-events-none translate-x-1/4 translate-y-1/4" />
      <div className="fixed top-1/2 left-1/2 w-[300px] h-[300px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
            <i className="ri-graduation-cap-line text-white text-lg" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">System<span className="text-blue-400">4</span>Learn</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400 font-medium">
          <a href="#portals" className="hover:text-white transition-colors">Portals</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLoginPage(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
          >
            Sign In
          </button>
          {isPOMode && (
            <button
              onClick={loginAsProductOwner}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg transition-all"
            >
              <i className="ri-shield-star-line mr-1.5" />Admin
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="text-center pt-24 pb-16 px-4">
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI-Powered Education Management — Live
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] max-w-5xl mx-auto">
              The <span className="gradient-text">Smartest</span> Way<br className="hidden md:block" />
              to Run an Institute
            </h1>

            <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              System4Learn unifies AI-powered learning, administration, fee management, lead CRM,
              gamification, and analytics — for institutes, parents, and students.
            </p>

            {/* Portal selector buttons */}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {portalCards.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setActivePortal(p.id); document.getElementById('portals')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                    activePortal === p.id
                      ? `bg-gradient-to-r ${p.gradient} text-white shadow-xl ${p.glow} shadow-lg`
                      : 'border border-white/20 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <i className={p.ctaIcon} />{p.label} Portal
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setShowLoginPage(true)}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-xl shadow-blue-900/50 transition-all hover:-translate-y-0.5"
              >
                <i className="ri-login-circle-line" /> Get Started Free
              </button>
              <a
                href="mailto:contact@system4learn.com"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white border border-white/25 hover:bg-white/10 transition-all hover:-translate-y-0.5"
              >
                <i className="ri-mail-line" /> Contact Sales
              </a>
            </div>

            {isPOMode && (
              <div className="mt-4">
                <button
                  onClick={loginAsProductOwner}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-amber-200 border border-amber-500/40 hover:bg-amber-500/20 transition-all mx-auto"
                >
                  <i className="ri-shield-star-line" /> Platform Owner Access
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`bg-white/6 border border-white/12 rounded-2xl p-6 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10`}
                style={{ transitionDelay: `${i * 80}ms`, opacity: mounted ? 1 : 0 }}
              >
                <i className={`${s.icon} text-2xl text-blue-400 mb-2 block`} />
                <div className="text-3xl font-black gradient-text">{s.value}</div>
                <div className="text-sm text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────────────── */}
        <section className="px-4 pb-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black text-white">How It <span className="gradient-text">Works</span></h2>
              <p className="text-slate-400 mt-3 max-w-lg mx-auto">From onboarding to fully operational — in three simple steps.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* connector lines for desktop */}
              <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-500/40 to-violet-500/40" />
              {howItWorks.map((step) => (
                <div key={step.step} className="bg-white/6 border border-white/12 rounded-2xl p-8 text-center hover:-translate-y-1 transition-all duration-200 backdrop-blur-sm">
                  <div className={`text-5xl font-black ${step.color} opacity-30 leading-none mb-4`}>{step.step}</div>
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-5 mx-auto">
                    <i className={`${step.icon} text-2xl ${step.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Portal Cards ──────────────────────────────────────────────────── */}
        <section id="portals" className="px-4 pb-28">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-white">Choose Your <span className="gradient-text">Portal</span></h2>
              <p className="text-slate-400 mt-3 max-w-xl mx-auto">Three dedicated experiences — each built for its users. Select your portal below.</p>
            </div>

            {/* Tab bar */}
            <div className="flex justify-center gap-2 mb-8 bg-white/5 border border-white/10 rounded-2xl p-2 max-w-sm mx-auto">
              {portalCards.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePortal(p.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activePortal === p.id
                      ? `bg-gradient-to-r ${p.gradient} text-white shadow-lg`
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className={`${p.ctaIcon} mr-1.5`} />{p.label}
                </button>
              ))}
            </div>

            {/* Active portal card — large featured card */}
            <div className={`bg-white/6 border ${active.border} backdrop-blur-sm rounded-3xl p-8 md:p-10 transition-all duration-300`}>
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <div className={`inline-flex items-center gap-2 ${active.badgeBg} ${active.badgeText} border border-current/30 rounded-full px-3 py-1 text-xs font-semibold mb-5`}>
                    <i className={active.ctaIcon} />{active.subtitle}
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">{active.title}</h3>
                  <p className="text-slate-300 text-base leading-relaxed mb-7">{active.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {active.bullets.map(b => (
                      <li key={b} className="flex items-center gap-3 text-sm text-slate-300">
                        <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${active.gradient} flex items-center justify-center flex-shrink-0`}>
                          <i className="ri-check-line text-white text-xs" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={active.action}
                    disabled={!active.open}
                    className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-200 ${
                      active.open
                        ? `bg-gradient-to-r ${active.gradient} hover:opacity-90 shadow-2xl ${active.glow} hover:-translate-y-0.5 hover:scale-[1.02]`
                        : 'bg-white/10 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <i className={active.ctaIcon} />
                    {active.ctaLabel}
                    {active.open && <i className="ri-arrow-right-line" />}
                  </button>
                  {!active.open && (
                    <p className="text-xs text-slate-500 mt-3">Registration is currently closed by the administrator.</p>
                  )}
                </div>

                {/* Visual panel */}
                <div className="grid grid-cols-2 gap-3">
                  {active.bullets.map((b, i) => (
                    <div
                      key={b}
                      className={`bg-white/6 border border-white/10 rounded-xl p-4 ${i === 4 ? 'col-span-2' : ''}`}
                    >
                      <i className={`${['ri-check-double-line','ri-shield-check-line','ri-star-line','ri-rocket-line','ri-trending-up-line'][i % 5]} text-lg mb-2 block ${active.badgeText}`} />
                      <p className="text-xs text-slate-400 leading-snug">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick-access buttons for other portals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {portalCards.map(p => (
                <div key={p.id} className={`bg-white/5 border ${p.border} rounded-2xl p-5 flex items-center gap-4 ${activePortal === p.id ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white/20' : ''}`}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <i className={`${p.ctaIcon} text-white text-lg`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{p.title}</div>
                    <div className="text-xs text-slate-400 truncate">{p.subtitle}</div>
                  </div>
                  <button
                    onClick={() => { p.action(); }}
                    disabled={!p.open}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex-shrink-0 ${
                      p.open
                        ? `bg-gradient-to-r ${p.gradient} text-white shadow-md hover:opacity-90`
                        : 'bg-white/10 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {p.open ? 'Enter' : 'Closed'}
                  </button>
                </div>
              ))}
            </div>

            {isPOMode && (
              <div className="mt-6 bg-amber-500/10 border border-amber-400/30 rounded-2xl p-6 flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-star-line text-white text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-amber-200">Platform Owner</h3>
                  <p className="text-xs text-amber-300/70">Manage all institutes, subscriptions, and system health.</p>
                </div>
                <button
                  onClick={loginAsProductOwner}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg transition-all"
                >
                  <i className="ri-shield-star-line mr-1.5" />Access
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section id="features" className="px-4 pb-28">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black text-white">
                Everything Your Institute <span className="gradient-text">Needs</span>
              </h2>
              <p className="text-slate-400 mt-3 max-w-xl mx-auto">
                A comprehensive suite of tools to run, grow, and elevate your educational organisation.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group bg-white/6 border border-white/10 backdrop-blur-sm rounded-2xl p-6 hover:-translate-y-1.5 hover:bg-white/10 transition-all duration-200"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <i className={`${f.icon} text-white text-xl`} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────────────────── */}
        <section className="px-4 pb-28">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black text-white">What People <span className="gradient-text">Say</span></h2>
              <p className="text-slate-400 mt-3">Trusted by principals, teachers, parents, and students across India.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white/6 border border-white/12 rounded-2xl p-6 backdrop-blur-sm hover:-translate-y-1 transition-all duration-200">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="ri-star-fill text-amber-400 text-sm" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.org}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────────────────────── */}
        <section id="pricing" className="px-4 pb-28">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black text-white">Simple, Transparent <span className="gradient-text">Pricing</span></h2>
              <p className="text-slate-400 mt-3 max-w-xl mx-auto">Start free. Scale as you grow. No hidden fees.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-white/6 border ${plan.color} rounded-2xl p-7 flex flex-col backdrop-blur-sm hover:-translate-y-1 transition-all duration-200 relative`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="text-lg font-black text-white mb-1">{plan.name}</h3>
                  <div className="mb-5">
                    <span className="text-3xl font-black gradient-text">{plan.price}</span>
                    <span className="text-slate-400 text-sm ml-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-7">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <i className="ri-check-line text-emerald-400 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setShowLoginPage(true)}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────────────── */}
        <section className="px-4 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600/30 to-violet-600/30 border border-blue-400/25 rounded-3xl p-10 md:p-14 text-center backdrop-blur-sm">
              <h2 className="text-4xl font-black text-white mb-4">Ready to Transform Your Institute?</h2>
              <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
                Join hundreds of institutes already using System4Learn to save time, boost results, and delight students and parents.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setShowLoginPage(true)}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-2xl shadow-blue-900/50 transition-all hover:-translate-y-0.5 hover:scale-[1.02]"
                >
                  <i className="ri-rocket-line" /> Start Free Trial
                </button>
                <a
                  href="mailto:contact@system4learn.com"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white border border-white/30 hover:bg-white/10 transition-all hover:-translate-y-0.5"
                >
                  <i className="ri-calendar-line" /> Book a Demo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section id="faq" className="px-4 pb-24">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-white text-center mb-10">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <div className="bg-white/6 border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden divide-y divide-white/8">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center text-left px-6 py-5 hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold text-white pr-4">{faq.q}</span>
                    <i className={`ri-arrow-down-s-line text-xl text-blue-400 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-48' : 'max-h-0'}`}>
                    <p className="px-6 pb-5 text-slate-300 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 py-10 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <i className="ri-graduation-cap-line text-white text-sm" />
                </div>
                <span className="text-base font-extrabold">System<span className="text-blue-400">4</span>Learn</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                An AI-powered, all-in-one education management platform for modern institutes, parents, and students.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-3">Portals</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => setShowLoginPage(true)} className="hover:text-white transition-colors">Institute Login</button></li>
                <li><button onClick={() => setShowLoginPage(true)} className="hover:text-white transition-colors">Parent Portal</button></li>
                <li><button onClick={() => setShowLoginPage(true)} className="hover:text-white transition-colors">Student Portal</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="mailto:contact@system4learn.com" className="hover:text-white transition-colors flex items-center gap-1.5"><i className="ri-mail-line" />contact@system4learn.com</a></li>
                <li><a href="https://system4learn.com" className="hover:text-white transition-colors flex items-center gap-1.5"><i className="ri-global-line" />system4learn.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} System4Learn. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

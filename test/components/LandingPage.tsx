import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const faqs = [
  { q: "What is System4Learn?", a: "System4Learn is an all-in-one intelligent platform for educational institutes — combining administration, LMS, AI-powered content creation, fee management, lead CRM, and analytics in one place." },
  { q: "Is it suitable for a multi-branch institute?", a: "Absolutely. Multi-branch management is core to the platform. Branch Admins manage their locations independently while Class Admins get a holistic view of the whole organisation." },
  { q: "How does AI content creation work?", a: "Powered by Claude AI (Anthropic), teachers provide a topic and get quizzes, flashcard sets, and detailed study guides generated in seconds — saved directly to the shared content library." },
  { q: "Can parents pay fees online?", a: "Yes. Parents have a dedicated portal with detailed fee breakdowns, installment schedules, applied discounts, and secure payment gateway integration." },
  { q: "How does the AI Study Tool help students?", a: "The AI Study Tool acts as a personal tutor — answering subject questions, generating comprehensive study guides, creating practice quizzes, and tracking progress." },
  { q: "Is my data secure?", a: "All data is scoped to your institute with role-based access. The platform uses JWT authentication backed by Supabase Row-Level Security policies." },
];

const features = [
  { icon: 'ri-robot-2-line',        title: 'Claude AI Tools',    desc: 'Generate quizzes, flashcards, study guides, personalised emails, and game challenges instantly.', color: 'bg-violet-500' },
  { icon: 'ri-dashboard-3-line',    title: 'Unified Admin',      desc: 'Manage branches, users, classes, and subjects from one control panel. Bulk upload via CSV.', color: 'bg-blue-600' },
  { icon: 'ri-bank-card-line',      title: 'Fee Management',     desc: 'Define fee structures, discounts, installment plans, and track payments with PDF receipts.', color: 'bg-emerald-500' },
  { icon: 'ri-bar-chart-box-line',  title: 'Lead CRM',           desc: 'Track admission leads, set reminders, generate AI-personalised emails, run campaigns.', color: 'bg-orange-500' },
  { icon: 'ri-gamepad-line',        title: 'Gamification',       desc: 'Create multi-level educational game challenges to keep students engaged and motivated.', color: 'bg-pink-500' },
  { icon: 'ri-calendar-check-line', title: 'AI Scheduler',       desc: 'Let AI build an optimised weekly timetable based on subjects and teacher availability.', color: 'bg-cyan-500' },
];

const stats = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Institutes' },
  { value: '16+',  label: 'AI Features' },
  { value: '6',    label: 'User Roles' },
];

const LandingPage: React.FC = () => {
  const { setShowLoginPage, loginAsProductOwner } = useAppContext();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Hidden PO admin access via URL hash — share /#admin link separately
  const isPOMode = typeof window !== 'undefined' && window.location.hash === '#admin';

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  return (
    <div className="min-h-screen landing-bg text-white overflow-x-hidden">
      {/* Grid overlay */}
      <div className="fixed inset-0 landing-grid pointer-events-none opacity-60" />

      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none translate-x-1/4 translate-y-1/4" />

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <i className="ri-graduation-cap-line text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">System4Learn</span>
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
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-lg transition-colors"
            >
              <i className="ri-shield-star-line mr-1.5" />Admin Access
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="text-center pt-24 pb-20 px-4">
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/40 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-blue-200">
              <i className="ri-sparkling-2-fill text-violet-400" />
              Powered by Claude AI (Anthropic)
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mx-auto">
              The <span className="gradient-text">Future</span> of<br className="hidden md:block" /> Education Management
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              System4Learn unifies AI-powered learning tools, administration, fee management, lead CRM,
              and analytics for every educational institute — in one beautiful platform.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowLoginPage(true)}
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/60 transition-all hover:-translate-y-0.5"
              >
                <i className="ri-login-circle-line" /> Sign In to Institute
              </button>
              <a
                href="mailto:contact@system4learn.com"
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white border border-white/25 hover:bg-white/10 transition-all hover:-translate-y-0.5"
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

        {/* ── Stats ────────────────────────────────────────────── */}
        <section className="px-4 pb-16">
          <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`bg-white/8 border border-white/15 rounded-2xl p-5 text-center backdrop-blur-sm transition-all duration-500 delay-${i * 100} ${mounted ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="text-3xl font-black gradient-text">{s.value}</div>
                <div className="text-sm text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section className="px-4 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-white">Everything Your Institute <span className="gradient-text">Needs</span></h2>
              <p className="text-slate-400 mt-3 max-w-xl mx-auto">All the tools to run, grow, and elevate your educational organisation.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-white/8 border border-white/12 backdrop-blur-sm rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/12 transition-all duration-200"
                >
                  <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <i className={`${f.icon} text-white text-xl`} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sign-in CTA ──────────────────────────────────────── */}
        <section className="px-4 pb-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white text-center mb-10">Choose Your <span className="gradient-text">Portal</span></h2>
            <div className={`grid gap-6 ${isPOMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto'}`}>

              {/* Institute */}
              <div className="bg-white/8 border border-blue-400/30 backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-200">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-900/50">
                  <i className="ri-community-line text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Institute Workspace</h3>
                <p className="text-slate-400 text-sm mb-6">Students, Parents, Teachers, Branch &amp; Class Admins.</p>
                <button
                  onClick={() => setShowLoginPage(true)}
                  className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <i className="ri-login-circle-line mr-2" />Sign In
                </button>
              </div>

              {/* Product Owner — only shown in admin mode */}
              {isPOMode && (
                <div className="bg-white/8 border border-amber-400/30 backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mb-5 shadow-lg shadow-amber-900/30">
                    <i className="ri-shield-star-line text-white text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Platform Owner</h3>
                  <p className="text-slate-400 text-sm mb-6">Manage all institutes, subscriptions &amp; system health.</p>
                  <button
                    onClick={loginAsProductOwner}
                    className="w-full py-3 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors"
                  >
                    <i className="ri-shield-star-line mr-2" />Platform Access
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="px-4 pb-24">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-white text-center mb-10">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <div className="bg-white/8 border border-white/12 backdrop-blur-sm rounded-2xl overflow-hidden divide-y divide-white/10">
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

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
            <i className="ri-graduation-cap-line text-white text-xs" />
          </div>
          <span className="font-semibold text-slate-400">System4Learn</span>
        </div>
        <p>&copy; {new Date().getFullYear()} System4Learn Platform. Built with Claude AI &amp; Supabase.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

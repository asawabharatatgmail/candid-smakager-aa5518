import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { StudentSubscription } from '../../types';

const StudentSubscriptionView: React.FC = () => {
  const { studentPlans, studentSubscriptions, setStudentSubscriptions, currentUser } = useAppContext();
  const [selected, setSelected]   = useState<string | null>(null);
  const [payMode, setPayMode]     = useState<'UPI'|'Card'|'NetBanking'>('UPI');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  const mySub  = studentSubscriptions.find(ss => ss.studentId === currentUser?.id && ss.status === 'active');
  const myPlan = studentPlans.find(p => p.id === mySub?.planId);

  const handleSubscribe = () => {
    if (!selected) return;
    const plan = studentPlans.find(p => p.id === selected);
    if (!plan) return;
    setLoading(true);
    setTimeout(() => {
      const now = new Date();
      const exp = new Date(now); exp.setMonth(exp.getMonth() + 1);
      const sub: StudentSubscription = {
        id: mySub?.id ?? `ss_${Date.now()}`,
        studentId: currentUser!.id,
        planId: selected,
        status: 'active',
        startDate: now.toISOString().split('T')[0],
        expiryDate: exp.toISOString().split('T')[0],
        paymentMode: plan.price === 0 ? 'Free Trial' : payMode,
        amountPaid: plan.price,
        autoRenew: true,
      };
      setStudentSubscriptions(prev => prev.some(s => s.studentId === currentUser!.id)
        ? prev.map(s => s.studentId === currentUser!.id ? sub : s)
        : [...prev, sub]);
      setLoading(false);
      setSuccess(true);
      setSelected(null);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  const planColors: Record<string, string> = {
    sp_free:  'border-slate-200 bg-slate-50',
    sp_basic: 'border-blue-200 bg-blue-50',
    sp_pro:   'border-violet-300 bg-violet-50',
    sp_elite: 'border-amber-300 bg-amber-50',
  };
  const btnColors: Record<string, string> = {
    sp_free:  'bg-slate-600 hover:bg-slate-700',
    sp_basic: 'bg-blue-600 hover:bg-blue-700',
    sp_pro:   'bg-violet-600 hover:bg-violet-700',
    sp_elite: 'bg-amber-600 hover:bg-amber-700',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Student Subscription</h2>
        <p className="text-sm text-slate-500 mt-1">Choose a plan to unlock AI content generation, challenges, sharing and detailed progress reports.</p>
      </div>

      {/* Current Plan */}
      {mySub && myPlan && (
        <div className="bg-violet-600 text-white rounded-2xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm text-violet-200">Active Plan</p>
            <h3 className="text-2xl font-black">{myPlan.name}</h3>
            <p className="text-violet-200 text-sm mt-1">Valid until {mySub.expiryDate} · {mySub.paymentMode}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black">₹{myPlan.price}</p>
            <p className="text-violet-200 text-xs">/month</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-sm font-semibold text-green-700 text-center">
          ✅ Subscription activated! Enjoy your new features.
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {studentPlans.filter(p => p.isActive).map(plan => {
          const isCurrent = mySub?.planId === plan.id;
          return (
            <div key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`rounded-2xl border-2 p-5 cursor-pointer flex flex-col transition-all relative
                ${selected === plan.id ? 'border-violet-500 shadow-lg shadow-violet-100' : planColors[plan.id] ?? 'border-slate-200'}
                ${isCurrent ? 'ring-2 ring-violet-600 ring-offset-2' : ''}`}>
              {isCurrent && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">Current</span>}
              {plan.id === 'sp_pro' && !isCurrent && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">⭐ Popular</span>}

              <div className="mb-4">
                <h3 className="text-lg font-black text-slate-800">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-slate-900">₹{plan.price}</span>
                  <span className="text-slate-400 text-xs">/month</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {plan.maxAiGenerations === -1 ? 'Unlimited AI' : `${plan.maxAiGenerations} AI/month`}
                </p>
              </div>

              <ul className="space-y-1.5 flex-1 mb-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="text-green-500 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1 mb-4">
                {plan.challengesEnabled    && <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">⚡ Challenges</span>}
                {plan.shareEnabled         && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">📤 Share</span>}
                {plan.detailedReportsEnabled && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">📊 Reports</span>}
                {plan.leaderboardEnabled   && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">🏆 Leaderboard</span>}
              </div>

              <div className={`w-5 h-5 rounded-full border-2 mx-auto transition-all ${selected === plan.id ? 'border-violet-600 bg-violet-600' : 'border-slate-300'}`} />
            </div>
          );
        })}
      </div>

      {/* Checkout */}
      {selected && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-slate-800">Activate Plan</h3>
          {(studentPlans.find(p => p.id === selected)?.price ?? 0) > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(['UPI', 'Card', 'NetBanking'] as const).map(m => (
                  <button key={m} onClick={() => setPayMode(m)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${payMode === m ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600'}`}>
                    {m === 'UPI' ? '📱 ' : m === 'Card' ? '💳 ' : '🏦 '}{m}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 text-sm">
            <span className="text-slate-600">Plan: <strong>{studentPlans.find(p => p.id === selected)?.name}</strong></span>
            <span className="font-bold text-slate-800">₹{studentPlans.find(p => p.id === selected)?.price}/month</span>
          </div>
          <button onClick={handleSubscribe} disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
              ${loading ? 'bg-slate-400 cursor-not-allowed' : (btnColors[selected] ?? 'bg-violet-600 hover:bg-violet-700')}`}>
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</> : `Activate ${studentPlans.find(p => p.id === selected)?.name}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentSubscriptionView;

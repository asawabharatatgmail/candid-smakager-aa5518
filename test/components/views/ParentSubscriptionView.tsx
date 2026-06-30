import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ParentSubscription } from '../../types';

const ParentSubscriptionView: React.FC = () => {
  const { parentPlans, parentSubscriptions, setParentSubscriptions, currentUser } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Card' | 'NetBanking' | 'Free Trial'>('UPI');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const mySub = parentSubscriptions.find(ps => ps.parentId === currentUser?.id && ps.status === 'active');
  const myPlan = parentPlans.find(p => p.id === mySub?.planId);

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    const plan = parentPlans.find(p => p.id === selectedPlan);
    if (!plan) return;
    setSubscribing(true);
    setTimeout(() => {
      const now = new Date();
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 1);
      const sub: ParentSubscription = {
        id:          mySub?.id ?? `ps_${Date.now()}`,
        parentId:    currentUser!.id,
        planId:      selectedPlan,
        status:      'active',
        startDate:   now.toISOString().split('T')[0],
        expiryDate:  expiry.toISOString().split('T')[0],
        paymentMode: plan.price === 0 ? 'Free Trial' : paymentMode,
        amountPaid:  plan.price,
        autoRenew:   true,
      };
      setParentSubscriptions(prev => prev.some(ps => ps.parentId === currentUser!.id)
        ? prev.map(ps => ps.parentId === currentUser!.id ? sub : ps)
        : [...prev, sub]);
      setSubscribing(false);
      setSubscribed(true);
      setSelectedPlan(null);
      setTimeout(() => setSubscribed(false), 3000);
    }, 1500);
  };

  const planColors: Record<string, string> = {
    pp_free:   'border-slate-300 bg-slate-50',
    pp_basic:  'border-blue-300 bg-blue-50',
    pp_pro:    'border-indigo-400 bg-indigo-50',
    pp_family: 'border-purple-400 bg-purple-50',
  };
  const planBtnColors: Record<string, string> = {
    pp_free:   'bg-slate-600 hover:bg-slate-700',
    pp_basic:  'bg-blue-600 hover:bg-blue-700',
    pp_pro:    'bg-indigo-600 hover:bg-indigo-700',
    pp_family: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">My Subscription</h2>
        <p className="text-sm text-slate-500 mt-1">Choose a plan to unlock AI reports, content generation, and detailed analytics for your children.</p>
      </div>

      {/* Current Plan Banner */}
      {mySub && myPlan && (
        <div className="bg-indigo-600 text-white rounded-2xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm text-indigo-200">Current Active Plan</p>
            <h3 className="text-2xl font-black mt-0.5">{myPlan.name}</h3>
            <p className="text-indigo-200 text-sm mt-1">Valid until {mySub.expiryDate} · {myPlan.maxChildren} children</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black">₹{myPlan.price}</p>
            <p className="text-indigo-200 text-sm">/month</p>
          </div>
        </div>
      )}

      {subscribed && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-sm font-semibold text-green-700 text-center">
          ✅ Subscription activated successfully!
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {parentPlans.filter(p => p.isActive).map(plan => {
          const isActive = mySub?.planId === plan.id;
          return (
            <div key={plan.id}
              className={`rounded-2xl border-2 p-5 flex flex-col transition-all cursor-pointer relative
                ${selectedPlan === plan.id ? 'border-indigo-500 shadow-lg shadow-indigo-100' : planColors[plan.id] ?? 'border-slate-200'}
                ${isActive ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}>
              {isActive && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">Current Plan</span>}
              {plan.id === 'pp_pro' && !isActive && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">⭐ Popular</span>}

              <div className="mb-4">
                <h3 className="text-xl font-black text-slate-800">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-slate-900">₹{plan.price}</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Up to {plan.maxChildren} child{plan.maxChildren > 1 ? 'ren' : ''}</p>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {plan.aiReportsEnabled && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">🤖 AI Reports</span>}
                {plan.aiGeneratorEnabled && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">✨ AI Generator</span>}
                {plan.detailedAnalyticsEnabled && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">📊 Analytics</span>}
              </div>

              <div className={`w-5 h-5 rounded-full border-2 mx-auto transition-all
                ${selectedPlan === plan.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`} />
            </div>
          );
        })}
      </div>

      {/* Checkout */}
      {selectedPlan && !parentPlans.find(p => p.id === selectedPlan)?.price === false && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-slate-800">Complete Subscription</h3>
          {(parentPlans.find(p => p.id === selectedPlan)?.price ?? 0) > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(['UPI', 'Card', 'NetBanking'] as const).map(m => (
                  <button key={m} onClick={() => setPaymentMode(m)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${paymentMode === m ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}>
                    {m === 'UPI' ? '📱 ' : m === 'Card' ? '💳 ' : '🏦 '}{m}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 text-sm">
            <span className="text-slate-600">Plan: <strong>{parentPlans.find(p => p.id === selectedPlan)?.name}</strong></span>
            <span className="font-bold text-slate-800">₹{parentPlans.find(p => p.id === selectedPlan)?.price}/month</span>
          </div>
          <button onClick={handleSubscribe} disabled={subscribing}
            className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2
              ${subscribing ? 'bg-slate-400 cursor-not-allowed' : planBtnColors[selectedPlan] ?? 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {subscribing
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              : <>Activate {parentPlans.find(p => p.id === selectedPlan)?.name} Plan</>}
          </button>
        </div>
      )}
    </div>
  );
};

export default ParentSubscriptionView;

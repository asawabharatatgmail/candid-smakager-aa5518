import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ParentPlan } from '../../types';

const ParentPlansView: React.FC = () => {
  const { parentPlans, setParentPlans, parentSubscriptions } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ParentPlan | null>(null);
  const [form, setForm] = useState<Partial<ParentPlan>>({});
  const [featuresText, setFeaturesText] = useState('');

  const openAdd = () => {
    setForm({ price: 99, billingCycle: 'monthly', maxChildren: 2, isActive: true, aiReportsEnabled: false, aiGeneratorEnabled: false, detailedAnalyticsEnabled: false });
    setFeaturesText('');
    setEditingPlan(null);
    setShowForm(true);
  };

  const openEdit = (plan: ParentPlan) => {
    setForm(plan);
    setFeaturesText(plan.features.join('\n'));
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    const plan: ParentPlan = {
      id:             editingPlan?.id ?? `pp_${Date.now()}`,
      name:           form.name ?? '',
      price:          Number(form.price ?? 0),
      billingCycle:   form.billingCycle ?? 'monthly',
      maxChildren:    Number(form.maxChildren ?? 1),
      features:       featuresText.split('\n').filter(f => f.trim()),
      aiReportsEnabled:       form.aiReportsEnabled ?? false,
      aiGeneratorEnabled:     form.aiGeneratorEnabled ?? false,
      detailedAnalyticsEnabled: form.detailedAnalyticsEnabled ?? false,
      isActive:       form.isActive ?? true,
      createdAt:      editingPlan?.createdAt ?? new Date().toISOString().split('T')[0],
    };
    setParentPlans(prev => editingPlan ? prev.map(p => p.id === editingPlan.id ? plan : p) : [...prev, plan]);
    setShowForm(false);
  };

  const toggleActive = (id: string) => {
    setParentPlans(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  // Subscriber counts
  const subCounts = parentPlans.reduce((acc, p) => {
    acc[p.id] = parentSubscriptions.filter(ps => ps.planId === p.id && ps.status === 'active').length;
    return acc;
  }, {} as Record<string, number>);

  const totalRevenue = parentSubscriptions.filter(ps => ps.status === 'active').reduce((s, ps) => {
    const plan = parentPlans.find(p => p.id === ps.planId);
    return s + (plan?.price ?? 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Parent Subscription Plans</h2>
          <p className="text-sm text-slate-500">Manage plans available to parents for AI features and multi-child support</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <span>+</span> Create Plan
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <p className="text-3xl font-black text-slate-800">{parentPlans.filter(p => p.isActive).length}</p>
          <p className="text-xs text-slate-500">Active Plans</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-3xl font-black text-slate-800">{parentSubscriptions.filter(ps => ps.status === 'active').length}</p>
          <p className="text-xs text-slate-500">Active Subscribers</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-3xl font-black text-indigo-600">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Monthly Revenue</p>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {parentPlans.map(plan => (
          <div key={plan.id} className={`bg-white rounded-2xl border-2 p-5 flex flex-col ${plan.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-black text-slate-800 text-lg">{plan.name}</h3>
                <p className="text-2xl font-black text-indigo-600">₹{plan.price}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="text-xs text-slate-500 mb-3 space-y-1">
              <p>👶 Up to {plan.maxChildren} child{plan.maxChildren > 1 ? 'ren' : ''}</p>
              <p>👥 {subCounts[plan.id] ?? 0} subscribers</p>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {plan.aiReportsEnabled && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">🤖 AI Reports</span>}
              {plan.aiGeneratorEnabled && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">✨ Generator</span>}
              {plan.detailedAnalyticsEnabled && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">📊 Analytics</span>}
            </div>

            <ul className="space-y-1 text-xs text-slate-500 flex-1 mb-4">
              {plan.features.slice(0, 3).map((f, i) => <li key={i} className="flex items-start gap-1"><span className="text-green-500">✓</span>{f}</li>)}
              {plan.features.length > 3 && <li className="text-slate-400">+{plan.features.length - 3} more</li>}
            </ul>

            <div className="flex gap-2">
              <button onClick={() => openEdit(plan)} className="flex-1 btn-secondary text-xs py-1.5">Edit</button>
              <button onClick={() => toggleActive(plan.id)} className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors ${plan.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                {plan.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Subscribers table */}
      {parentSubscriptions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Active Subscribers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Parent ID</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Expires</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parentSubscriptions.map(ps => {
                  const plan = parentPlans.find(p => p.id === ps.planId);
                  return (
                    <tr key={ps.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{ps.parentId}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{plan?.name ?? ps.planId}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${ps.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ps.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{ps.expiryDate}</td>
                      <td className="px-4 py-3 text-slate-500">{ps.paymentMode}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">₹{ps.amountPaid}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Plan Name *</label>
                  <input type="text" value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Basic / Pro / Family" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Price (₹/month)</label>
                  <input type="number" min={0} value={form.price ?? 0} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Max Children</label>
                  <input type="number" min={1} value={form.maxChildren ?? 1} onChange={e => setForm(p => ({ ...p, maxChildren: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Features (one per line)</label>
                <textarea value={featuresText} onChange={e => setFeaturesText(e.target.value)} rows={4} placeholder="AI Monthly Progress Report&#10;Up to 2 children&#10;Detailed analytics"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
              </div>

              <div className="space-y-2">
                {[
                  { key: 'aiReportsEnabled', label: '🤖 AI Reports Enabled' },
                  { key: 'aiGeneratorEnabled', label: '✨ AI Content Generator for Kids' },
                  { key: 'detailedAnalyticsEnabled', label: '📊 Detailed Analytics' },
                  { key: 'isActive', label: '✅ Plan is Active' },
                ].map(f => (
                  <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(form as any)[f.key] ?? false} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))}
                      className="w-4 h-4 rounded accent-indigo-600" />
                    <span className="text-sm text-slate-700">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleSave} className="btn-primary flex-1">Save Plan</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentPlansView;

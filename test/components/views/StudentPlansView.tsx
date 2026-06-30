import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { StudentPlan } from '../../types';

const StudentPlansView: React.FC = () => {
  const { studentPlans, setStudentPlans, studentSubscriptions, externalStudents } = useAppContext();
  const [showForm, setShowForm]   = useState(false);
  const [editPlan, setEditPlan]   = useState<StudentPlan | null>(null);
  const [form, setForm]           = useState<Partial<StudentPlan>>({});
  const [featText, setFeatText]   = useState('');

  const subCounts = studentPlans.reduce((acc, p) => {
    acc[p.id] = studentSubscriptions.filter(ss => ss.planId === p.id && ss.status === 'active').length;
    return acc;
  }, {} as Record<string, number>);

  const totalRevenue = studentSubscriptions.filter(ss => ss.status === 'active').reduce((s, ss) => {
    const p = studentPlans.find(pl => pl.id === ss.planId);
    return s + (p?.price ?? 0);
  }, 0);

  const openAdd = () => {
    setForm({ price: 49, billingCycle: 'monthly', maxAiGenerations: 30, isActive: true, challengesEnabled: false, shareEnabled: false, detailedReportsEnabled: false, leaderboardEnabled: false });
    setFeatText('');
    setEditPlan(null);
    setShowForm(true);
  };

  const openEdit = (plan: StudentPlan) => {
    setForm(plan);
    setFeatText(plan.features.join('\n'));
    setEditPlan(plan);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    const plan: StudentPlan = {
      id:                  editPlan?.id ?? `sp_${Date.now()}`,
      name:                form.name ?? '',
      price:               Number(form.price ?? 0),
      billingCycle:        form.billingCycle ?? 'monthly',
      features:            featText.split('\n').filter(f => f.trim()),
      challengesEnabled:   form.challengesEnabled ?? false,
      shareEnabled:        form.shareEnabled ?? false,
      aiGeneratorEnabled:  form.aiGeneratorEnabled ?? true,
      maxAiGenerations:    Number(form.maxAiGenerations ?? 30),
      detailedReportsEnabled: form.detailedReportsEnabled ?? false,
      leaderboardEnabled:  form.leaderboardEnabled ?? false,
      isActive:            form.isActive ?? true,
      createdAt:           editPlan?.createdAt ?? new Date().toISOString().split('T')[0],
    };
    setStudentPlans(prev => editPlan ? prev.map(p => p.id === editPlan.id ? plan : p) : [...prev, plan]);
    setShowForm(false);
  };

  const planColors: Record<string, string> = { sp_free: 'text-slate-600', sp_basic: 'text-blue-600', sp_pro: 'text-violet-600', sp_elite: 'text-amber-600' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Student Subscription Plans</h2>
          <p className="text-sm text-slate-500">Manage plans for external students — independent revenue stream</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><span>+</span>Create Plan</button>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <p className="text-3xl font-black text-slate-800">{externalStudents.filter(s => s.isActive).length}</p>
          <p className="text-xs text-slate-500">External Students</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-3xl font-black text-slate-800">{studentSubscriptions.filter(ss => ss.status === 'active').length}</p>
          <p className="text-xs text-slate-500">Active Subscribers</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-3xl font-black text-violet-600">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Monthly Revenue</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {studentPlans.map(plan => (
          <div key={plan.id} className={`bg-white rounded-2xl border-2 p-5 flex flex-col ${plan.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className={`font-black text-lg ${planColors[plan.id] ?? 'text-slate-800'}`}>{plan.name}</h3>
                <p className="text-2xl font-black text-slate-900">₹{plan.price}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
              </div>
              <span className={`badge text-xs ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {plan.isActive ? 'Active' : 'Off'}
              </span>
            </div>
            <div className="text-xs text-slate-500 mb-3">
              <p>🤖 {plan.maxAiGenerations === -1 ? 'Unlimited' : plan.maxAiGenerations} AI generations</p>
              <p>👥 {subCounts[plan.id] ?? 0} subscribers</p>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {plan.challengesEnabled      && <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">⚡ Challenges</span>}
              {plan.shareEnabled           && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">📤 Share</span>}
              {plan.detailedReportsEnabled && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">📊 Reports</span>}
              {plan.leaderboardEnabled     && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">🏆 Leaderboard</span>}
            </div>
            <ul className="text-xs text-slate-500 space-y-0.5 flex-1 mb-4">
              {plan.features.slice(0, 3).map((f, i) => <li key={i} className="flex gap-1"><span className="text-green-500">✓</span>{f}</li>)}
              {plan.features.length > 3 && <li className="text-slate-400">+{plan.features.length - 3} more</li>}
            </ul>
            <div className="flex gap-2">
              <button onClick={() => openEdit(plan)} className="flex-1 btn-secondary text-xs py-1.5">Edit</button>
              <button onClick={() => setStudentPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isActive: !p.isActive } : p))}
                className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors ${plan.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                {plan.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Subscribers Table */}
      {studentSubscriptions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Active Subscribers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Expires</th>
                  <th className="px-4 py-3 text-right">₹</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentSubscriptions.map(ss => {
                  const st = externalStudents.find(s => s.id === ss.studentId);
                  const plan = studentPlans.find(p => p.id === ss.planId);
                  return (
                    <tr key={ss.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{st?.name ?? ss.studentId}</p>
                        <p className="text-xs text-slate-400">{st?.grade} · {st?.city}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{plan?.name}</td>
                      <td className="px-4 py-3"><span className={`badge text-xs ${ss.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ss.status}</span></td>
                      <td className="px-4 py-3 text-slate-500">{ss.expiryDate}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">₹{ss.amountPaid}</td>
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
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg">{editPlan ? 'Edit Plan' : 'Create Student Plan'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Plan Name *</label>
                  <input type="text" value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Pro Scholar" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Price (₹/mo)</label>
                  <input type="number" min={0} value={form.price ?? 0} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">AI Generations/mo (-1 = ∞)</label>
                  <input type="number" value={form.maxAiGenerations ?? 30} onChange={e => setForm(p => ({ ...p, maxAiGenerations: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Features (one per line)</label>
                <textarea value={featText} onChange={e => setFeatText(e.target.value)} rows={4}
                  placeholder="Unlimited AI generations&#10;Create challenges&#10;Public library sharing"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 resize-none" />
              </div>
              <div className="space-y-2">
                {[
                  { key: 'challengesEnabled', label: '⚡ Challenges Enabled' },
                  { key: 'shareEnabled', label: '📤 Share to Public Library' },
                  { key: 'aiGeneratorEnabled', label: '🤖 AI Generator Enabled' },
                  { key: 'detailedReportsEnabled', label: '📊 Detailed Progress Reports' },
                  { key: 'leaderboardEnabled', label: '🏆 Leaderboard Access' },
                  { key: 'isActive', label: '✅ Plan Active' },
                ].map(f => (
                  <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(form as any)[f.key] ?? false} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))}
                      className="w-4 h-4 rounded accent-violet-600" />
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

export default StudentPlansView;

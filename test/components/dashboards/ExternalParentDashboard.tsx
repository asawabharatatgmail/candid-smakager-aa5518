import React from 'react';
import { useAppContext } from '../../context/AppContext';

const ExternalParentDashboard: React.FC = () => {
  const { currentUser, externalChildren, externalParentSession, parentPlans, parentSubscriptions, activitySessions, savedAiContent, setActiveView } = useAppContext();

  const myChildren = externalChildren.filter(c => c.parentId === currentUser?.id);
  const mySub = parentSubscriptions.find(ps => ps.parentId === currentUser?.id && ps.status === 'active');
  const myPlan = parentPlans.find(p => p.id === mySub?.planId);

  const totalContent = savedAiContent.filter(c => myChildren.some(ch => ch.linkedExternalStudentId === c.ownerId)).length;
  const totalSessions = activitySessions.filter(s => myChildren.some(ch => ch.linkedExternalStudentId === s.studentId)).length;

  const quickActions = [
    { label: 'Add Child',      view: 'ext-children',     icon: '👶', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
    { label: 'AI Study Tool',  view: 'ext-ai-generator', icon: '✨', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
    { label: 'Progress Report',view: 'ext-ai-reports',   icon: '📊', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
    { label: 'Upgrade Plan',   view: 'ext-subscription', icon: '⭐', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back</p>
            <h2 className="text-2xl font-black">{currentUser?.name}</h2>
            <p className="text-indigo-200 text-sm mt-1">External Parent · {myChildren.length} child{myChildren.length !== 1 ? 'ren' : ''} linked</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${mySub ? 'bg-white/20 text-white' : 'bg-white/10 text-indigo-200'}`}>
                {myPlan ? `${myPlan.name} Plan` : '🔓 Free Plan'}
              </span>
              {mySub && <span className="text-xs text-indigo-200">expires {mySub.expiryDate}</span>}
            </div>
          </div>
          <div className="text-4xl">👨‍👩‍👧‍👦</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Children',     value: myChildren.length, icon: '👧', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Study Sessions',value: totalSessions,    icon: '📚', color: 'bg-green-50 text-green-700' },
          { label: 'AI Content',   value: totalContent,      icon: '🧠', color: 'bg-purple-50 text-purple-700' },
          { label: 'Plan',         value: myPlan?.name ?? 'Free', icon: '⭐', color: 'bg-amber-50 text-amber-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 border border-white flex items-center gap-3 ${s.color} shadow-sm`}>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs opacity-70">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Children Overview */}
      {myChildren.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">My Children</h3>
            <button onClick={() => setActiveView('ext-children')} className="text-xs text-indigo-600 hover:underline font-medium">Manage →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myChildren.map(child => (
              <div key={child.id} className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {child.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{child.name}</p>
                    <p className="text-xs text-slate-400">{child.grade} · Age {child.age}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {child.subjectsOfInterest.slice(0, 3).map(s => (
                    <span key={s} className="text-xs bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{s}</span>
                  ))}
                  {child.subjectsOfInterest.length > 3 && (
                    <span className="text-xs text-slate-400">+{child.subjectsOfInterest.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">👶</div>
          <h3 className="font-bold text-indigo-800 text-lg">Add your first child</h3>
          <p className="text-indigo-600 text-sm mt-1">Add your child's profile to start generating personalised AI study content</p>
          <button onClick={() => setActiveView('ext-children')} className="mt-4 btn-primary text-sm">
            + Add Child Profile
          </button>
        </div>
      )}

      {/* No subscription upsell */}
      {!mySub && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-amber-800">🔓 Unlock AI Features</p>
            <p className="text-sm text-amber-700 mt-1">Subscribe to get AI progress reports, content generator for your kids, and detailed analytics</p>
            <div className="flex gap-2 mt-2">
              {['Basic ₹99/mo', 'Pro ₹199/mo', 'Family ₹299/mo'].map(p => (
                <span key={p} className="text-xs bg-white border border-amber-200 text-amber-700 px-2 py-1 rounded-full font-medium">{p}</span>
              ))}
            </div>
          </div>
          <button onClick={() => setActiveView('ext-subscription')} className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
            View Plans
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <button key={a.label} onClick={() => setActiveView(a.view)}
              className={`p-4 rounded-xl font-semibold text-sm transition-colors flex flex-col items-center gap-2 border border-transparent ${a.color}`}>
              <span className="text-2xl">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExternalParentDashboard;

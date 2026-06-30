import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LinkedChild } from '../../types';

const MyChildrenView: React.FC = () => {
  const {
    linkedChildren, setLinkedChildren,
    students, currentUser, parentSubscriptions, parentPlans,
    setActiveView,
  } = useAppContext();

  const [showAdd, setShowAdd] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [searchResult, setSearchResult] = useState<typeof students[0] | null | 'notfound'>(null);

  const myLinks = linkedChildren.filter(lc => lc.parentId === currentUser?.id);
  const mySub   = parentSubscriptions.find(ps => ps.parentId === currentUser?.id && ps.status === 'active');
  const myPlan  = parentPlans.find(p => p.id === mySub?.planId);
  const maxChildren = myPlan?.maxChildren ?? 1;

  const linkedStudents = myLinks.map(lc => ({
    link: lc,
    student: students.find(s => s.id === lc.studentId),
  })).filter(x => x.student);

  const handleSearch = () => {
    const found = students.find(s => s.email.toLowerCase() === searchEmail.toLowerCase());
    setSearchResult(found ?? 'notfound');
  };

  const handleAdd = () => {
    if (!searchResult || searchResult === 'notfound') return;
    if (myLinks.length >= maxChildren) return;
    const already = myLinks.some(lc => lc.studentId === searchResult.id);
    if (already) return;

    const newLink: LinkedChild = {
      id:        `lc_${Date.now()}`,
      parentId:  currentUser!.id,
      studentId: searchResult.id,
      nickname:  nickname.trim() || searchResult.name,
      addedAt:   new Date().toISOString().split('T')[0],
      isDefault: myLinks.length === 0,
    };
    setLinkedChildren(prev => [...prev, newLink]);
    setShowAdd(false);
    setSearchEmail('');
    setNickname('');
    setSearchResult(null);
  };

  const handleRemove = (id: string) => {
    setLinkedChildren(prev => prev.filter(lc => lc.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setLinkedChildren(prev => prev.map(lc => ({ ...lc, isDefault: lc.id === id })));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Children</h2>
          <p className="text-sm text-slate-500">{myLinks.length} of {maxChildren} child slots used</p>
        </div>
        {myLinks.length < maxChildren && (
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <span>+</span> Link Child
          </button>
        )}
      </div>

      {/* Plan info */}
      <div className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between
        ${mySub ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
        <div className="flex items-center gap-2">
          <span>{mySub ? '✅' : '⭐'}</span>
          <span>Plan: <strong>{myPlan?.name ?? 'Free'}</strong> · {maxChildren} child slot{maxChildren > 1 ? 's' : ''}</span>
        </div>
        {!mySub && (
          <button onClick={() => setActiveView('parent-subscription')} className="text-indigo-600 font-semibold text-xs hover:underline">
            Upgrade →
          </button>
        )}
      </div>

      {/* Children cards */}
      {linkedStudents.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <div className="text-5xl mb-3">👧👦</div>
          <p className="font-semibold">No children linked yet</p>
          <p className="text-sm mt-1">Link your child's student account to monitor their progress</p>
          <button onClick={() => setShowAdd(true)} className="mt-4 btn-primary text-sm">Link First Child</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {linkedStudents.map(({ link, student }) => (
            <div key={link.id} className={`bg-white rounded-2xl border-2 p-5 hover:shadow-md transition-all ${link.isDefault ? 'border-indigo-400' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {student!.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{link.nickname}</p>
                    <p className="text-xs text-slate-400">{student!.name}</p>
                    {link.isDefault && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">Primary</span>}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1 mb-4">
                <p>📧 {student!.email}</p>
                <p>📱 {student!.mobile}</p>
                <p>📅 Linked: {link.addedAt}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setActiveView('parent-reports')}
                  className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors">
                  View Progress
                </button>
                {!link.isDefault && (
                  <button onClick={() => handleSetDefault(link.id)}
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition-colors">
                    Set Primary
                  </button>
                )}
                <button onClick={() => handleRemove(link.id)}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-semibold transition-colors">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add child modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">Link a Child</h3>
              <button onClick={() => { setShowAdd(false); setSearchResult(null); setSearchEmail(''); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Child's Student Email *</label>
                <div className="flex gap-2">
                  <input type="email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                    placeholder="student@demo.com"
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  <button onClick={handleSearch} className="btn-primary text-sm px-4">Search</button>
                </div>
              </div>

              {searchResult === 'notfound' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  No student found with this email address.
                </div>
              )}

              {searchResult && searchResult !== 'notfound' && (
                <div className="bg-green-50 border border-green-300 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {searchResult.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{searchResult.name}</p>
                      <p className="text-xs text-slate-500">{searchResult.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nickname (optional)</label>
                    <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
                      placeholder="e.g. My Son, Elder Daughter"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                  {myLinks.some(lc => lc.studentId === searchResult.id) && (
                    <p className="text-xs text-orange-600">⚠️ This student is already linked to your account.</p>
                  )}
                  <button
                    onClick={handleAdd}
                    disabled={myLinks.some(lc => lc.studentId === searchResult.id)}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                    Link {searchResult.name}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyChildrenView;

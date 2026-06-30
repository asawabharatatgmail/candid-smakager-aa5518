import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SharedContent, SavedAiContent, AiContentType } from '../../types';

const TYPE_ICONS: Record<AiContentType, string> = { quiz: '📝', flashcards: '🃏', study_material: '📖', summary: '⚡' };
const TYPE_COLORS: Record<AiContentType, string> = { quiz: 'bg-blue-100 text-blue-700', flashcards: 'bg-purple-100 text-purple-700', study_material: 'bg-green-100 text-green-700', summary: 'bg-orange-100 text-orange-700' };

const PublicLibraryView: React.FC = () => {
  const { sharedContent, setSharedContent, savedAiContent, setSavedAiContent, currentUser, studentSubscriptions, studentPlans, setActiveView } = useAppContext();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AiContentType | 'all'>('all');
  const [shareCode, setShareCode] = useState('');
  const [shareError, setShareError] = useState('');
  const [showShareForm, setShowShareForm] = useState(false);
  const [shareItem, setShareItem] = useState<SavedAiContent | null>(null);
  const [shareDesc, setShareDesc] = useState('');
  const [shareTags, setShareTags] = useState('');
  const [shared, setShared] = useState(false);
  const [preview, setPreview] = useState<SharedContent | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  const mySub  = studentSubscriptions.find(ss => ss.studentId === currentUser?.id && ss.status === 'active');
  const myPlan = studentPlans.find(p => p.id === mySub?.planId);
  const canShare = myPlan?.shareEnabled ?? false;

  const publicItems = sharedContent.filter(sc => sc.isPublic && sc.ownerId !== currentUser?.id).filter(sc => {
    const matchSearch = sc.title.toLowerCase().includes(search.toLowerCase()) || sc.subject.toLowerCase().includes(search.toLowerCase()) || sc.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchType   = typeFilter === 'all' || sc.contentType === typeFilter;
    return matchSearch && matchType;
  });

  const myShared = sharedContent.filter(sc => sc.ownerId === currentUser?.id);

  const handleSharePublish = () => {
    if (!shareItem) return;
    const genCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };
    const sc: SharedContent = {
      id: `sc_${Date.now()}`,
      shareCode: genCode(),
      contentId: shareItem.id,
      ownerId: currentUser!.id,
      ownerName: currentUser!.name,
      title: shareItem.title,
      contentType: shareItem.contentType,
      subject: shareItem.subjectName,
      grade: shareItem.className,
      description: shareDesc,
      isPublic: true,
      viewCount: 0, likeCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      tags: shareTags.split(',').map(t => t.trim()).filter(Boolean),
    };
    setSharedContent(prev => [sc, ...prev]);
    setShared(true);
    setTimeout(() => { setShowShareForm(false); setShared(false); setShareDesc(''); setShareTags(''); setShareItem(null); }, 2000);
  };

  const handleSaveToLibrary = (sc: SharedContent) => {
    const original = savedAiContent.find(c => c.id === sc.contentId);
    const copy: SavedAiContent = {
      id: `sac_saved_${Date.now()}`,
      ownerId: currentUser!.id,
      ownerRole: 'Student',
      contentType: sc.contentType,
      title: `${sc.title} (saved)`,
      topic: sc.title,
      subjectName: sc.subject,
      className: sc.grade,
      content: original?.content ?? '{}',
      generatedAt: new Date().toISOString().split('T')[0],
      isSharedWithParent: false,
      aiProvider: 'gemini',
    };
    setSavedAiContent(prev => [copy, ...prev]);
    setSaved(prev => [...prev, sc.id]);
    setSharedContent(prev => prev.map(s => s.id === sc.id ? { ...s, viewCount: s.viewCount + 1 } : s));
  };

  const handleLike = (id: string) => {
    setSharedContent(prev => prev.map(s => s.id === id ? { ...s, likeCount: s.likeCount + 1 } : s));
  };

  const handleFindByCode = () => {
    const found = sharedContent.find(sc => sc.shareCode.toUpperCase() === shareCode.toUpperCase().trim());
    if (!found) { setShareError('No content found with this code.'); return; }
    setShareError('');
    setPreview(found);
    setShareCode('');
  };

  const myContent = savedAiContent.filter(c => c.ownerId === currentUser?.id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Public Library</h2>
          <p className="text-sm text-slate-500">Explore and save study materials shared by other students</p>
        </div>
        {canShare ? (
          <button onClick={() => setShowShareForm(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors">
            📤 Share My Content
          </button>
        ) : (
          <button onClick={() => setActiveView('student-subscription')}
            className="border border-green-300 text-green-700 bg-green-50 font-bold px-4 py-2.5 rounded-xl text-sm">
            🔒 Upgrade to Share
          </button>
        )}
      </div>

      {/* Find by code */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-5 text-white">
        <p className="font-bold text-sm mb-2">Have a Share Code? Access directly!</p>
        <div className="flex gap-2">
          <input type="text" value={shareCode} onChange={e => setShareCode(e.target.value.toUpperCase())}
            placeholder="Enter 8-char share code"
            className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/60 focus:outline-none font-mono uppercase tracking-widest" />
          <button onClick={handleFindByCode} className="bg-white text-green-700 font-bold px-5 py-2.5 rounded-xl text-sm">Find →</button>
        </div>
        {shareError && <p className="text-xs text-red-200 mt-2">{shareError}</p>}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, subject, tag..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {[{ id: 'all', label: 'All' }, { id: 'quiz', label: '📝 Quiz' }, { id: 'flashcards', label: '🃏 Flashcards' }, { id: 'study_material', label: '📖 Notes' }].map(f => (
            <button key={f.id} onClick={() => setTypeFilter(f.id as any)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${typeFilter === f.id ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-green-300'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Public Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {publicItems.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400">
            <div className="text-4xl mb-2">📚</div>
            <p>No public content matches your search</p>
          </div>
        ) : publicItems.map(sc => (
          <div key={sc.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all hover:border-green-200">
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{TYPE_ICONS[sc.contentType]}</span>
              <span className={`badge text-xs ${TYPE_COLORS[sc.contentType]}`}>{sc.contentType.replace('_', ' ')}</span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{sc.title}</h4>
            <p className="text-xs text-slate-400 mb-2">{sc.subject} · {sc.grade} · by {sc.ownerName}</p>
            {sc.description && <p className="text-xs text-slate-500 mb-2 leading-relaxed">{sc.description}</p>}
            <div className="flex flex-wrap gap-1 mb-3">
              {sc.tags.slice(0, 3).map(t => (
                <span key={t} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">#{t}</span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span>👁️ {sc.viewCount} views</span>
              <span>❤️ {sc.likeCount} likes</span>
              <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded">{sc.shareCode}</span>
            </div>
            <div className="flex gap-2">
              {!saved.includes(sc.id) ? (
                <button onClick={() => handleSaveToLibrary(sc)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                  💾 Save to Library
                </button>
              ) : (
                <span className="flex-1 text-center text-xs font-bold text-green-600 bg-green-50 py-2 rounded-xl">✓ Saved!</span>
              )}
              <button onClick={() => handleLike(sc.id)} className="px-3 py-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl text-xs transition-colors">❤️</button>
            </div>
          </div>
        ))}
      </div>

      {/* My Shared Content */}
      {myShared.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 mb-4">My Shared Content</h3>
          <div className="space-y-2">
            {myShared.map(sc => (
              <div key={sc.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{sc.title}</p>
                  <p className="text-xs text-slate-400">{sc.subject} · 👁️ {sc.viewCount} · ❤️ {sc.likeCount}</p>
                </div>
                <span className="font-mono text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-lg">{sc.shareCode}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg">{shared ? '✅ Published!' : '📤 Share to Public Library'}</h3>
              <button onClick={() => { setShowShareForm(false); setShared(false); }} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
            </div>
            {shared ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-3">🎉</div>
                <p className="font-bold text-slate-800">Content shared successfully!</p>
                <p className="text-sm text-slate-500 mt-1">Other students can now find and use your material.</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Content *</label>
                  <select value={shareItem?.id ?? ''} onChange={e => setShareItem(myContent.find(c => c.id === e.target.value) ?? null)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400">
                    <option value="">— Choose from My AI Library —</option>
                    {myContent.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                  <textarea value={shareDesc} onChange={e => setShareDesc(e.target.value)} rows={2}
                    placeholder="Help others understand what this covers..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tags (comma-separated)</label>
                  <input type="text" value={shareTags} onChange={e => setShareTags(e.target.value)}
                    placeholder="class10, physics, newton, easy"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400" />
                </div>
                <button onClick={handleSharePublish} disabled={!shareItem}
                  className={`w-full py-3 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white transition-colors ${!shareItem ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  Publish to Public Library
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800">{preview.title}</h3>
                <p className="text-xs text-slate-400">{preview.subject} · by {preview.ownerName}</p>
              </div>
              <button onClick={() => setPreview(null)} className="text-slate-400">✕</button>
            </div>
            {preview.description && <p className="text-sm text-slate-600 mb-4">{preview.description}</p>}
            <div className="flex gap-2">
              <button onClick={() => { handleSaveToLibrary(preview); setPreview(null); }}
                className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm">Save to Library</button>
              <button onClick={() => setPreview(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicLibraryView;

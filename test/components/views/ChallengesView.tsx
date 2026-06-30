import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { StudyChallenge, ChallengeParticipation } from '../../types';

const EMOJI_RANK: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

// ─── Take Challenge Modal ─────────────────────────────────────────────────────
const TakeChallengeModal: React.FC<{ challenge: StudyChallenge; onClose: () => void }> = ({ challenge, onClose }) => {
  const { currentUser, externalStudentSession, setChallengeParticipations, setStudyChallenges } = useAppContext();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState<{ score: number; pct: number; time: number } | null>(null);

  let questions: any[] = [];
  try { questions = JSON.parse(challenge.content).questions ?? []; } catch {}

  const handleSubmit = () => {
    const timeSec = Math.round((Date.now() - startTime) / 1000);
    let score = 0;
    questions.forEach((q: any, i: number) => { if (answers[i] === q.correctAnswerIndex) score++; });
    const pct = Math.round((score / questions.length) * 100);
    const participation: ChallengeParticipation = {
      id: `cp_${Date.now()}`,
      challengeId: challenge.id,
      participantId: currentUser?.id ?? 'anon',
      participantName: currentUser?.name ?? 'Anonymous',
      participantGrade: externalStudentSession?.grade,
      score, totalQuestions: questions.length, percentage: pct,
      timeTakenSeconds: timeSec,
      completedAt: new Date().toISOString(),
      answers: questions.map((_: any, i: number) => answers[i] ?? -1),
      rank: 1,
    };
    setChallengeParticipations(prev => [...prev, participation]);
    setStudyChallenges(prev => prev.map(c => c.id === challenge.id ? { ...c, participantCount: c.participantCount + 1 } : c));
    setResult({ score, pct, time: timeSec });
    setSubmitted(true);
  };

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">{result.pct >= 80 ? '🏆' : result.pct >= 60 ? '🎯' : '📚'}</div>
          <h3 className="text-2xl font-black text-slate-800">{result.score}/{questions.length} correct</h3>
          <p className="text-4xl font-black mt-2" style={{ color: result.pct >= 80 ? '#16a34a' : result.pct >= 60 ? '#d97706' : '#dc2626' }}>{result.pct}%</p>
          <p className="text-sm text-slate-500 mt-1">Time: {result.time}s</p>
          <p className="text-sm text-slate-600 mt-4 font-medium">{result.pct >= 80 ? 'Excellent work! You\'re on the leaderboard!' : result.pct >= 60 ? 'Good effort! Keep practising.' : 'Keep going! Review the material and try again.'}</p>
          <button onClick={onClose} className="mt-6 w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-4">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="font-black text-slate-800 text-lg">{challenge.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{challenge.subject} · {challenge.difficulty} · {challenge.timeLimitMinutes} min</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">✕</button>
        </div>
        <div className="p-6 space-y-5">
          {questions.map((q: any, i: number) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm font-semibold text-slate-800 mb-3">Q{i + 1}. {q.questionText}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt: string, j: number) => (
                  <button key={j} onClick={() => setAnswers(prev => ({ ...prev, [i]: j }))}
                    className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors
                      ${answers[i] === j ? 'border-violet-500 bg-violet-50 text-violet-800 font-semibold' : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'}`}>
                    <span className="font-bold mr-1">{String.fromCharCode(65+j)}.</span>{opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm">
            Submit Challenge ({Object.keys(answers).length}/{questions.length} answered)
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Create Challenge Modal ───────────────────────────────────────────────────
const CreateChallengeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser, externalStudentSession, setStudyChallenges, savedAiContent } = useAppContext();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [subject, setSubject] = useState(externalStudentSession?.subjectsOfInterest[0] ?? 'Mathematics');
  const [difficulty, setDifficulty] = useState<'Easy'|'Medium'|'Hard'>('Medium');
  const [timeLimit, setTimeLimit] = useState(5);
  const [isPublic, setIsPublic] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invites, setInvites] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [newCode, setNewCode] = useState('');

  const quizContent = savedAiContent.filter(c => c.ownerId === currentUser?.id && c.contentType === 'quiz');

  const genCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    setSaving(true);
    setTimeout(() => {
      const content = selectedContent
        ? savedAiContent.find(c => c.id === selectedContent)?.content ?? '{}'
        : JSON.stringify({ quizTitle: title, quizType: 'Multiple Choice', questions: [
            { questionText: `Sample question about ${subject}?`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswerIndex: 0 }
          ]});
      const code = genCode();
      const ch: StudyChallenge = {
        id: `ch_${Date.now()}`,
        code, creatorId: currentUser!.id, creatorName: currentUser!.name,
        title, description: desc, subject, grade: externalStudentSession?.grade ?? 'Class 10',
        contentType: 'quiz', content, difficulty, timeLimitMinutes: timeLimit,
        isPublic, invitedEmails: invites,
        status: 'active', createdAt: new Date().toISOString().split('T')[0],
        participantCount: 0,
      };
      setStudyChallenges(prev => [ch, ...prev]);
      setNewCode(code);
      setSaving(false);
      setDone(true);
    }, 1200);
  };

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="font-black text-slate-800 text-xl">Challenge Created!</h3>
          <p className="text-sm text-slate-500 mt-1 mb-5">Share this code to invite others</p>
          <div className="bg-violet-50 border-2 border-violet-400 rounded-2xl p-4 mb-5">
            <p className="text-xs text-violet-500 mb-1">JOIN CODE</p>
            <p className="text-4xl font-black text-violet-700 tracking-widest font-mono">{newCode}</p>
          </div>
          <button onClick={onClose} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-black text-slate-800 text-lg">Create Challenge</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Challenge Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Newton's Laws Sprint"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="What's this challenge about?"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Difficulty</label>
              <div className="flex gap-1">
                {(['Easy','Medium','Hard'] as const).map(d => (
                  <button key={d} type="button" onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${difficulty === d ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Time Limit: <span className="text-violet-600">{timeLimit} min</span></label>
              <input type="range" min={2} max={30} value={timeLimit} onChange={e => setTimeLimit(parseInt(e.target.value))}
                className="w-full accent-violet-600" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="w-4 h-4 rounded accent-violet-600" />
                <span className="text-sm text-slate-700 font-medium">Public Challenge</span>
              </label>
            </div>
          </div>

          {quizContent.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Use from My Library (optional)</label>
              <select value={selectedContent} onChange={e => setSelectedContent(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400">
                <option value="">— Create new questions automatically —</option>
                {quizContent.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Invite by Email</label>
            <div className="flex gap-2">
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="friend@email.com" onKeyDown={e => { if (e.key === 'Enter' && inviteEmail) { setInvites(p => [...p, inviteEmail]); setInviteEmail(''); }}}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
              <button type="button" onClick={() => { if (inviteEmail) { setInvites(p => [...p, inviteEmail]); setInviteEmail(''); }}}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-xl text-sm font-semibold transition-colors">Add</button>
            </div>
            {invites.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {invites.map(e => (
                  <span key={e} className="flex items-center gap-1 text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-1 rounded-full">
                    {e}
                    <button onClick={() => setInvites(p => p.filter(x => x !== e))} className="text-violet-400 hover:text-violet-600">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleCreate} disabled={!title.trim() || saving}
            className={`w-full py-3 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-2 ${saving || !title.trim() ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : '🚀 Launch Challenge'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────
const ChallengesView: React.FC = () => {
  const { studyChallenges, challengeParticipations, currentUser, studentSubscriptions, studentPlans, setActiveView } = useAppContext();
  const [tab, setTab]                   = useState<'browse' | 'mine' | 'join'>('browse');
  const [showCreate, setShowCreate]     = useState(false);
  const [takingChallenge, setTakingChallenge] = useState<StudyChallenge | null>(null);
  const [joinCode, setJoinCode]         = useState('');
  const [joinError, setJoinError]       = useState('');
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<string | null>(null);

  const mySub  = studentSubscriptions.find(ss => ss.studentId === currentUser?.id && ss.status === 'active');
  const myPlan = studentPlans.find(p => p.id === mySub?.planId);
  const canCreateChallenge = myPlan?.challengesEnabled ?? false;

  const myChallenges     = studyChallenges.filter(c => c.creatorId === currentUser?.id);
  const publicChallenges = studyChallenges.filter(c => c.isPublic && c.status === 'active');
  const participated     = challengeParticipations.filter(cp => cp.participantId === currentUser?.id).map(cp => cp.challengeId);
  const notParticipated  = publicChallenges.filter(c => !participated.includes(c.id));
  const participated_ch  = publicChallenges.filter(c => participated.includes(c.id));

  const handleJoinByCode = () => {
    const ch = studyChallenges.find(c => c.code.toUpperCase() === joinCode.toUpperCase().trim() && c.status === 'active');
    if (!ch) { setJoinError('Invalid or expired challenge code.'); return; }
    setJoinError('');
    setTakingChallenge(ch);
    setJoinCode('');
  };

  const getLeaderboard = (challengeId: string): ChallengeParticipation[] => {
    const all = challengeParticipations.filter(cp => cp.challengeId === challengeId);
    return [...all].sort((a, b) => b.percentage - a.percentage || a.timeTakenSeconds - b.timeTakenSeconds)
      .map((cp, i) => ({ ...cp, rank: i + 1 }));
  };

  const DiffBadge: React.FC<{ d: string }> = ({ d }) => {
    const c = d === 'Easy' ? 'bg-green-100 text-green-700' : d === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700';
    return <span className={`badge text-xs ${c}`}>{d}</span>;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Study Challenges</h2>
          <p className="text-sm text-slate-500">Create, join & compete in subject challenges</p>
        </div>
        {canCreateChallenge ? (
          <button onClick={() => setShowCreate(true)} className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors">
            ⚡ Create Challenge
          </button>
        ) : (
          <button onClick={() => setActiveView('student-subscription')}
            className="border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
            🔒 Upgrade to Create
          </button>
        )}
      </div>

      {/* Join by Code */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 text-white">
        <p className="font-bold text-sm mb-3">Have a Challenge Code? Join instantly!</p>
        <div className="flex gap-2">
          <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-char code (e.g. PHY101)"
            className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/60 focus:outline-none focus:bg-white/30 font-mono tracking-widest uppercase" />
          <button onClick={handleJoinByCode} className="bg-white text-violet-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-violet-50 transition-colors">
            Join →
          </button>
        </div>
        {joinError && <p className="text-xs text-red-200 mt-2">{joinError}</p>}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 w-fit">
        {[{ id: 'browse', label: '🌍 Browse' }, { id: 'mine', label: '⚡ My Challenges' }, { id: 'join', label: '🏆 Participated' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Browse Tab */}
      {tab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notParticipated.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-400">
              <div className="text-4xl mb-2">🏁</div>
              <p>You've participated in all available challenges! Check back later.</p>
            </div>
          ) : notParticipated.map(ch => (
            <div key={ch.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all hover:border-violet-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">{ch.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{ch.subject} · by {ch.creatorName}</p>
                </div>
                <DiffBadge d={ch.difficulty} />
              </div>
              <p className="text-xs text-slate-500 mb-3">{ch.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>⏱️ {ch.timeLimitMinutes} min</span>
                  <span>👥 {ch.participantCount} joined</span>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-lg">{ch.code}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setTakingChallenge(ch)}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-xl text-sm transition-colors">
                  Take Challenge ⚡
                </button>
                <button onClick={() => setSelectedLeaderboard(ch.id)}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition-colors">
                  🏆 Board
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mine Tab */}
      {tab === 'mine' && (
        <div>
          {myChallenges.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
              <div className="text-4xl mb-2">⚡</div>
              <p className="font-semibold">{canCreateChallenge ? 'No challenges created yet' : 'Upgrade to create challenges'}</p>
              <p className="text-sm mt-1">Create a challenge and invite your friends to compete!</p>
              {canCreateChallenge ? (
                <button onClick={() => setShowCreate(true)} className="mt-4 bg-violet-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">Create First Challenge</button>
              ) : (
                <button onClick={() => setActiveView('student-subscription')} className="mt-4 bg-violet-100 text-violet-700 font-bold px-6 py-2.5 rounded-xl text-sm">View Plans</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myChallenges.map(ch => {
                const lb = getLeaderboard(ch.id);
                return (
                  <div key={ch.id} className="bg-white rounded-2xl border-2 border-violet-200 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800">{ch.title}</h3>
                        <p className="text-xs text-slate-400">{ch.subject} · {ch.grade}</p>
                      </div>
                      <span className={`badge text-xs ${ch.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{ch.status}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-violet-50 border border-violet-200 rounded-xl px-3 py-2 text-center flex-1">
                        <p className="text-lg font-black text-violet-700 font-mono tracking-widest">{ch.code}</p>
                        <p className="text-xs text-violet-500">Join Code</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center flex-1">
                        <p className="text-lg font-black text-slate-800">{ch.participantCount}</p>
                        <p className="text-xs text-slate-400">Participants</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedLeaderboard(ch.id)}
                      className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-sm transition-colors">
                      🏆 View Leaderboard ({lb.length})
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Participated Tab */}
      {tab === 'join' && (
        <div className="space-y-3">
          {participated_ch.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-2">🏆</div>
              <p>You haven't participated in any challenges yet. Browse and join one!</p>
            </div>
          ) : participated_ch.map(ch => {
            const myEntry = challengeParticipations.find(cp => cp.challengeId === ch.id && cp.participantId === currentUser?.id);
            const lb = getLeaderboard(ch.id);
            const rank = lb.findIndex(cp => cp.participantId === currentUser?.id) + 1;
            return (
              <div key={ch.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800">{ch.title}</h3>
                  <p className="text-xs text-slate-400">{ch.subject} · {ch.creatorName}</p>
                </div>
                {myEntry && (
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-xl font-black" style={{ color: myEntry.percentage >= 80 ? '#16a34a' : myEntry.percentage >= 60 ? '#d97706' : '#dc2626' }}>{myEntry.percentage}%</p>
                      <p className="text-xs text-slate-400">Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-slate-800">{EMOJI_RANK[rank] ?? `#${rank}`}</p>
                      <p className="text-xs text-slate-400">Rank</p>
                    </div>
                    <button onClick={() => setSelectedLeaderboard(ch.id)} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-xl font-semibold">🏆 Board</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard Modal */}
      {selectedLeaderboard && (() => {
        const ch = studyChallenges.find(c => c.id === selectedLeaderboard);
        if (!ch) return null;
        const lb = getLeaderboard(selectedLeaderboard);
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-800">🏆 Leaderboard</h3>
                  <p className="text-xs text-slate-400">{ch.title}</p>
                </div>
                <button onClick={() => setSelectedLeaderboard(null)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
              </div>
              <div className="p-5 space-y-2">
                {lb.length === 0 ? (
                  <p className="text-center text-slate-400 py-6 text-sm">No participants yet</p>
                ) : lb.map((cp, i) => (
                  <div key={cp.id} className={`flex items-center gap-3 p-3 rounded-xl ${cp.participantId === currentUser?.id ? 'bg-violet-50 border border-violet-200' : 'bg-slate-50'}`}>
                    <span className="text-xl w-8 text-center">{EMOJI_RANK[i + 1] ?? `#${i+1}`}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{cp.participantName} {cp.participantId === currentUser?.id && <span className="text-xs text-violet-600">(You)</span>}</p>
                      <p className="text-xs text-slate-400">{cp.participantGrade} · {cp.timeTakenSeconds}s</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm" style={{ color: cp.percentage >= 80 ? '#16a34a' : cp.percentage >= 60 ? '#d97706' : '#dc2626' }}>{cp.percentage}%</p>
                      <p className="text-xs text-slate-400">{cp.score}/{cp.totalQuestions}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {showCreate && <CreateChallengeModal onClose={() => setShowCreate(false)} />}
      {takingChallenge && <TakeChallengeModal challenge={takingChallenge} onClose={() => setTakingChallenge(null)} />}
    </div>
  );
};

export default ChallengesView;

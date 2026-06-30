import React from 'react';
import { useAppContext } from '../../context/AppContext';

const Bar: React.FC<{ label: string; value: number; max: number; color: string; suffix?: string }> = ({ label, value, max, color, suffix = '' }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="font-bold text-slate-800">{value}{suffix}</span>
    </div>
    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%` }} />
    </div>
  </div>
);

const ExtStudentProgressView: React.FC = () => {
  const { activitySessions, currentUser, externalStudentSession, savedAiContent, studyChallenges, challengeParticipations, studentSubscriptions, studentPlans, setActiveView } = useAppContext();

  const mySessions = activitySessions.filter(s => s.studentId === currentUser?.id);
  const myContent  = savedAiContent.filter(c => c.ownerId === currentUser?.id);
  const myChallenges = studyChallenges.filter(c => c.creatorId === currentUser?.id);
  const myParticipations = challengeParticipations.filter(cp => cp.participantId === currentUser?.id);
  const mySub  = studentSubscriptions.find(ss => ss.studentId === currentUser?.id && ss.status === 'active');
  const myPlan = studentPlans.find(p => p.id === mySub?.planId);
  const hasReports = myPlan?.detailedReportsEnabled ?? false;

  const totalMin  = mySessions.reduce((s, a) => s + a.durationMinutes, 0);
  const quizSess  = mySessions.filter(s => s.score !== undefined && s.totalQuestions);
  const avgScore  = quizSess.length > 0 ? Math.round(quizSess.reduce((s, a) => s + Math.round((a.score!/a.totalQuestions!)*100), 0) / quizSess.length) : 0;
  const bestScore = quizSess.length > 0 ? Math.max(...quizSess.map(s => Math.round((s.score!/s.totalQuestions!)*100))) : 0;

  // Weekly breakdown (last 4 weeks)
  const now = new Date();
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const end = new Date(now); end.setDate(now.getDate() - i * 7);
    const start = new Date(end); start.setDate(end.getDate() - 6);
    const label = `Week ${4-i}`;
    const min = mySessions.filter(s => { const d = new Date(s.date); return d >= start && d <= end; }).reduce((sum, s) => sum + s.durationMinutes, 0);
    return { label, min };
  }).reverse();

  const maxWeekMin = Math.max(...weeks.map(w => w.min), 1);

  // Activity type breakdown
  const actTypes = [
    { key: 'quiz', label: 'Quizzes', color: 'bg-blue-500' },
    { key: 'study_material', label: 'Study Notes', color: 'bg-green-500' },
    { key: 'flashcards', label: 'Flashcards', color: 'bg-purple-500' },
    { key: 'ai_generate', label: 'AI Generate', color: 'bg-indigo-500' },
    { key: 'video', label: 'Videos', color: 'bg-orange-500' },
    { key: 'game', label: 'Games', color: 'bg-rose-500' },
  ].map(a => ({
    ...a,
    min: mySessions.filter(s => s.activity === a.key).reduce((sum, s) => sum + s.durationMinutes, 0),
  })).filter(a => a.min > 0);
  const maxActMin = Math.max(...actTypes.map(a => a.min), 1);

  // Challenge stats
  const challengeAvgScore = myParticipations.length > 0
    ? Math.round(myParticipations.reduce((s, cp) => s + cp.percentage, 0) / myParticipations.length)
    : 0;

  const kpis = [
    { label: 'Study Sessions', value: mySessions.length, icon: '📚', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Total Study Time', value: `${Math.floor(totalMin/60)}h ${totalMin%60}m`, icon: '⏱️', color: 'bg-blue-50 text-blue-700' },
    { label: 'Avg Quiz Score', value: avgScore > 0 ? `${avgScore}%` : '—', icon: '🎯', color: 'bg-green-50 text-green-700' },
    { label: 'Best Score', value: bestScore > 0 ? `${bestScore}%` : '—', icon: '🏆', color: 'bg-amber-50 text-amber-700' },
    { label: 'AI Content Created', value: myContent.length, icon: '🧠', color: 'bg-purple-50 text-purple-700' },
    { label: 'Challenges Joined', value: myParticipations.length, icon: '⚡', color: 'bg-violet-50 text-violet-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">My Progress</h2>
        <p className="text-sm text-slate-500">
          {externalStudentSession?.grade} · {externalStudentSession?.subjectsOfInterest.join(', ') || 'All subjects'}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`rounded-2xl p-4 flex items-center gap-3 border border-white shadow-sm ${k.color}`}>
            <span className="text-3xl">{k.icon}</span>
            <div>
              <p className="text-xl font-black">{k.value}</p>
              <p className="text-xs opacity-70">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {!hasReports && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-amber-800">📊 Unlock Detailed Analytics</p>
            <p className="text-sm text-amber-700 mt-0.5">Upgrade to Learner or Pro to get weekly breakdowns, subject-wise analysis, AI recommendations, and challenge insights.</p>
          </div>
          <button onClick={() => setActiveView('student-subscription')}
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
            Upgrade
          </button>
        </div>
      )}

      {hasReports && (
        <>
          {/* Weekly Study Time */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-800 mb-4">📅 Weekly Study Time (minutes)</h3>
            {totalMin === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No study sessions yet</p>
            ) : (
              <div className="space-y-3">
                {weeks.map(w => <Bar key={w.label} label={w.label} value={w.min} max={maxWeekMin} color="bg-indigo-500" suffix=" min" />)}
              </div>
            )}
          </div>

          {/* Activity Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-800 mb-4">🎯 Time by Activity (minutes)</h3>
            {actTypes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No activity data yet</p>
            ) : (
              <div className="space-y-3">
                {actTypes.map(a => <Bar key={a.key} label={a.label} value={a.min} max={maxActMin} color={a.color} suffix=" min" />)}
              </div>
            )}
          </div>

          {/* Challenge Performance */}
          {myParticipations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-800 mb-4">⚡ Challenge Performance</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Challenges Joined', value: myParticipations.length },
                  { label: 'Challenges Created', value: myChallenges.length },
                  { label: 'Avg Score', value: `${challengeAvgScore}%` },
                ].map(s => (
                  <div key={s.label} className="text-center bg-violet-50 rounded-xl p-3">
                    <p className="text-2xl font-black text-violet-800">{s.value}</p>
                    <p className="text-xs text-violet-600">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {myParticipations.slice(0, 5).map(cp => {
                  const ch = studyChallenges.find(c => c.id === cp.challengeId);
                  return (
                    <div key={cp.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{ch?.title ?? 'Unknown Challenge'}</p>
                        <p className="text-xs text-slate-400">{ch?.subject} · {cp.completedAt.split('T')[0]}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm" style={{ color: cp.percentage >= 80 ? '#16a34a' : cp.percentage >= 60 ? '#d97706' : '#dc2626' }}>{cp.percentage}%</p>
                        <p className="text-xs text-slate-400">{cp.timeTakenSeconds}s</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Study Insights */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-5">
            <h3 className="font-bold text-indigo-800 mb-3">🤖 AI Study Insights</h3>
            <div className="space-y-2.5">
              {[
                avgScore >= 80 ? `🌟 Excellent quiz performance (${avgScore}% avg)! You're mastering the material.` : avgScore > 0 ? `📈 Your average quiz score is ${avgScore}%. Focus on weak topics to improve.` : '📝 Take some quizzes to get performance insights.',
                totalMin < 60 ? '⏰ Try to study at least 30-45 minutes daily for better retention.' : `✅ Great consistency! You've studied ${Math.floor(totalMin/60)}h ${totalMin%60}m total.`,
                myContent.length === 0 ? '🧠 Use the AI Generator to create personalised study materials.' : `📚 You've created ${myContent.length} AI study items. Keep building your library!`,
                myParticipations.length === 0 ? '⚡ Join a challenge to test yourself against others and boost motivation.' : `🏆 You've participated in ${myParticipations.length} challenges. Great competitive spirit!`,
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="text-indigo-600 font-bold mt-0.5 flex-shrink-0">→</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExtStudentProgressView;

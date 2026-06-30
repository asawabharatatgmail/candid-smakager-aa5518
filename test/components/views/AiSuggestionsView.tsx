import React from 'react';
import { useAppContext } from '../../context/AppContext';

const AiSuggestionsView: React.FC = () => {
  const { activitySessions, currentUser, subjects, aiProgressReports, savedAiContent } = useAppContext();

  const mySessions = activitySessions.filter(s => s.studentId === currentUser?.id);
  const myReport   = aiProgressReports.find(r => r.studentId === currentUser?.id);
  const myContent  = savedAiContent.filter(c => c.ownerId === currentUser?.id);

  // Compute subject-level stats from activity
  const subjectStats: Record<string, { quizzes: number; avgScore: number; timeMin: number }> = {};
  mySessions.forEach(s => {
    if (!s.subjectId) return;
    if (!subjectStats[s.subjectId]) subjectStats[s.subjectId] = { quizzes: 0, avgScore: 0, timeMin: 0 };
    subjectStats[s.subjectId].timeMin += s.durationMinutes;
    if (s.score !== undefined && s.totalQuestions) {
      const pct = Math.round((s.score / s.totalQuestions) * 100);
      const curr = subjectStats[s.subjectId];
      curr.avgScore = curr.quizzes === 0 ? pct : Math.round((curr.avgScore * curr.quizzes + pct) / (curr.quizzes + 1));
      curr.quizzes++;
    }
  });

  const totalMinutes = mySessions.reduce((s, a) => s + a.durationMinutes, 0);
  const totalSessions = mySessions.length;
  const avgSessionMin = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  const subjectList = subjects.filter(s => subjectStats[s.id]);
  const weakSubjects = subjectList.filter(s => (subjectStats[s.id]?.avgScore ?? 100) < 75 && subjectStats[s.id]?.quizzes > 0);
  const strongSubjects = subjectList.filter(s => (subjectStats[s.id]?.avgScore ?? 0) >= 80 && subjectStats[s.id]?.quizzes > 0);

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-green-600 bg-green-50' : score >= 60 ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">AI Study Suggestions</h2>
        <p className="text-sm text-slate-500 mt-1">Personalised recommendations based on your quiz scores, study time, and activity patterns.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Study Sessions', value: totalSessions, icon: '📚' },
          { label: 'Total Hours', value: `${Math.floor(totalMinutes/60)}h ${totalMinutes%60}m`, icon: '⏱️' },
          { label: 'AI Content Created', value: myContent.length, icon: '🧠' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-3xl mb-1">{s.icon}</div>
            <p className="text-2xl font-black text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Subject Performance */}
      {subjectList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 mb-4">📊 Subject Performance</h3>
          <div className="space-y-3">
            {subjectList.map(subj => {
              const stats = subjectStats[subj.id];
              const score = stats.avgScore;
              const bar = Math.min(score, 100);
              return (
                <div key={subj.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">{subj.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{stats.timeMin} min · {stats.quizzes} quiz{stats.quizzes !== 1 ? 'zes' : ''}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(score)}`}>
                        {stats.quizzes > 0 ? `${score}%` : 'No quizzes yet'}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${bar}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      <div className="space-y-4">
        {/* Weak areas */}
        {weakSubjects.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
            <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <span>⚠️</span> Focus Areas — Needs Improvement
            </h3>
            <div className="space-y-3">
              {weakSubjects.map(subj => {
                const score = subjectStats[subj.id]?.avgScore ?? 0;
                return (
                  <div key={subj.id} className="bg-white rounded-xl p-4 border border-orange-100">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-slate-800">{subj.name}</p>
                      <span className="text-sm font-bold text-orange-600">{score}% avg</span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-slate-600">
                      <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">→</span> Dedicate 20–30 extra minutes daily to {subj.name}</li>
                      <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">→</span> Use the AI Generator to create practice quizzes on weak topics</li>
                      <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">→</span> Review your incorrect answers and create flashcards for mistakes</li>
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strengths */}
        {strongSubjects.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              <span>✅</span> Strengths — Keep It Up!
            </h3>
            <div className="flex flex-wrap gap-2">
              {strongSubjects.map(subj => (
                <div key={subj.id} className="bg-white border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-green-600 font-bold text-sm">{subj.name}</span>
                  <span className="text-xs text-green-500">{subjectStats[subj.id]?.avgScore}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Progress Report Suggestions */}
        {myReport && (
          <>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
              <h3 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                <span>🤖</span> AI Study Recommendations for {myReport.periodLabel}
              </h3>
              <ul className="space-y-2.5">
                {myReport.studyRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span>💡</span> Study Habit Tips
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '⏰', tip: `You study an average of ${avgSessionMin} min/session. Try to reach 45 min for deeper learning.` },
                  { icon: '📅', tip: 'Consistency beats intensity. Even 20 minutes daily is better than 3-hour weekend cram sessions.' },
                  { icon: '🧠', tip: 'Use the AI Generator to create topic-specific quizzes immediately after reading notes.' },
                  { icon: '🃏', tip: 'Flashcard revision is most effective just before sleeping. Try 10 cards every night.' },
                ].map((t, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 flex items-start gap-2.5 border border-slate-100">
                    <span className="text-xl">{t.icon}</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {mySessions.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-5xl mb-3">💡</div>
            <p className="font-semibold">No activity data yet</p>
            <p className="text-sm mt-1">Complete some quizzes and study sessions to get AI-powered suggestions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiSuggestionsView;

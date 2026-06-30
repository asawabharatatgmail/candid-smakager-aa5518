import React from 'react';
import { useAppContext } from '../../context/AppContext';

const ExternalStudentDashboard: React.FC = () => {
  const { currentUser, externalStudentSession, savedAiContent, activitySessions, personalAiConfigs, setActiveView } = useAppContext();

  const myContent  = savedAiContent.filter(c => c.ownerId === currentUser?.id);
  const mySessions = activitySessions.filter(s => s.studentId === currentUser?.id);
  const myConfig   = personalAiConfigs.find(c => c.ownerId === currentUser?.id);
  const totalMin   = mySessions.reduce((s, a) => s + a.durationMinutes, 0);
  const quizSessions = mySessions.filter(s => s.score !== undefined && s.totalQuestions);
  const avgScore   = quizSessions.length > 0
    ? Math.round(quizSessions.reduce((s, a) => s + Math.round((a.score!/a.totalQuestions!)*100), 0) / quizSessions.length)
    : 0;

  const hasKey = !!myConfig && !!(myConfig.geminiApiKey || myConfig.openaiApiKey || myConfig.anthropicApiKey || myConfig.groqApiKey);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
        <p className="text-violet-200 text-sm mb-1">Welcome back</p>
        <h2 className="text-2xl font-black">{currentUser?.name}</h2>
        {externalStudentSession && (
          <p className="text-violet-200 text-sm mt-1">
            {externalStudentSession.grade} · Age {externalStudentSession.age}
            {externalStudentSession.schoolName && ` · ${externalStudentSession.schoolName}`}
          </p>
        )}
        {externalStudentSession && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {externalStudentSession.subjectsOfInterest.map(s => (
              <span key={s} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* AI Key warning */}
      {!hasKey && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">🔑</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Set up your free AI key</p>
            <p className="text-xs text-amber-700 mt-0.5">Add a Google Gemini API key (free) to generate personalised quizzes, notes and flashcards</p>
          </div>
          <button onClick={() => setActiveView('personal-ai-config')} className="flex-shrink-0 text-xs bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-amber-600">
            Set Up
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Study Sessions',  value: mySessions.length,           icon: '📚', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Total Study Time',value: `${Math.floor(totalMin/60)}h ${totalMin%60}m`, icon: '⏱️', color: 'bg-green-50 text-green-700' },
          { label: 'Avg Quiz Score',  value: avgScore > 0 ? `${avgScore}%` : '—',  icon: '🎯', color: 'bg-purple-50 text-purple-700' },
          { label: 'AI Content Made', value: myContent.length,             icon: '🧠', color: 'bg-rose-50 text-rose-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 border border-white flex items-center gap-3 ${s.color} shadow-sm`}>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-xs opacity-70">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-800 mb-4">Start Studying</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Generate Quiz',   view: 'ai-generator',       icon: '✨', color: 'bg-indigo-600 text-white hover:bg-indigo-700' },
            { label: 'My AI Library',   view: 'my-ai-library',       icon: '🧠', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            { label: 'AI Suggestions',  view: 'ai-suggestions',      icon: '💡', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
            { label: 'Setup AI Key',    view: 'personal-ai-config',  icon: '🔑', color: 'bg-slate-50 text-slate-700 hover:bg-slate-100' },
          ].map(a => (
            <button key={a.label} onClick={() => setActiveView(a.view)}
              className={`p-4 rounded-xl font-semibold text-sm transition-colors flex flex-col items-center gap-2 border border-transparent ${a.color}`}>
              <span className="text-2xl">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent content */}
      {myContent.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Recent AI Content</h3>
            <button onClick={() => setActiveView('my-ai-library')} className="text-xs text-indigo-600 font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-2">
            {myContent.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span>{c.contentType === 'quiz' ? '📝' : c.contentType === 'flashcards' ? '🃏' : c.contentType === 'study_material' ? '📖' : '⚡'}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{c.title}</p>
                    <p className="text-xs text-slate-400">{c.subjectName} · {c.generatedAt}</p>
                  </div>
                </div>
                <span className="badge bg-indigo-100 text-indigo-700 text-xs capitalize">{c.contentType.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalStudentDashboard;

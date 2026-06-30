import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AiProgressReport } from '../../types';

const BarChart: React.FC<{ data: { label: string; value: number; max: number; color: string }[] }> = ({ data }) => (
  <div className="space-y-3">
    {data.map(d => (
      <div key={d.label}>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-600 font-medium truncate max-w-40">{d.label}</span>
          <span className="font-bold text-slate-800 ml-2">{d.value}</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${d.color} rounded-full transition-all`} style={{ width: `${d.max > 0 ? (d.value / d.max) * 100 : 0}%` }} />
        </div>
      </div>
    ))}
  </div>
);

const ParentReportsView: React.FC = () => {
  const {
    linkedChildren, currentUser, students, activitySessions,
    aiProgressReports, setAiProgressReports, subjects,
    parentSubscriptions, parentPlans, savedAiContent, setActiveView,
  } = useAppContext();

  const myLinks   = linkedChildren.filter(lc => lc.parentId === currentUser?.id);
  const mySub     = parentSubscriptions.find(ps => ps.parentId === currentUser?.id && ps.status === 'active');
  const myPlan    = parentPlans.find(p => p.id === mySub?.planId);
  const hasAiReports = myPlan?.aiReportsEnabled ?? false;

  const [selectedChildId, setSelectedChildId] = useState<string>(myLinks[0]?.studentId ?? '');
  const [generatingReport, setGeneratingReport] = useState(false);

  const selectedStudent = students.find(s => s.id === selectedChildId);
  const childSessions   = activitySessions.filter(s => s.studentId === selectedChildId);
  const childContent    = savedAiContent.filter(c => c.ownerId === selectedChildId);
  const existingReport  = aiProgressReports.find(r => r.studentId === selectedChildId);

  const totalMinutes = childSessions.reduce((s, a) => s + a.durationMinutes, 0);
  const quizSessions = childSessions.filter(s => s.score !== undefined && s.totalQuestions);
  const avgScore     = quizSessions.length > 0
    ? Math.round(quizSessions.reduce((s, a) => s + Math.round((a.score! / a.totalQuestions!) * 100), 0) / quizSessions.length)
    : 0;

  const activityBreakdown = [
    { type: 'quiz', label: 'Quizzes' },
    { type: 'study_material', label: 'Study Material' },
    { type: 'flashcards', label: 'Flashcards' },
    { type: 'video', label: 'Videos' },
    { type: 'game', label: 'Games' },
    { type: 'ai_generate', label: 'AI Generated' },
  ].map(a => ({
    label: a.label,
    value: childSessions.filter(s => s.activity === a.type).reduce((s, x) => s + x.durationMinutes, 0),
    max: totalMinutes,
    color: 'bg-indigo-500',
  })).filter(a => a.value > 0);

  const subjectActivity = subjects.filter(s =>
    childSessions.some(a => a.subjectId === s.id)
  ).map(s => ({
    label: s.name,
    value: childSessions.filter(a => a.subjectId === s.id).reduce((sum, a) => sum + a.durationMinutes, 0),
    max: totalMinutes,
    color: 'bg-blue-500',
  }));

  const generateReport = () => {
    if (!selectedStudent) return;
    setGeneratingReport(true);
    setTimeout(() => {
      const report: AiProgressReport = {
        id:            existingReport?.id ?? `apr_${Date.now()}`,
        studentId:     selectedChildId,
        generatedAt:   new Date().toISOString().split('T')[0],
        periodLabel:   new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
        summary:       `${selectedStudent.name} has been actively studying with ${childSessions.length} sessions logged totalling ${totalMinutes} minutes. Their average quiz score is ${avgScore}%. They have generated ${childContent.length} AI study materials showing proactive learning behaviour.`,
        strengths:     avgScore >= 70
          ? [`Strong quiz performance averaging ${avgScore}%`, `Consistent study habit with ${childSessions.length} sessions`]
          : [`Regular app usage with ${childSessions.length} sessions`, `Exploring AI study tools`],
        areasToImprove: avgScore < 70
          ? [`Quiz scores need improvement (current: ${avgScore}%)`, 'Increase study time per session']
          : ['Diversify study activities beyond quizzes', 'Increase video watching time'],
        studyRecommendations: [
          `Aim for 45-minute study sessions (current avg: ${totalMinutes > 0 ? Math.round(totalMinutes / childSessions.length) : 0} min)`,
          'Create flashcards for every topic after studying',
          'Take one AI-generated quiz per subject per week',
          `Focus more on subjects with lower scores`,
        ],
        weeklyTimeSpent: [
          { week: 'Week 1', minutes: Math.round(totalMinutes * 0.25) },
          { week: 'Week 2', minutes: Math.round(totalMinutes * 0.22) },
          { week: 'Week 3', minutes: Math.round(totalMinutes * 0.28) },
          { week: 'Week 4', minutes: Math.round(totalMinutes * 0.25) },
        ],
        subjectScores: subjects.filter(s => childSessions.some(a => a.subjectId === s.id)).map(s => {
          const quizzes = childSessions.filter(a => a.subjectId === s.id && a.score !== undefined);
          const avg = quizzes.length > 0 ? Math.round(quizzes.reduce((sum, a) => sum + Math.round((a.score!/a.totalQuestions!)*100), 0) / quizzes.length) : 0;
          return { subjectName: s.name, avgScore: avg, quizCount: quizzes.length };
        }),
        overallScore: avgScore,
        attendancePercent: 88,
      };
      setAiProgressReports(prev => prev.some(r => r.studentId === selectedChildId)
        ? prev.map(r => r.studentId === selectedChildId ? report : r)
        : [...prev, report]);
      setGeneratingReport(false);
    }, 1800);
  };

  if (myLinks.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <div className="text-5xl mb-3">👧👦</div>
        <p className="font-semibold text-lg">No children linked</p>
        <p className="text-sm mt-1">Link your child's account first to view their reports</p>
        <button onClick={() => setActiveView('my-children')} className="mt-4 btn-primary text-sm">Go to My Children</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Progress Reports</h2>
          <p className="text-sm text-slate-500">Detailed analytics for each child</p>
        </div>
        {myLinks.length > 1 && (
          <select value={selectedChildId} onChange={e => setSelectedChildId(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white">
            {myLinks.map(lc => {
              const st = students.find(s => s.id === lc.studentId);
              return <option key={lc.studentId} value={lc.studentId}>{lc.nickname} ({st?.name})</option>;
            })}
          </select>
        )}
      </div>

      {selectedStudent && (
        <>
          {/* Student Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl font-bold">
                {selectedStudent.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                <p className="text-indigo-200 text-sm">{selectedStudent.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-5">
              {[
                { label: 'Sessions', value: childSessions.length },
                { label: 'Total Time', value: `${Math.floor(totalMinutes/60)}h ${totalMinutes%60}m` },
                { label: 'Avg Score', value: avgScore > 0 ? `${avgScore}%` : 'N/A' },
                { label: 'AI Content', value: childContent.length },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-black">{s.value}</p>
                  <p className="text-xs text-indigo-200">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-800 mb-4">Time by Activity Type</h3>
              {activityBreakdown.length > 0
                ? <BarChart data={activityBreakdown} />
                : <p className="text-sm text-slate-400 text-center py-6">No activity data yet</p>}
            </div>

            {/* Subject Time */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-800 mb-4">Time by Subject (minutes)</h3>
              {subjectActivity.length > 0
                ? <BarChart data={subjectActivity} />
                : <p className="text-sm text-slate-400 text-center py-6">No subject data yet</p>}
            </div>
          </div>

          {/* AI Report */}
          {hasAiReports ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">AI Progress Report</h3>
                <button onClick={generateReport} disabled={generatingReport}
                  className={`btn-primary text-sm flex items-center gap-2 ${generatingReport ? 'opacity-70' : ''}`}>
                  {generatingReport ? (
                    <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                  ) : (
                    <><span>🤖</span> {existingReport ? 'Regenerate' : 'Generate'} AI Report</>
                  )}
                </button>
              </div>

              {existingReport ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">{existingReport.periodLabel}</span>
                    <span>Generated: {existingReport.generatedAt}</span>
                    <span className="ml-auto">Overall: <strong className={existingReport.overallScore >= 70 ? 'text-green-600' : 'text-orange-600'}>{existingReport.overallScore}%</strong></span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200"
                    dangerouslySetInnerHTML={{ __html: existingReport.summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h4 className="font-bold text-green-800 mb-2">✅ Strengths</h4>
                      <ul className="space-y-1.5">
                        {existingReport.strengths.map((s, i) => <li key={i} className="text-sm text-green-700 flex items-start gap-1.5"><span>•</span>{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <h4 className="font-bold text-orange-800 mb-2">⚠️ Needs Work</h4>
                      <ul className="space-y-1.5">
                        {existingReport.areasToImprove.map((s, i) => <li key={i} className="text-sm text-orange-700 flex items-start gap-1.5"><span>•</span>{s}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                    <h4 className="font-bold text-indigo-800 mb-2">🎯 AI Recommendations</h4>
                    <ul className="space-y-2">
                      {existingReport.studyRecommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <div className="text-4xl mb-2">🤖</div>
                  <p className="text-sm">Click "Generate AI Report" to get a detailed analysis of your child's learning progress</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">🔒</div>
              <p className="font-semibold text-slate-700">AI Reports require a paid plan</p>
              <p className="text-sm text-slate-500 mt-1">Upgrade to Basic or higher to get AI-powered monthly progress reports for your children</p>
              <button onClick={() => setActiveView('parent-subscription')} className="mt-4 btn-primary text-sm">
                View Plans →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParentReportsView;

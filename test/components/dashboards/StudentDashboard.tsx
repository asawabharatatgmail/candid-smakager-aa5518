import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { GameChallenge, Student, Teacher, ScheduleEvent } from '../../types';

const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    filteredQuizzes,
    startQuiz,
    gameChallenges,
    startChallenge,
    setActiveView,
    filteredScheduleEvents,
    filteredTeachers,
    getContextData,
  } = useAppContext();

  const student = currentUser as Student;

  const availableChallenges = gameChallenges.filter(gc =>
    gc.classIds.includes(student?.classId)
  );

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysSchedule = filteredScheduleEvents
    .filter(e => e.day === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const myClass = getContextData('classes', student?.classId);
  const numClassmates = myClass ? myClass.studentIds.length : 0;
  const myTeachers = filteredTeachers;

  const quickActions = [
    { icon: 'ri-book-read-line', title: 'My Courses', desc: 'View enrolled subjects and materials.', view: 'my-courses', color: 'bg-indigo-100 text-indigo-600' },
    { icon: 'ri-quill-pen-line', title: 'My Notes', desc: 'Access saved notes and study guides.', view: 'my-notes', color: 'bg-violet-100 text-violet-600' },
    { icon: 'ri-line-chart-line', title: 'My Progress', desc: 'Track quiz scores and mastery.', view: 'my-progress', color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="page-title text-3xl">Welcome, {student?.name?.split(' ')[0]}! 👋</h1>
        <p className="page-sub">Your personal learning workspace is ready.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Learning Hub */}
          <button
            onClick={() => setActiveView('ai-study-tool')}
            className="w-full text-left rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <i className="ri-robot-2-fill text-3xl text-slate-900" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">AI Learning Hub</h2>
                <p className="mt-1 text-indigo-200 text-sm leading-relaxed">
                  Chat with your AI Tutor or generate comprehensive study guides on any topic in seconds.
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-slate-900 bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg transition-colors">
                  Explore AI Tools <i className="ri-arrow-right-line" />
                </span>
              </div>
            </div>
          </button>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((a, i) => (
              <button
                key={a.view}
                onClick={() => setActiveView(a.view)}
                className="card text-left group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center mb-3`}>
                  <i className={`${a.icon} text-lg`} />
                </div>
                <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
              </button>
            ))}
          </div>

          {/* Assignments & Challenges */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '180ms' }}>
            <h3 className="section-head">Assignments &amp; Challenges</h3>
            {availableChallenges.length === 0 && filteredQuizzes.length === 0 ? (
              <div className="empty-state py-8">
                <i className="ri-checkbox-circle-line text-4xl text-emerald-300 mb-2 block" />
                <p className="text-slate-500 font-medium">All caught up!</p>
                <p className="text-slate-500 text-xs mt-1">No new assignments or challenges right now.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {availableChallenges.map((challenge: GameChallenge) => (
                  <div key={challenge.id} className="flex justify-between items-center p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{challenge.title}</p>
                      <p className="text-xs text-slate-500">Topic: {challenge.topic} · {challenge.levels.length} Levels</p>
                    </div>
                    <button
                      onClick={() => startChallenge(challenge)}
                      className="btn-primary text-xs py-1.5 px-3 bg-amber-500 hover:bg-amber-600"
                    >
                      Play Now
                    </button>
                  </div>
                ))}
                {filteredQuizzes.map(quiz => (
                  <div key={quiz.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{quiz.quizTitle}</p>
                      <p className="text-xs text-slate-500">{quiz.questions.length} questions</p>
                    </div>
                    <button
                      onClick={() => startQuiz(quiz)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <h3 className="section-head">Today's Schedule</h3>
            {todaysSchedule.length > 0 ? (
              <ul className="space-y-2">
                {todaysSchedule.map((event: ScheduleEvent) => {
                  const subject = getContextData('subjects', event.subjectId);
                  const teacher = getContextData('teachers', event.teacherId);
                  return (
                    <li key={event.id} className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                      <p className="font-semibold text-slate-800 text-sm">{event.startTime} – {event.endTime}</p>
                      <p className="text-xs text-indigo-600 mt-0.5">{subject?.name || 'N/A'}</p>
                      <p className="text-xs text-slate-500">with {teacher?.name || 'N/A'}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-state py-4">
                <i className="ri-calendar-check-line text-2xl text-slate-600 mb-1 block" />
                <p className="text-slate-500 text-xs">No classes today. Enjoy!</p>
              </div>
            )}
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <h3 className="section-head">My Class &amp; Teachers</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-500">Class</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{myClass?.name || 'Not Assigned'}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-500">Classmates</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{numClassmates} students</p>
              </div>
              {myTeachers.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Teachers</p>
                  <ul className="space-y-2">
                    {myTeachers.map((teacher: Teacher) => (
                      <li key={teacher.id} className="flex items-center gap-2.5">
                        <img
                          className="h-8 w-8 rounded-full object-cover border border-slate-200"
                          src={`https://i.pravatar.cc/150?u=${teacher.id}`}
                          alt={teacher.name}
                        />
                        <span className="text-sm text-slate-700">{teacher.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

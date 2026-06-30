import React from 'react';
import { useAppContext } from '../../context/AppContext';
import PersonalizedInsights from '../features/PersonalizedInsights';
import { UserRole, ScheduleEvent, Student } from '../../types';
import WorkspaceContextSelector from '../features/WorkspaceContextSelector';

const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    teacherWorkspace,
    setActiveView,
    filteredQuizzes,
    filteredFlashcardSets,
    filteredScheduleEvents,
    students,
    getContextData
  } = useAppContext();

  const workspaceQuizzes = teacherWorkspace.classId && teacherWorkspace.subjectId
    ? filteredQuizzes.filter(q => q.classId === teacherWorkspace.classId && q.subjectId === teacherWorkspace.subjectId)
    : [];

  const workspaceFlashcardSets = teacherWorkspace.classId && teacherWorkspace.subjectId
    ? filteredFlashcardSets.filter(fs => fs.classId === teacherWorkspace.classId && fs.subjectId === teacherWorkspace.subjectId)
    : [];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const todaysSchedule = filteredScheduleEvents
    .filter(e => e.classId === teacherWorkspace.classId && e.subjectId === teacherWorkspace.subjectId && e.day === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const studentsInWorkspace = students.filter(s =>
    s.classId === teacherWorkspace.classId &&
    s.subjectIds.includes(teacherWorkspace.subjectId)
  );

  const currentClass = getContextData('classes', teacherWorkspace.classId);
  const currentSubject = getContextData('subjects', teacherWorkspace.subjectId);

  return (
    <div className="space-y-6">
      <div className="card animate-fade-in-up">
        <h1 className="page-title text-2xl">Welcome, {currentUser?.name}!</h1>
        <p className="page-sub mt-1">Select a class and subject below to filter your workspace content.</p>
      </div>

      <WorkspaceContextSelector />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <button
            onClick={() => setActiveView('content-creator')}
            className="card w-full text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">My Content</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {currentClass?.name && currentSubject?.name
                    ? `${currentClass.name} — ${currentSubject.name}`
                    : 'Select a workspace above'}
                </p>
              </div>
              <span className="btn-primary text-sm">+ Create New</span>
            </div>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card animate-fade-in-up" style={{ animationDelay: '60ms' }}>
              <h3 className="section-head">Created Quizzes</h3>
              {workspaceQuizzes.length > 0 ? (
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {workspaceQuizzes.map(quiz => (
                    <li
                      key={quiz.id}
                      onClick={() => setActiveView('library')}
                      className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                    >
                      <span className="font-medium text-slate-800 text-sm">{quiz.quizTitle}</span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{quiz.questions.length} Qs</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state py-6">
                  <i className="ri-file-list-3-line text-3xl text-slate-600 mb-2 block" />
                  <p className="text-slate-500 text-sm">No quizzes for this context.</p>
                </div>
              )}
            </div>

            <div className="card animate-fade-in-up" style={{ animationDelay: '120ms' }}>
              <h3 className="section-head">Created Flashcards</h3>
              {workspaceFlashcardSets.length > 0 ? (
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {workspaceFlashcardSets.map(set => (
                    <li
                      key={set.id}
                      onClick={() => setActiveView('library')}
                      className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                    >
                      <span className="font-medium text-slate-800 text-sm">{set.title}</span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{set.flashcards.length} Cards</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state py-6">
                  <i className="ri-stack-line text-3xl text-slate-600 mb-2 block" />
                  <p className="text-slate-500 text-sm">No flashcard sets for this context.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            <h3 className="section-head">
              Today's Schedule
              {currentClass?.name && (
                <span className="text-indigo-500 font-normal ml-1 text-xs">({currentClass.name})</span>
              )}
            </h3>
            {todaysSchedule.length > 0 ? (
              <ul className="space-y-2">
                {todaysSchedule.map((event: ScheduleEvent) => {
                  const subject = getContextData('subjects', event.subjectId);
                  return (
                    <li key={event.id} className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                      <p className="font-semibold text-slate-800 text-sm">{event.startTime} – {event.endTime}</p>
                      <p className="text-xs text-indigo-600 mt-0.5">{subject?.name || 'N/A'}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-state py-4">
                <i className="ri-calendar-line text-2xl text-slate-600 mb-1 block" />
                <p className="text-slate-500 text-xs">No classes today for this subject.</p>
              </div>
            )}
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: '140ms' }}>
            <h3 className="section-head">
              Student Roster
              <span className="text-indigo-500 font-normal ml-1 text-xs">({studentsInWorkspace.length})</span>
            </h3>
            {studentsInWorkspace.length > 0 ? (
              <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {studentsInWorkspace.map((student: Student) => (
                  <li key={student.id} className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-50">
                    <img
                      className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      src={`https://i.pravatar.cc/150?u=${student.id}`}
                      alt={student.name}
                    />
                    <span className="text-sm text-slate-700">{student.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state py-4">
                <i className="ri-user-search-line text-2xl text-slate-600 mb-1 block" />
                <p className="text-slate-500 text-xs">No students in this context.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <PersonalizedInsights role={UserRole.Teacher} />
    </div>
  );
};

export default TeacherDashboard;

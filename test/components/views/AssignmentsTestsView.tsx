﻿import React, { useState } from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { Quiz, QuizSubmission } from '../../types';

const AssignmentsTestsView: React.FC = () => {
  const { filteredQuizzes, startQuiz, quizSubmissions, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState('new');

  const studentSubmissions = quizSubmissions.filter(s => s.studentId === currentUser?.id);
  const completedQuizIds = new Set(studentSubmissions.map(s => s.quiz.id));

  const newQuizzes = filteredQuizzes.filter(q => !completedQuizIds.has(q.id));
  const completedQuizzes = studentSubmissions.map(sub => ({ ...sub.quiz, submission: sub }));

  const tabClass = (tabName: string) =>
    `px-3 py-2 font-medium text-sm rounded-md ${
      activeTab === tabName
        ? 'bg-indigo-500/20 text-indigo-700'
        : 'text-slate-500 hover:text-slate-800'
    }`;

  const renderQuizList = (quizList: (Quiz & { submission?: QuizSubmission })[], isCompleted: boolean) => (
    <ul className="space-y-3">
        {quizList.length > 0 ? quizList.map(quiz => (
            <li key={quiz.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                    <p className="font-semibold text-slate-800">{quiz.quizTitle}</p>
                    <p className="text-sm text-slate-500">{quiz.questions.length} questions</p>
                </div>
                {!isCompleted ? (
                    <button 
                        onClick={() => startQuiz(quiz)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                    >
                        Start Quiz
                    </button>
                ) : (
                    <div className="text-right">
                        <p className="font-semibold text-green-600">Completed</p>
                        <p className="text-sm text-slate-500">Score: {quiz.submission?.score}/{quiz.questions.length}</p>
                    </div>
                )}
            </li>
        )) : <p className="text-center p-4 text-slate-500">No items in this category.</p>}
    </ul>
  );

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-bold text-slate-900">Assignments &amp; Tests</h2>
        <p className="text-slate-600 mt-1">Stay on top of your coursework and assessments.</p>
      </Card>
      
      <Card>
        <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <button className={tabClass('new')} onClick={() => setActiveTab('new')}>
                    New &amp; Pending
                </button>
                <button className={tabClass('completed')} onClick={() => setActiveTab('completed')}>
                    Completed
                </button>
            </nav>
        </div>
        <div className="mt-4">
            {activeTab === 'new' && renderQuizList(newQuizzes, false)}
            {activeTab === 'completed' && renderQuizList(completedQuizzes, true)}
        </div>
      </Card>
    </div>
  );
};

export default AssignmentsTestsView;
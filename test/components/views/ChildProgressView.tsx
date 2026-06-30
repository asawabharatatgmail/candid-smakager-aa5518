﻿import React from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { UserRole, Parent } from '../../types';

const ChildProgressView: React.FC = () => {
  const { currentUser, currentRole, attendance, quizSubmissions, quizzes } = useAppContext();

  if (!currentUser || currentRole !== UserRole.Parent) {
    return (
        <Card>
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
                <p className="mt-4 text-slate-500">This view is only available for parents.</p>
            </div>
        </Card>
    );
  }

  const parent = currentUser as Parent;
  const child = parent.child;

  // Calculate real metrics
  const attendanceRecords = attendance.filter(a => a.studentId === child.id);
  const presentDays = attendanceRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const attendancePercentage = attendanceRecords.length > 0 ? Math.round((presentDays / attendanceRecords.length) * 100) : 100;

  const childSubmissions = quizSubmissions.filter(s => s.studentId === child.id);
  const totalPossibleScore = childSubmissions.reduce((sum, s) => sum + s.quiz.questions.length, 0);
  const totalActualScore = childSubmissions.reduce((sum, s) => sum + s.score, 0);
  const averageScore = totalPossibleScore > 0 ? Math.round((totalActualScore / totalPossibleScore) * 100) : 0;

  const availableQuizzes = quizzes.filter(q => q.classId === child.classId);
  const completedQuizIds = new Set(childSubmissions.map(s => s.quiz.id));
  const assignmentsDue = availableQuizzes.filter(q => !completedQuizIds.has(q.id)).length;

  const recentScores = childSubmissions.slice(-3).map(sub => ({
      name: sub.quiz.quizTitle,
      score: sub.quiz.questions.length > 0 ? Math.round((sub.score / sub.quiz.questions.length) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-bold text-slate-900">{child.name}'s Progress</h2>
        <p className="text-slate-600 mt-1">An overview of your child's recent academic performance.</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-500/10">
            <h4 className="font-semibold text-green-700">Overall Attendance</h4>
            <p className="text-3xl font-bold text-green-600 mt-2">{attendancePercentage}%</p>
        </Card>
         <Card className="bg-blue-500/10">
            <h4 className="font-semibold text-blue-700">Average Score</h4>
            <p className="text-3xl font-bold text-blue-600 mt-2">{averageScore}%</p>
        </Card>
        <Card className="bg-yellow-500/10">
            <h4 className="font-semibold text-amber-700">Assignments Due</h4>
            <p className="text-3xl font-bold text-amber-600 mt-2">{assignmentsDue}</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Recent Scores</h3>
        {recentScores.length > 0 ? (
          <ul className="space-y-3">
            {recentScores.map(item => (
              <li key={item.name} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="font-medium text-slate-800">{item.name}</span>
                <span className="font-semibold text-slate-900">{item.score}%</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-500 p-4">No quiz scores recorded yet.</p>
        )}
      </Card>
    </div>
  );
};

export default ChildProgressView;

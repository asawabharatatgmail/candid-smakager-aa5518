﻿import React from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';

const MyProgressView: React.FC = () => {
    const { quizSubmissions, currentUser, getContextData } = useAppContext();

    const studentSubmissions = quizSubmissions.filter(s => s.studentId === currentUser?.id);

    const recentQuizScores = studentSubmissions.slice(-5).map(sub => ({
        name: sub.quiz.quizTitle,
        score: sub.quiz.questions.length > 0 ? Math.round((sub.score / sub.quiz.questions.length) * 100) : 0,
    }));

    const submissionsBySubject: { [subjectId: string]: { totalScore: number; totalPossible: number; } } = {};
    studentSubmissions.forEach(sub => {
        const subjectId = sub.quiz.subjectId;
        if (!submissionsBySubject[subjectId]) {
            submissionsBySubject[subjectId] = { totalScore: 0, totalPossible: 0 };
        }
        submissionsBySubject[subjectId].totalScore += sub.score;
        submissionsBySubject[subjectId].totalPossible += sub.quiz.questions.length;
    });

    const subjectMastery = Object.keys(submissionsBySubject).map(subjectId => {
        const subjectData = submissionsBySubject[subjectId];
        const subject = getContextData('subjects', subjectId);
        const mastery = subjectData.totalPossible > 0 ? Math.round((subjectData.totalScore / subjectData.totalPossible) * 100) : 0;
        return { name: subject?.name || 'Unknown', score: mastery };
    }).sort((a, b) => b.score - a.score);

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-3xl font-bold text-slate-900">My Progress</h2>
                <p className="text-slate-600 mt-1">A visual breakdown of your academic performance.</p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Recent Quiz Scores</h3>
                    {recentQuizScores.length > 0 ? (
                        <div className="h-80 bg-slate-50 rounded-lg flex items-end justify-center p-4">
                            <div className="w-full flex justify-around items-end h-full">
                                {recentQuizScores.map((quiz, index) => (
                                    <div key={index} className="flex flex-col items-center" title={`${quiz.name}: ${quiz.score}%`}>
                                        <div className="w-8 bg-indigo-500 rounded-t-lg transition-all duration-500" style={{ height: `${quiz.score}%` }}></div>
                                        <span className="text-xs mt-1 text-slate-500 truncate w-16 text-center">Quiz {studentSubmissions.length - recentQuizScores.length + index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center">
                            <p className="text-slate-500">No quiz scores yet. Complete a quiz to see your progress!</p>
                        </div>
                    )}
                </Card>
                <Card>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Subject Mastery</h3>
                    {subjectMastery.length > 0 ? (
                        <ul className="space-y-4">
                            {subjectMastery.map(subject => (
                                <li key={subject.name}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-base font-medium text-indigo-700">{subject.name}</span>
                                        <span className="text-sm font-medium text-indigo-700">{subject.score}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${subject.score}%`, transition: 'width 0.5s' }}></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <div className="h-full flex items-center justify-center">
                            <p className="text-slate-500">No data available for subject mastery yet.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MyProgressView;

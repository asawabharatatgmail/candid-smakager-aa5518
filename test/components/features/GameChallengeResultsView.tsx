﻿import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { ChallengeSubmission, Student } from '../../types';

const GameChallengeResultsView: React.FC = () => {
    const { activeGameResults, challengeSubmissions, students, setActiveView } = useAppContext();

    const results = useMemo(() => {
        if (!activeGameResults) return [];
        return challengeSubmissions
            .filter(sub => sub.challengeId === activeGameResults.id)
            .map(sub => ({
                ...sub,
                student: students.find(s => s.id === sub.studentId) as Student,
            }))
            .filter(sub => sub.student) // Ensure student exists
            .sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score; // Higher score first
                }
                return a.timeTakenSeconds - b.timeTakenSeconds; // Faster time first
            });
    }, [activeGameResults, challengeSubmissions, students]);

    if (!activeGameResults) {
        return <Card><p>No challenge results to display.</p></Card>;
    }
    
    return (
        <div className="space-y-6">
            <Card>
                 <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Challenge Results</h2>
                        <p className="text-slate-600 mt-1">Scoreboard for: <span className="font-semibold">{activeGameResults.title}</span></p>
                    </div>
                     <button onClick={() => setActiveView('gamification')} className="text-sm text-indigo-400 hover:underline">
                        &larr; Back to Challenges
                    </button>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student Name</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Score</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Time Taken</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-slate-200">
                            {results.map((result, index) => (
                                <tr key={result.id} className="hover:bg-slate-100">
                                    <td className="px-6 py-4 text-center text-lg font-bold text-slate-800">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{result.student.name}</td>
                                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">{result.score.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center text-sm text-slate-500">
                                        {Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {results.length === 0 && <p className="text-center p-8 text-slate-500">No students have completed this challenge yet.</p>}
                </div>
            </Card>
        </div>
    );
};

export default GameChallengeResultsView;

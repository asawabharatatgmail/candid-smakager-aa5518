﻿import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { GameChallenge, GameChallengeMode, UserRole } from '../../types';
import Card from '../ui/Card';
import CreateChallengeModal from '../modals/CreateChallengeModal';
import { format } from 'date-fns';

const GamificationView: React.FC = () => {
    const { gameChallenges, viewChallengeResults, currentRole, startChallenge } = useAppContext();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Gamification Challenges</h2>
                        <p className="text-slate-600 mt-1">{
                            currentRole === UserRole.Student
                                ? "View available challenges, play games, and check leaderboards."
                                : "Create and manage interactive, multi-level games for your students."
                        }</p>
                    </div>
                    {currentRole !== UserRole.Student && (
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                        >
                            + Create New Challenge
                        </button>
                    )}
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Topic</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Levels</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-slate-200">
                            {gameChallenges.map((challenge: GameChallenge) => (
                                <tr key={challenge.id} className="hover:bg-slate-100">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{challenge.title}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{challenge.topic}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${challenge.mode === GameChallengeMode.TimeAttack ? 'bg-yellow-500/20 text-amber-700' : 'bg-blue-500/20 text-blue-700'}`}>
                                            {challenge.mode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{challenge.levels.length}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{format(new Date(challenge.createdAt), 'dd MMM yyyy')}</td>
                                    <td className="px-6 py-4 text-sm space-x-4">
                                        {currentRole === UserRole.Student ? (
                                            <>
                                                <button
                                                    onClick={() => startChallenge(challenge)}
                                                    className="font-medium text-green-600 hover:text-green-700"
                                                >
                                                    Play
                                                </button>
                                                <button
                                                    onClick={() => viewChallengeResults(challenge)}
                                                    className="font-medium text-indigo-400 hover:text-indigo-700"
                                                >
                                                    Leaderboard
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => viewChallengeResults(challenge)}
                                                className="font-medium text-indigo-400 hover:text-indigo-700"
                                            >
                                                View Results
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {gameChallenges.length === 0 && <p className="text-center p-8 text-slate-500">No challenges have been created yet.</p>}
                </div>
            </Card>

            {isCreateModalOpen && <CreateChallengeModal onClose={() => setCreateModalOpen(false)} />}
        </div>
    );
};

export default GamificationView;

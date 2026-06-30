import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { GameChallengeMode } from '../../types';

interface CreateChallengeModalProps {
  onClose: () => void;
}

const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ onClose }) => {
    const { createGameChallenge, filteredClasses, currentSubscription } = useAppContext();
    const [formData, setFormData] = useState({
        topic: 'The Solar System',
        mode: GameChallengeMode.TimeAttack,
        durationMinutes: 5,
        deadline: '',
        numLevels: 3,
        questionsPerLevel: 3,
        classIds: [] as string[],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'select-multiple') {
            const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions).map(option => option.value);
            setFormData(prev => ({ ...prev, [name]: selectedOptions }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSubscription.isAiEnabled) {
            setError("AI features are disabled. Cannot generate game.");
            return;
        }
        if (formData.classIds.length === 0) {
            setError("Please assign the challenge to at least one class.");
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await createGameChallenge(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'An error occurred while creating the challenge.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-scale-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Create AI-Powered Challenge</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-slate-600">Topic</label>
                            <input type="text" name="topic" id="topic" value={formData.topic} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="mode" className="block text-sm font-medium text-slate-600">Game Mode</label>
                            <select name="mode" id="mode" value={formData.mode} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md">
                                {Object.values(GameChallengeMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                            </select>
                        </div>
                        {formData.mode === GameChallengeMode.TimeAttack ? (
                            <div>
                                <label htmlFor="durationMinutes" className="block text-sm font-medium text-slate-600">Duration (minutes)</label>
                                <input type="number" name="durationMinutes" id="durationMinutes" min="1" max="60" value={formData.durationMinutes} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md" />
                            </div>
                        ) : (
                             <div>
                                <label htmlFor="deadline" className="block text-sm font-medium text-slate-600">Deadline</label>
                                <input type="date" name="deadline" id="deadline" value={formData.deadline} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md" />
                            </div>
                        )}
                        <div>
                            <label htmlFor="numLevels" className="block text-sm font-medium text-slate-600">Number of Levels</label>
                            <input type="number" name="numLevels" id="numLevels" min="1" max="10" value={formData.numLevels} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="questionsPerLevel" className="block text-sm font-medium text-slate-600">Questions per Level</label>
                            <input type="number" name="questionsPerLevel" id="questionsPerLevel" min="1" max="10" value={formData.questionsPerLevel} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="classIds" className="block text-sm font-medium text-slate-600">Assign to Classes</label>
                            <select name="classIds" id="classIds" multiple value={formData.classIds} onChange={handleChange} className="mt-1 block w-full h-32 px-3 py-2 bg-slate-100 border border-slate-200 rounded-md">
                                {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center">
                             {isLoading && <i className="ri-loader-4-line animate-spin -ml-1 mr-3 h-5 w-5"></i>}
                            {isLoading ? 'Generating Game...' : 'Create Challenge'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateChallengeModal;
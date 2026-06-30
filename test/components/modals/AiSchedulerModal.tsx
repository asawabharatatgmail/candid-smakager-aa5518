import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AiSchedulerRule } from '../../types';

interface AiSchedulerModalProps {
  onClose: () => void;
  forClassId: string;
}

const AiSchedulerModal: React.FC<AiSchedulerModalProps> = ({ onClose, forClassId }) => {
  const { subjects, generateScheduleFromAI, isAiScheduling, getContextData } = useAppContext();
  const forClass = getContextData('classes', forClassId);

  const initialRules: AiSchedulerRule[] = subjects.map(subject => ({
    subjectId: subject.id,
    lecturesPerWeek: 3, // Default value
  }));

  const [rules, setRules] = useState<AiSchedulerRule[]>(initialRules);
  const [error, setError] = useState('');

  const handleRuleChange = (subjectId: string, value: string) => {
    const lectures = parseInt(value, 10);
    if (lectures >= 0) {
      setRules(prevRules =>
        prevRules.map(rule =>
          rule.subjectId === subjectId ? { ...rule, lecturesPerWeek: lectures } : rule
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await generateScheduleFromAI(rules.filter(r => r.lecturesPerWeek > 0), forClassId);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during AI schedule generation.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-scale-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Scheduling Assistant</h2>
        <p className="text-slate-600 mb-4">Define the rules for generating a weekly schedule for <span className="font-bold">{forClass?.name}</span>.</p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Lectures per Week</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {rules.map(rule => {
                const subject = subjects.find(s => s.id === rule.subjectId);
                return (
                  <div key={rule.subjectId}>
                    <label htmlFor={`rule-${rule.subjectId}`} className="block text-sm font-medium text-slate-600">
                      {subject?.name}
                    </label>
                    <input
                      type="number"
                      id={`rule-${rule.subjectId}`}
                      min="0"
                      max="10"
                      value={rule.lecturesPerWeek}
                      onChange={(e) => handleRuleChange(rule.subjectId, e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isAiScheduling}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAiScheduling}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center disabled:bg-indigo-400"
            >
              {isAiScheduling && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isAiScheduling ? 'Generating...' : 'Generate Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiSchedulerModal;
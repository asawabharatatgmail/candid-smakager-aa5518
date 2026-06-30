import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Lead } from '../../types';

interface SetReminderModalProps {
  lead: Lead;
  onClose: () => void;
}

const SetReminderModal: React.FC<SetReminderModalProps> = ({ lead, onClose }) => {
  const { addReminder } = useAppContext();
  const [dateTime, setDateTime] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateTime) {
      setError('Please select a date and time for the reminder.');
      return;
    }
    addReminder({
      leadId: lead.id,
      dateTime: new Date(dateTime).toISOString(),
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full border border-slate-200 animate-scale-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Follow-up Reminder</h2>
        <p className="text-slate-600 mb-4">For lead: <span className="font-semibold">{lead.name}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dateTime" className="block text-sm font-medium text-slate-600">
              Reminder Date & Time
            </label>
            <input
              type="datetime-local"
              id="dateTime"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-600">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Follow up about the new curriculum"
              className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Set Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetReminderModal;
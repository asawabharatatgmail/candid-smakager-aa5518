import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Lead, AcademicClass } from '../../types';

interface ScheduleMeetModalProps {
  entity: Lead | AcademicClass;
  onClose: () => void;
}

const ScheduleMeetModal: React.FC<ScheduleMeetModalProps> = ({ entity, onClose }) => {
  const { addReminder, scheduleLiveClass } = useAppContext();
  const [meetLink, setMeetLink] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [dateTime, setDateTime] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [copySuccess, setCopySuccess] = useState('');

  const isLead = 'status' in entity;

  const generateMockMeetLink = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      const part1 = Array(3).fill(null).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
      const part2 = Array(4).fill(null).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
      const part3 = Array(3).fill(null).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
      return `https://meet.google.com/${part1}-${part2}-${part3}`;
  };

  const handleGenerateAndSchedule = () => {
    const newLink = generateMockMeetLink();
    setMeetLink(newLink);
    setIsGenerated(true);

    if (isLead) {
        addReminder({
            leadId: entity.id,
            dateTime: new Date(dateTime).toISOString(),
            notes: `Google Meet with ${entity.name}. Link: ${newLink}`,
        });
    } else {
        scheduleLiveClass(entity.id, new Date(dateTime).toISOString(), newLink);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetLink).then(() => {
        setCopySuccess('Link copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full border border-slate-200 animate-scale-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Schedule Google Meet</h2>
        <p className="text-slate-600 mb-4">For {isLead ? 'lead' : 'class'}: <span className="font-semibold">{entity.name}</span></p>

        <div className="space-y-4">
          <div>
            <label htmlFor="meetDateTime" className="block text-sm font-medium text-slate-600">
              Meeting Date & Time
            </label>
            <input
              type="datetime-local"
              id="meetDateTime"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={isGenerated}
            />
          </div>

          {!isGenerated ? (
             <button
                onClick={handleGenerateAndSchedule}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Generate Link & Schedule
              </button>
          ) : (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-600">Generated Meeting Link:</p>
                <div className="mt-2 flex items-center gap-2">
                    <input type="text" readOnly value={meetLink} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md text-sm" />
                    <button onClick={handleCopyLink} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-500">
                        {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                 <p className="text-xs text-green-600 mt-2">
                    {isLead 
                        ? "A reminder for this meeting has been added to your upcoming reminders." 
                        : "This live class has been added to the schedule and content library."
                    }
                </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetModal;
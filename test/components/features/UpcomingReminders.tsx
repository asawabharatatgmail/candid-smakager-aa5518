﻿

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { formatDistanceToNow } from 'date-fns';

const UpcomingReminders: React.FC = () => {
    const { reminders, updateReminder, getData } = useAppContext();
    const upcoming = reminders.filter(r => !r.isCompleted);

    const handleComplete = (id: string) => {
        updateReminder(id, { isCompleted: true });
    };

    return (
        <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming Reminders</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {upcoming.length > 0 ? (
                    upcoming.map(reminder => {
                        const lead = getData('leads').find(l => l.id === reminder.leadId);
                        if (!lead) return null;
                        
                        const isPastDue = new Date(reminder.dateTime) < new Date();

                        return (
                            <div key={reminder.id} className="p-3 bg-slate-100 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-slate-800">{lead.name}</p>
                                    <button onClick={() => handleComplete(reminder.id)} className="text-xs text-slate-500 hover:text-green-500 font-semibold" title="Mark as complete">
                                        <i className="ri-check-line"></i>
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{reminder.notes}</p>
                                <p className={`text-xs mt-2 font-medium ${isPastDue ? 'text-red-600' : 'text-slate-500'}`}>
                                    Due {formatDistanceToNow(new Date(reminder.dateTime), { addSuffix: true })}
                                </p>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No upcoming reminders.</p>
                )}
            </div>
        </Card>
    );
};

export default UpcomingReminders;
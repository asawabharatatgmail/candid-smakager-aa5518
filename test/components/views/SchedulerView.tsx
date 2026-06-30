﻿import React, { useState, useMemo, useCallback } from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { ScheduleEvent, Subject, Teacher, UserRole } from '../../types';
import AiSchedulerModal from '../modals/AiSchedulerModal';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = Array.from({ length: 8 }, (_, i) => `${(i + 9).toString().padStart(2, '0')}:00`); // 9 AM to 4 PM

const eventColors = [
    'bg-blue-900/50 border-blue-600 text-blue-200',
    'bg-purple-900/50 border-purple-600 text-purple-200',
    'bg-green-900/50 border-green-600 text-green-200',
    'bg-yellow-900/50 border-yellow-600 text-yellow-200',
    'bg-red-900/50 border-red-600 text-red-200',
    'bg-indigo-900/50 border-indigo-600 text-indigo-200',
];
const liveClassColor = 'bg-sky-900/50 border-sky-600 text-sky-200';

const getEventColor = (event: ScheduleEvent, subjects: any[]) => {
    if (event.eventType === 'Live Class') return liveClassColor;
    const index = subjects.findIndex(s => s.id === event.subjectId);
    return eventColors[index % eventColors.length];
};

interface SelectionModalProps {
    draggedItem: { type: 'teacher' | 'subject'; id: string };
    dropTarget: { day: string; time: string };
    classId: string;
    onClose: () => void;
}
const SelectionModal: React.FC<SelectionModalProps> = ({ draggedItem, dropTarget, classId, onClose }) => {
    const { addScheduleEvent, filteredTeachers, filteredSubjects } = useAppContext();
    const [selectionId, setSelectionId] = useState('');

    const { title, options } = useMemo(() => {
        if (draggedItem.type === 'subject') {
            const subject = filteredSubjects.find(s => s.id === draggedItem.id);
            return {
                title: `Select a teacher for ${subject?.name}`,
                options: filteredTeachers.filter(t => t.subjectIds.includes(draggedItem.id)),
            };
        } else { // teacher
            const teacher = filteredTeachers.find(t => t.id === draggedItem.id);
            return {
                title: `Select a subject for ${teacher?.name}`,
                options: filteredSubjects.filter(s => teacher?.subjectIds.includes(s.id)),
            };
        }
    }, [draggedItem, filteredTeachers, filteredSubjects]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectionId) return;
        addScheduleEvent({
            day: dropTarget.day,
            startTime: dropTarget.time,
            classId: classId,
            subjectId: draggedItem.type === 'subject' ? draggedItem.id : selectionId,
            teacherId: draggedItem.type === 'teacher' ? draggedItem.id : selectionId,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-50 rounded-lg shadow-xl p-6 max-w-lg w-full border border-slate-200 animate-scale-in">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select value={selectionId} onChange={e => setSelectionId(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md">
                        <option value="">Select...</option>
                        {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold">Add to Schedule</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SchedulerSummary: React.FC<{ events: ScheduleEvent[], subjects: Subject[], teachers: Teacher[] }> = ({ events, subjects, teachers }) => {
    const stats = useMemo(() => {
        const subjectHours: { [key: string]: number } = {};
        const teacherHours: { [key: string]: number } = {};

        events.forEach(event => {
            if (event.subjectId) {
                subjectHours[event.subjectId] = (subjectHours[event.subjectId] || 0) + 1;
            }
            if (event.teacherId) {
                teacherHours[event.teacherId] = (teacherHours[event.teacherId] || 0) + 1;
            }
        });

        const subjectData = Object.entries(subjectHours).map(([id, hours]) => ({ name: subjects.find(s => s.id === id)?.name || 'Unknown', hours })).sort((a,b) => b.hours - a.hours);
        const teacherData = Object.entries(teacherHours).map(([id, hours]) => ({ name: teachers.find(t => t.id === id)?.name || 'Unknown', hours })).sort((a,b) => b.hours - a.hours);

        return { subjectData, teacherData };
    }, [events, subjects, teachers]);

    return (
        <Card>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Weekly Hours Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">By Subject</h4>
                    <ul className="space-y-2">
                        {stats.subjectData.map(s => <li key={s.name} className="flex justify-between p-2 bg-slate-100 rounded-md"><span>{s.name}</span><span className="font-bold">{s.hours} hrs</span></li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">By Teacher</h4>
                    <ul className="space-y-2">
                        {stats.teacherData.map(t => <li key={t.name} className="flex justify-between p-2 bg-slate-100 rounded-md"><span>{t.name}</span><span className="font-bold">{t.hours} hrs</span></li>)}
                    </ul>
                </div>
            </div>
        </Card>
    );
};


const SchedulerView: React.FC = () => {
    const { 
        currentRole, 
        filteredClasses, 
        filteredSubjects, 
        filteredTeachers, 
        getContextData, 
        updateScheduleEvent, 
        filteredScheduleEvents, 
        deleteScheduleEvent, 
        addScheduleEvent 
    } = useAppContext();

    const isEditor = currentRole === UserRole.ClassAdmin;
    const isStudent = currentRole === UserRole.Student;

    const [selectedClassId, setSelectedClassId] = useState(filteredClasses[0]?.id || '');
    const [isAiModalOpen, setAiModalOpen] = useState(false);
    const [dragSourceMode, setDragSourceMode] = useState<'subject' | 'teacher'>('subject');
    const [isSelectionModalOpen, setSelectionModalOpen] = useState(false);
    const [dropTarget, setDropTarget] = useState<{ day: string; time: string } | null>(null);
    const [draggedItem, setDraggedItem] = useState<{ type: 'teacher' | 'subject'; id: string } | null>(null);

    const eventsForSelectedClass = useMemo(() => filteredScheduleEvents.filter(event => event.classId === selectedClassId), [filteredScheduleEvents, selectedClassId]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: 'move' | 'create', data: any) => {
        if (!isEditor) return;
        const payload = type === 'move' ? { type: 'move', eventId: data.id } : { type: 'create', itemType: dragSourceMode, itemId: data.id };
        e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: string, time: string) => {
        if (!isEditor) return;
        e.preventDefault();
        e.currentTarget.classList.remove('bg-indigo-900/50', 'border-indigo-500');
        const payload = JSON.parse(e.dataTransfer.getData('text/plain'));

        if (payload.type === 'move') {
            updateScheduleEvent(payload.eventId, day, time);
        } else if (payload.type === 'create') {
            setDraggedItem({ type: payload.itemType, id: payload.itemId });
            setDropTarget({ day, time });
            setSelectionModalOpen(true);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isEditor) return;
        e.preventDefault();
        e.currentTarget.classList.add('bg-indigo-900/50', 'border-indigo-500');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isEditor) return;
        e.currentTarget.classList.remove('bg-indigo-900/50', 'border-indigo-500');
    };

    const closeModal = useCallback(() => {
        setSelectionModalOpen(false);
        setDraggedItem(null);
        setDropTarget(null);
    }, []);

    const sourceItems = dragSourceMode === 'subject' ? filteredSubjects : filteredTeachers;
    
    const titleText = isStudent ? "My Schedule" : isEditor ? "Class Scheduler" : "Class Schedules";
    const descriptionText = isEditor ? "Manage timetables with drag-and-drop or use the AI assistant." : "View the weekly timetable for the selected class.";


    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{titleText}</h2>
                        <p className="text-slate-600 mt-1">{descriptionText}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="block pl-3 pr-10 py-2 text-base border-slate-200 bg-slate-100 text-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {isEditor && (
                             <button onClick={() => setAiModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                <i className="ri-magic-line mr-2"></i> AI Assistant
                             </button>
                        )}
                    </div>
                </div>
            </Card>

            <div className="flex flex-col lg:flex-row gap-6">
                {isEditor && (
                    <div className="lg:w-1/4">
                        <Card>
                            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-4">
                                <button onClick={() => setDragSourceMode('subject')} className={`w-1/2 py-1.5 text-sm font-semibold rounded-md ${dragSourceMode === 'subject' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Subjects</button>
                                <button onClick={() => setDragSourceMode('teacher')} className={`w-1/2 py-1.5 text-sm font-semibold rounded-md ${dragSourceMode === 'teacher' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Teachers</button>
                            </div>
                            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                                {sourceItems.map(item => (
                                    <div key={item.id} draggable onDragStart={e => handleDragStart(e, 'create', item)} className="p-2 bg-slate-100 rounded-md cursor-grab active:cursor-grabbing">
                                        <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                <div className={isEditor ? "lg:w-3/4" : "w-full"}>
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-[auto,repeat(5,minmax(0,1fr))] gap-px text-center text-sm font-semibold bg-slate-100 border border-slate-200 min-w-[48rem]">
                            <div className="p-2 bg-slate-50 sticky left-0 z-10 text-slate-600">Time</div>
                            {WEEK_DAYS.map(day => <div key={day} className="p-2 bg-slate-50 text-slate-600">{day}</div>)}
                            {TIME_SLOTS.map(time => (
                                <React.Fragment key={time}>
                                    <div className="p-2 bg-slate-50 flex items-center justify-center sticky left-0 z-10 text-slate-600">{time}</div>
                                    {WEEK_DAYS.map(day => (
                                        <div 
                                            key={`${day}-${time}`} 
                                            onDrop={isEditor ? (e) => handleDrop(e, day, time) : undefined} 
                                            onDragOver={isEditor ? handleDragOver : undefined} 
                                            onDragLeave={isEditor ? handleDragLeave : undefined} 
                                            className={`relative bg-slate-50 min-h-[80px] p-1 group transition-colors border-2 border-transparent ${isEditor ? 'hover:border-indigo-500' : ''}`}
                                        >
                                            {eventsForSelectedClass.filter(e => e.day === day && e.startTime === time).map(event => {
                                                const subject = getContextData('subjects', event.subjectId);
                                                const teacher = getContextData('teachers', event.teacherId);
                                                return (
                                                    <div 
                                                        key={event.id} 
                                                        draggable={isEditor} 
                                                        onDragStart={isEditor ? (e) => handleDragStart(e, 'move', event) : undefined} 
                                                        className={`relative p-2 rounded-md shadow text-left border ${isEditor ? 'cursor-grab' : 'cursor-default'} ${getEventColor(event, filteredSubjects)}`}
                                                    >
                                                        <p className="font-bold text-xs flex items-center">{event.eventType === 'Live Class' && <i className="ri-vidicon-fill mr-1 text-base"></i>}{subject?.name || 'Live Class'}</p>
                                                        <p className="text-xs opacity-80">{teacher?.name || 'Unknown Teacher'}</p>
                                                        {isEditor && (
                                                            <button onClick={() => deleteScheduleEvent(event.id)} className="absolute top-0 right-0 p-0.5 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><i className="ri-close-circle-fill"></i></button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <SchedulerSummary events={eventsForSelectedClass} subjects={filteredSubjects} teachers={filteredTeachers} />
            
            {isAiModalOpen && <AiSchedulerModal onClose={() => setAiModalOpen(false)} forClassId={selectedClassId} />}
            {isSelectionModalOpen && draggedItem && dropTarget && <SelectionModal draggedItem={draggedItem} dropTarget={dropTarget} classId={selectedClassId} onClose={closeModal} />}
        </div>
    );
};

export default SchedulerView;
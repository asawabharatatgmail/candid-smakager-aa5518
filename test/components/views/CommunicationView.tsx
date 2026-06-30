﻿import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { Parent, Student, UserRole, Teacher } from '../../types';

const CommunicationView: React.FC = () => {
    const { filteredTeachers, currentUser, addMessage, messages, currentRole, getContextData } = useAppContext();
    const [activeContact, setActiveContact] = useState<Teacher | null>(null);
    const [input, setInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const student = useMemo(() => {
        if (!currentUser) return undefined;
        if (currentRole === UserRole.Parent) return (currentUser as Parent).child;
        if (currentRole === UserRole.Student) return currentUser as Student;
        return undefined;
    }, [currentUser, currentRole]);

    useEffect(() => {
        if (filteredTeachers.length > 0 && !activeContact) {
            setActiveContact(filteredTeachers[0]);
        }
    }, [filteredTeachers, activeContact]);

    const conversationId = student && activeContact ? `${student.id}-${activeContact.id}` : '';
    const conversationMessages = messages.filter(m => m.conversationId === conversationId);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversationMessages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentUser || !activeContact) return;

        addMessage({
            conversationId,
            senderId: currentUser.id,
            text: input,
        });
        setInput('');
    };

    if (!student) {
        return <Card><p>Could not load communication details.</p></Card>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-3xl font-bold text-slate-900">Communication Hub</h2>
                <p className="text-slate-600 mt-1">Connect with your teachers.</p>
            </Card>
            <Card>
                <div className="flex flex-col md:flex-row h-[70vh] md:h-[60vh]">
                    {/* Contact List */}
                    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
                        <div className="p-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800">Contacts</h3>
                        </div>
                        <ul className="divide-y divide-slate-200 overflow-y-auto">
                            {filteredTeachers.map(teacher => {
                                const subjectName = getContextData('subjects', teacher.subjectIds[0])?.name || 'Teacher';
                                return (
                                <li 
                                    key={teacher.id}
                                    onClick={() => setActiveContact(teacher)}
                                    className={`p-3 flex items-center cursor-pointer ${activeContact?.id === teacher.id ? 'bg-indigo-500/20 border-r-4 border-indigo-500' : 'hover:bg-slate-100'}`}
                                >
                                    <img className="h-10 w-10 rounded-full object-cover" src={`https://i.pravatar.cc/150?u=${teacher.id}`} alt="Avatar" />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-slate-900">{teacher.name}</p>
                                        <p className="text-xs text-slate-500">{subjectName}</p>
                                    </div>
                                </li>
                                );
                            })}
                        </ul>
                    </div>
                    {/* Chat Window */}
                    {activeContact ? (
                        <div className="w-full md:w-2/3 flex flex-col">
                            <div className="p-4 border-b border-slate-200 flex items-center">
                                <img className="h-10 w-10 rounded-full object-cover" src={`https://i.pravatar.cc/150?u=${activeContact.id}`} alt="Avatar" />
                                <h3 className="font-semibold ml-3 text-slate-900">{activeContact.name}</h3>
                            </div>
                            <div ref={chatContainerRef} className="flex-grow p-4 bg-slate-50 space-y-4 overflow-y-auto">
                                {/* Messages */}
                                {conversationMessages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-lg max-w-xs text-white ${msg.senderId === currentUser?.id ? 'bg-indigo-600' : 'bg-slate-100 border border-slate-200'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-slate-200 bg-slate-50">
                                <form onSubmit={handleSendMessage} className="relative">
                                    <input 
                                        type="text" 
                                        placeholder={`Message ${activeContact.name}...`}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="w-full pl-4 pr-12 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-100 border-slate-200 text-slate-800" 
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full md:w-2/3 flex items-center justify-center">
                            <p className="text-slate-500">Select a contact to start chatting.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default CommunicationView;
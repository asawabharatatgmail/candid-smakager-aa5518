﻿
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getAiTutorResponse } from '../../services/apiClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StudyMaterialCreator from '../features/StudyMaterialCreator';
import Card from '../ui/Card';

// --- AI Tutor Component ---
// Defined inside this file to avoid creating a new file.

// Icons
const BotIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v-2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2" /><path d="M12 20v-4" /></svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const AiTutor: React.FC = () => {
    const { filteredSubjects, currentSubscription } = useAppContext();
    const [selectedSubject, setSelectedSubject] = useState(filteredSubjects[0]?.id || '');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const subjectName = filteredSubjects.find(s => s.id === selectedSubject)?.name || 'this subject';

    useEffect(() => {
        if (filteredSubjects.length > 0 && !selectedSubject) {
            setSelectedSubject(filteredSubjects[0].id);
        }
    }, [filteredSubjects, selectedSubject]);

    useEffect(() => {
        if (subjectName !== 'this subject') {
            setMessages([{
                sender: 'bot',
                text: `Hello! I'm Veda, your AI Tutor for **${subjectName}**. Ask me anything to get started, like "Explain photosynthesis" or "What are the laws of motion?"`
            }]);
        } else {
             setMessages([{
                sender: 'bot',
                text: `Hello! Please select a subject to begin your tutoring session.`
            }]);
        }
    }, [subjectName]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (query: string) => {
        if (!query.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        if (!currentSubscription.isAiEnabled) {
             setMessages(prev => [...prev, { sender: 'bot', text: "AI features are disabled by the administrator." }]);
             setIsLoading(false);
             return;
        }

        try {
            const stream = await getAiTutorResponse(query, subjectName);
            
            let botResponseText = '';
            setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

            for await (const chunk of stream) {
                botResponseText += chunk.text;
                 setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { sender: 'bot', text: botResponseText };
                    return newMessages;
                });
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };
    
    return (
        <div className="flex flex-col h-[70vh] max-h-[700px]">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 whitespace-nowrap">Chat with your AI Tutor</h2>
                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-800 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:border-indigo-500"
                    disabled={filteredSubjects.length === 0}
                >
                    {filteredSubjects.length > 0 ? filteredSubjects.map(s => (
                        <option key={s.id} value={s.id}>Subject: {s.name}</option>
                    )) : <option>No subjects enrolled</option>}
                </select>
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 rounded-lg">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'bot' && <div className="w-8 h-8 flex-shrink-0 bg-indigo-500/20 text-indigo-700 rounded-full flex items-center justify-center"><BotIcon className="w-5 h-5" /></div>}
                        <div className={`prose prose-sm prose-invert max-w-[80%] p-3 rounded-xl ${msg.sender === 'bot' ? 'bg-slate-100' : 'bg-indigo-600 text-white prose-p:text-white prose-strong:text-white'}`}>
                            {msg.text ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : <div className="typing-indicator"><span></span><span></span><span></span></div>}
                        </div>
                        {msg.sender === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-slate-200 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-slate-600" /></div>}
                    </div>
                ))}
            </div>
            
            {/* Input Form */}
            <div className="pt-4 mt-4 border-t border-slate-200">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={filteredSubjects.length > 0 ? `Ask a question about ${subjectName}...` : `Please enroll in subjects to use the tutor.`}
                        className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-100 text-slate-800"
                        disabled={isLoading || filteredSubjects.length === 0}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim() || filteredSubjects.length === 0}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
            <style>{`
                .prose strong { color: inherit; } 
                .typing-indicator span { background-color: #9ca3af; }
                .bg-indigo-600 .typing-indicator span { background-color: #fff; }
                .typing-indicator { display: flex; align-items: center; justify-content: center; height: 20px; }
                .typing-indicator span { height: 8px; width: 8px; margin: 0 2px; border-radius: 50%; display: inline-block; animation: _typing-indicator 1.4s infinite; }
                .typing-indicator span:nth-child(2) { animation-delay: .2s; }
                .typing-indicator span:nth-child(3) { animation-delay: .4s; }
                @keyframes _typing-indicator { 0% { transform: translateY(0); } 20% { transform: translateY(-4px); } 40%, 100% { transform: translateY(0); } }
            `}</style>
        </div>
    );
};


// --- Main View Component ---

type ActiveTab = 'tutor' | 'generator';

const AiStudyToolView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('tutor');

    const tabClasses = (tabName: ActiveTab) =>
        `px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
            activeTab === tabName
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
        }`;

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">AI Study Tools</h1>
                        <p className="mt-2 text-slate-600">Your personal AI-powered learning companions.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg">
                        <button className={tabClasses('tutor')} onClick={() => setActiveTab('tutor')}>
                            <i className="ri-question-answer-line mr-2"></i>AI Tutor
                        </button>
                        <button className={tabClasses('generator')} onClick={() => setActiveTab('generator')}>
                            <i className="ri-file-edit-line mr-2"></i>Study Guide Generator
                        </button>
                    </div>
                </div>
            </Card>
            <Card>
                {activeTab === 'tutor' && <AiTutor />}
                {activeTab === 'generator' && <StudyMaterialCreator />}
            </Card>
        </div>
    );
};

export default AiStudyToolView;

﻿

import React, { useState, useRef, useEffect } from 'react';
import { getAiHelpResponse } from '../../services/apiClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppContext } from '../../context/AppContext';
import { GenerateContentResponse } from '@google/genai';
import { UserRole } from '../../types';

// Icons
const BotIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v-2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2" /><path d="M12 20v-4" /></svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const chatConfigByRole: Record<UserRole, { welcome: string; suggestions: string[] }> = {
    [UserRole.ProductOwner]: {
        welcome: "Welcome, Product Owner. How can I assist with institute management or system health today?",
        suggestions: ["How do I add a new institute?", "Explain system health.", "How to change a subscription?"]
    },
    [UserRole.ClassAdmin]: {
        welcome: "Hello! I'm your AI assistant. How can I help you manage your institute today?",
        suggestions: ["How do I create a fee structure?", "Explain the AI scheduler.", "How does lead management work?"]
    },
    [UserRole.BranchAdmin]: {
        welcome: "Hello, Branch Admin. What can I help you with regarding your branch operations?",
        suggestions: ["How do I manage students?", "Where can I take attendance?", "What are my responsibilities?"]
    },
    [UserRole.Teacher]: {
        welcome: "Hello! I'm here to help you with content creation and class management. What would you like to know?",
        suggestions: ["How do I create a quiz?", "Explain the content library.", "How do I take attendance?"]
    },
    [UserRole.Student]: {
        welcome: "Hi there! I'm your study buddy. Ask me anything about using the platform to help you learn.",
        suggestions: ["How does the AI Study Tool work?", "Where are my assignments?", "How can I check my progress?"]
    },
    [UserRole.Parent]: {
        welcome: "Hello! I can help you with fee payments, your child's progress, and communication. What can I do for you?",
        suggestions: ["How do I pay fees?", "Where can I see my child's scores?", "How to download a receipt?"]
    },
    [UserRole.ExternalParent]: {
        welcome: "Hello! I can help you track your child's learning, manage subscriptions, and access study tools.",
        suggestions: ["How do I add a child profile?", "Where are AI study tools?", "How do I manage my subscription?"]
    },
    [UserRole.ExternalStudent]: {
        welcome: "Hi! I'm your personal AI tutor. Ask me anything — quizzes, flashcards, study tips.",
        suggestions: ["Generate a quiz for me", "Create flashcards on a topic", "Help me build a study plan"]
    },
};

const AiHelpChatbot: React.FC = () => {
    const { currentSubscription, currentRole } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const roleConfig = chatConfigByRole[currentRole] || chatConfigByRole[UserRole.Student]; // Default fallback
    
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: roleConfig.welcome }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

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
            const stream = await getAiHelpResponse(query, currentRole);
            
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
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 z-40"
                aria-label="Open AI Help Chat"
            >
                <BotIcon className="w-6 h-6" />
            </button>
            
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-md h-[70vh] max-h-[600px] bg-slate-50 text-slate-600 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 border border-slate-200 animate-fade-in animate-scale-in">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200">
                        <div className="flex items-center">
                            <BotIcon className="w-6 h-6 text-indigo-400" />
                            <h3 className="ml-2 font-bold text-lg text-slate-900">AI Help Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-900">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'bot' && <div className="w-8 h-8 flex-shrink-0 bg-indigo-500/20 rounded-full flex items-center justify-center"><BotIcon className="w-5 h-5 text-indigo-400" /></div>}
                                <div className={`prose prose-sm prose-invert max-w-[80%] p-3 rounded-2xl ${msg.sender === 'bot' ? 'bg-slate-100' : 'bg-indigo-600 text-white prose-p:text-white prose-strong:text-white'}`}>
                                    {msg.text ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : <div className="typing-indicator"><span></span><span></span><span></span></div>}
                                </div>
                                {msg.sender === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-slate-200 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-slate-600" /></div>}
                            </div>
                        ))}
                    </div>

                    {/* Suggested Questions */}
                    {messages.length === 1 && !isLoading && (
                        <div className="p-4 border-t border-b border-slate-200 bg-slate-50">
                            <h4 className="text-sm font-semibold text-slate-800 mb-2">Or try asking:</h4>
                            <div className="flex flex-wrap gap-2">
                                {roleConfig.suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(suggestion)}
                                        className="px-3 py-1.5 text-xs bg-slate-100 text-slate-800 rounded-full hover:bg-slate-200 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Form */}
                    <div className="p-4 border-t border-slate-200">
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about functionalities..."
                                className="w-full pl-4 pr-12 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-100 border-slate-200 text-slate-800"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
                            >
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
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
        </>
    );
};

export default AiHelpChatbot;
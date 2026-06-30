﻿import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Lead, LeadStatus } from '../../types';
import ManagementView from './ManagementView';
import LeadAnalyticsSummary from '../features/LeadAnalyticsSummary';
import { PhoneIcon, MailIcon, BellIcon, VideoIcon } from '../../constants';
import UpcomingReminders from '../features/UpcomingReminders';
import EmailTemplateManager from '../features/EmailTemplateManager';
import { generateLeadFormScript } from '../../services/apiClient';


const CreateLeadFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<{ "Code.gs": string; "Index.html": string; } | null>(null);
    const [copySuccess, setCopySuccess] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const code = await generateLeadFormScript(['Name', 'Email', 'Mobile', 'Course Interested In']);
            setGeneratedCode(code);
        } catch (error) {
            console.error(error);
            alert('Failed to generate script. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }

    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-50 rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-scale-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">AI-Powered Lead Form Generator</h2>
                {!generatedCode ? (
                    <div className="text-center">
                        <p className="text-slate-600 mb-6">Generate Google Apps Script code to create a web-based lead capture form. This form will automatically save new leads to a Google Sheet.</p>
                        <button onClick={handleGenerate} disabled={isLoading} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isLoading ? 'Generating Code...' : 'Generate Google Form Script'}
                        </button>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-slate-800">Code.gs (Backend Logic)</h3>
                                <button onClick={() => handleCopy(generatedCode['Code.gs'])} className="px-3 py-1 bg-slate-200 text-slate-800 rounded-md text-xs font-semibold hover:bg-slate-500">{copySuccess || 'Copy'}</button>
                            </div>
                            <pre className="p-3 bg-white/80 text-sm text-slate-600 rounded-md max-h-48 overflow-auto font-mono"><code>{generatedCode['Code.gs']}</code></pre>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-slate-800">Index.html (Form UI)</h3>
                                <button onClick={() => handleCopy(generatedCode['Index.html'])} className="px-3 py-1 bg-slate-200 text-slate-800 rounded-md text-xs font-semibold hover:bg-slate-500">{copySuccess || 'Copy'}</button>
                            </div>
                            <pre className="p-3 bg-white/80 text-sm text-slate-600 rounded-md max-h-48 overflow-auto font-mono"><code>{generatedCode['Index.html']}</code></pre>
                        </div>
                    </div>
                )}
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-500">Close</button>
                </div>
            </div>
        </div>
    );
};


const LeadManagementView: React.FC = () => {
    const { updateRecord, openReminderModal, openEmailModal, openMeetModal } = useAppContext();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    
    const handleCall = (lead: Lead) => {
        if (window.confirm(`Call ${lead.name} at ${lead.mobile}?`)) {
            // In a real app, this would integrate with a calling service.
            console.log(`Calling ${lead.name}...`);
            if (lead.status === LeadStatus.New) {
                updateRecord('leads', lead.id, { status: LeadStatus.Contacted });
            }
        }
    };

    const renderLeadActions = (lead: Lead) => (
        <>
            <button onClick={() => handleCall(lead)} className="text-slate-500 hover:text-green-500" title="Call Lead">
                <PhoneIcon className="w-5 h-5" />
            </button>
            <button onClick={() => openEmailModal(lead)} className="text-slate-500 hover:text-blue-500" title="Email Lead">
                <MailIcon className="w-5 h-5" />
            </button>
            <button onClick={() => openReminderModal(lead)} className="text-slate-500 hover:text-amber-500" title="Set Reminder">
                <BellIcon className="w-5 h-5" />
            </button>
            <button onClick={() => openMeetModal(lead)} className="text-slate-500 hover:text-teal-500" title="Schedule Google Meet">
                <VideoIcon className="w-5 h-5" />
            </button>
        </>
    );

    return (
        <div className="space-y-6">
            <div className='flex items-center justify-end'>
                <button
                    onClick={() => setFormModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-md shadow-sm text-slate-800 bg-slate-100 hover:bg-slate-200"
                >
                    <i className="ri-google-fill mr-2"></i> Create Lead Form
                </button>
            </div>

            <LeadAnalyticsSummary />
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/3">
                     <ManagementView 
                        category="leads" 
                        renderActions={renderLeadActions} 
                    />
                </div>
                <div className="lg:w-1/3 flex flex-col gap-6">
                    <UpcomingReminders />
                    <EmailTemplateManager />
                </div>
            </div>
            {isFormModalOpen && <CreateLeadFormModal onClose={() => setFormModalOpen(false)} />}
        </div>
    );
};

export default LeadManagementView;
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Lead, LeadStatus, EmailTemplate } from '../../types';
import { generateEmailForLead } from '../../services/apiClient';

interface AiEmailModalProps {
  lead: Lead;
  onClose: () => void;
}

const AiEmailModal: React.FC<AiEmailModalProps> = ({ lead, onClose }) => {
  const { updateRecord, emailTemplates, currentSubscription } = useAppContext();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPurpose, setAiPurpose] = useState('An initial introduction email');

  const handleSendEmail = () => {
    if (window.confirm(`Send this email to ${lead.name}?`)) {
      console.log('Email Sent:', { to: lead.email, subject, body });
      if (lead.status === LeadStatus.New) {
        updateRecord('leads', lead.id, { status: LeadStatus.Contacted });
      }
      onClose();
    }
  };
  
  const handleGenerateWithAi = async () => {
    if (!currentSubscription.isAiEnabled) {
        alert("AI features are disabled by the administrator.");
        return;
    }
    setIsGenerating(true);
    try {
      const result = await generateEmailForLead(lead, aiPurpose);
      if (result) {
        setSubject(result.subject);
        setBody(result.body.replace(/\[Lead Name\]/g, lead.name.split(' ')[0]));
      }
    } catch (error) {
      console.error(error);
      alert('Failed to generate email content.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
        setSubject(template.subject);
        setBody(template.body.replace(/\[Lead Name\]/g, lead.name.split(' ')[0]));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-scale-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Compose Email</h2>
        <p className="text-slate-600 mb-4">To: <span className="font-semibold">{lead.name} &lt;{lead.email}&gt;</span></p>

        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-200">
                <h3 className="font-semibold text-slate-800">Quick Actions</h3>
                <div className="flex flex-wrap gap-2 items-center">
                    <select onChange={handleTemplateChange} className="flex-grow mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-100 border-slate-200 text-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="">Select a template...</option>
                        {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                 <div className="flex flex-wrap gap-2 items-center">
                    <input
                        type="text"
                        value={aiPurpose}
                        onChange={e => setAiPurpose(e.target.value)}
                        className="flex-grow mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter purpose for AI..."
                    />
                    <button onClick={handleGenerateWithAi} disabled={isGenerating} className="px-4 py-2 bg-indigo-500/20 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-500/30 disabled:opacity-50 flex items-center">
                       {isGenerating && <i className="ri-loader-4-line animate-spin mr-2"></i>}
                        Generate with AI
                    </button>
                </div>
            </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-600">Subject</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-slate-600">Body</label>
            <textarea
              id="body"
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">
            Cancel
          </button>
          <button onClick={handleSendEmail} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiEmailModal;
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { EmailTemplate, LeadStatus } from '../../types';

interface EmailTemplateModalProps {
  template?: EmailTemplate | null;
  onClose: () => void;
}

const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({ template, onClose }) => {
  const { addEmailTemplate, updateEmailTemplate } = useAppContext();
  
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [statusTarget, setStatusTarget] = useState<LeadStatus | 'General'>('General');

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setBody(template.body);
      setStatusTarget(template.statusTarget);
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTemplateData = { name, subject, body, statusTarget };
    if (template) {
        updateEmailTemplate(template.id, {...template, ...newTemplateData});
    } else {
        addEmailTemplate(newTemplateData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full border border-slate-200 animate-scale-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          {template ? 'Edit' : 'Create'} Email Template
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="templateName" className="block text-sm font-medium text-slate-600">Template Name</label>
            <input type="text" id="templateName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
          </div>
           <div>
            <label htmlFor="statusTarget" className="block text-sm font-medium text-slate-600">Target Lead Status</label>
             <select id="statusTarget" value={statusTarget} onChange={e => setStatusTarget(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-100 border-slate-200 text-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="General">General (All Statuses)</option>
                {Object.values(LeadStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="templateSubject" className="block text-sm font-medium text-slate-600">Subject</label>
            <input type="text" id="templateSubject" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="templateBody" className="block text-sm font-medium text-slate-600">Body</label>
            <textarea id="templateBody" rows={6} value={body} onChange={e => setBody(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            <p className="text-xs text-slate-500 mt-1">Use `[Lead Name]` as a placeholder for the lead's first name.</p>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailTemplateModal;
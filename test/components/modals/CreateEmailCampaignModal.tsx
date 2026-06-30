import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

interface CreateEmailCampaignModalProps {
    onClose: () => void;
}

const CreateEmailCampaignModal: React.FC<CreateEmailCampaignModalProps> = ({ onClose }) => {
    const { addEmailCampaign } = useAppContext();
    const [formData, setFormData] = useState({
        name: 'New Campaign',
        subject: 'Exciting News from Our Institute!',
        audienceSize: 1000,
        body: 'Dear Student,\n\nWe have some exciting news to share with you...',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'audienceSize' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addEmailCampaign(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full border border-slate-200 animate-scale-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">New Email Campaign</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600">Campaign Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-slate-600">Subject Line</label>
                        <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                    </div>
                     <div>
                        <label htmlFor="audienceSize" className="block text-sm font-medium text-slate-600">Audience Size (Mock)</label>
                        <input type="number" name="audienceSize" id="audienceSize" value={formData.audienceSize} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-slate-600">Email Body</label>
                        <textarea name="body" id="body" value={formData.body} onChange={handleChange} required rows={6} className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md"></textarea>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Save as Draft</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmailCampaignModal;
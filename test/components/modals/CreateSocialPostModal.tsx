import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

interface CreateSocialPostModalProps {
    onClose: () => void;
}

const CreateSocialPostModal: React.FC<CreateSocialPostModalProps> = ({ onClose }) => {
    const { addSocialPost } = useAppContext();
    const [formData, setFormData] = useState({
        platform: 'Facebook' as 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter' | 'YouTube' | 'WhatsApp',
        content: '',
        status: 'Scheduled' as 'Scheduled' | 'Posted',
        scheduledDate: new Date().toISOString().slice(0, 16),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addSocialPost(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full border border-slate-200 animate-scale-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Create Social Post</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="platform" className="block text-sm font-medium text-slate-600">Platform</label>
                        <select name="platform" id="platform" value={formData.platform} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md">
                            <option value="Facebook">Facebook</option>
                            <option value="Instagram">Instagram</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Twitter">Twitter / X</option>
                            <option value="YouTube">YouTube</option>
                            <option value="WhatsApp">WhatsApp</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-slate-600">Content</label>
                        <textarea name="content" id="content" value={formData.content} onChange={handleChange} required rows={5} className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md"></textarea>
                    </div>
                     <div>
                        <label htmlFor="scheduledDate" className="block text-sm font-medium text-slate-600">Schedule Date & Time</label>
                        <input type="datetime-local" name="scheduledDate" id="scheduledDate" value={formData.scheduledDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Schedule Post</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSocialPostModal;
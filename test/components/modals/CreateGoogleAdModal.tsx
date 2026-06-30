import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CampaignStatus } from '../../types';

interface CreateGoogleAdModalProps {
    onClose: () => void;
}

const CreateGoogleAdModal: React.FC<CreateGoogleAdModalProps> = ({ onClose }) => {
    const { addGoogleAdCampaign } = useAppContext();
    const [formData, setFormData] = useState({
        name: 'New Student Enrollment Drive',
        status: CampaignStatus.Active,
        budget: 25000,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'budget' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addGoogleAdCampaign(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full border border-slate-200 animate-scale-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">New Google Ads Campaign</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600">Campaign Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-600">Status</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md">
                            {Object.values(CampaignStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-slate-600">Budget (₹)</label>
                        <input type="number" name="budget" id="budget" value={formData.budget} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-600">Start Date</label>
                            <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-600">End Date</label>
                            <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Create Campaign</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGoogleAdModal;
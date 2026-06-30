﻿

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';

const BrandingView: React.FC = () => {
    const { activeInstitute, updateRecord } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        logoUrl: '',
        address: '',
        tagline: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (activeInstitute) {
            setFormData({
                name: activeInstitute.name || '',
                logoUrl: activeInstitute.logoUrl || '',
                address: activeInstitute.address || '',
                tagline: activeInstitute.tagline || '',
            });
        }
    }, [activeInstitute]);
    
    if (!activeInstitute) {
        return (
            <Card>
                <p className="text-center text-slate-500">No active institute selected.</p>
            </Card>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("File is too large. Please select an image under 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    logoUrl: reader.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccess(false);

        // We only pass the fields from this form to updateRecord
        const brandingUpdate = {
            name: formData.name,
            logoUrl: formData.logoUrl,
            address: formData.address,
            tagline: formData.tagline,
        };

        updateRecord('institutes', activeInstitute.id, brandingUpdate);
        
        setTimeout(() => {
            setIsSaving(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-3xl font-bold text-slate-900">Institute Branding</h2>
                <p className="text-slate-600 mt-1">Manage your institute's public appearance across the platform.</p>
            </Card>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600">Institute Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="logoFile" className="block text-sm font-medium text-slate-600">Upload Logo</label>
                        <input
                            type="file"
                            name="logoFile"
                            id="logoFile"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-700 hover:file:bg-indigo-500/20"
                        />
                         <p className="text-xs text-slate-500 mt-1">Recommended: PNG, JPG, or SVG. Max size: 2MB.</p>
                        {formData.logoUrl && <img src={formData.logoUrl} alt="Logo Preview" className="mt-2 h-16 w-auto bg-slate-200 p-2 rounded-md object-contain" />}
                    </div>
                     <div>
                        <label htmlFor="tagline" className="block text-sm font-medium text-slate-600">Tagline / Slogan</label>
                        <input type="text" name="tagline" id="tagline" value={formData.tagline} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-slate-600">Address</label>
                        <textarea name="address" id="address" rows={3} value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>

                    <div className="flex justify-end items-center">
                        {success && <p className="text-sm text-green-600 mr-4">Branding updated successfully!</p>}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default BrandingView;
﻿
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PaymentGatewaySettings, UserRole } from '../../types';
import Card from '../ui/Card';

const initialSettings: PaymentGatewaySettings = {
    isEnabled: false,
    provider: 'PhonePe',
    environment: 'Sandbox',
    merchantId: '',
    saltKey: '',
    saltIndex: '',
};

const PaymentGatewayView: React.FC = () => {
    const { activeInstitute, updateRecord, currentRole } = useAppContext();
    const [formData, setFormData] = useState<PaymentGatewaySettings>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        if (activeInstitute?.paymentGateway) {
            setFormData(activeInstitute.paymentGateway);
        } else {
            setFormData(initialSettings);
        }
    }, [activeInstitute]);

    if (!activeInstitute) {
        if (currentRole === UserRole.ProductOwner) {
            return (
                <Card>
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-slate-900">No Institute Selected</h2>
                        <p className="mt-4 text-slate-500">Please select an institute from the header switcher to configure its payment gateway settings.</p>
                    </div>
                </Card>
            );
        }
        // This case should not be reachable for a ClassAdmin
        return <Card><p className="text-center text-red-600">Error: Could not find active institute. Please contact support.</p></Card>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name: keyof PaymentGatewaySettings) => {
        setFormData(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccess(false);

        updateRecord('institutes', activeInstitute.id, { paymentGateway: formData });

        setTimeout(() => {
            setIsSaving(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-3xl font-bold text-slate-900">Payment Gateway Settings</h2>
                <p className="text-slate-600 mt-1">Configure the <span className="font-semibold text-violet-400">PhonePe</span> payment gateway for online fee collection.</p>
            </Card>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-white/40 border-slate-200">
                        <div>
                            <h3 className="font-semibold text-slate-800">Enable PhonePe Gateway</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Allows parents to pay fees online using this gateway.
                            </p>
                        </div>
                        <button type="button" onClick={() => handleToggle('isEnabled')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${formData.isEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${formData.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Environment Select */}
                    <div>
                        <label htmlFor="environment" className="block text-sm font-medium text-slate-600">Environment</label>
                        <select name="environment" id="environment" value={formData.environment} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="Sandbox">Sandbox (for testing)</option>
                            <option value="Production">Production (for live payments)</option>
                        </select>
                    </div>

                    {/* Merchant ID */}
                    <div>
                        <label htmlFor="merchantId" className="block text-sm font-medium text-slate-600">Merchant ID</label>
                        <input type="text" name="merchantId" id="merchantId" value={formData.merchantId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    
                    {/* Salt Key */}
                    <div>
                        <label htmlFor="saltKey" className="block text-sm font-medium text-slate-600">Salt Key</label>
                        <div className="relative">
                            <input type={showKey ? 'text' : 'password'} name="saltKey" id="saltKey" value={formData.saltKey} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            <button type="button" onClick={() => setShowKey(!showKey)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-800">
                                {showKey ? <i className="ri-eye-off-line"></i> : <i className="ri-eye-line"></i>}
                            </button>
                        </div>
                    </div>

                    {/* Salt Index */}
                    <div>
                        <label htmlFor="saltIndex" className="block text-sm font-medium text-slate-600">Salt Index</label>
                        <input type="text" name="saltIndex" id="saltIndex" value={formData.saltIndex} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end items-center pt-4 border-t border-slate-200">
                        {success && <p className="text-sm text-green-600 mr-4">Settings saved successfully!</p>}
                        <button type="submit" disabled={isSaving} className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default PaymentGatewayView;

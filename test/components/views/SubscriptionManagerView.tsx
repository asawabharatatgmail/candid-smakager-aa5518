﻿import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { SubscriptionPackage, Addon } from '../../types';

const SubscriptionManagerView: React.FC = () => {
    const { activeInstitute, updateRecord, getData } = useAppContext();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const packages = getData('packages') as SubscriptionPackage[];
    const addons = getData('addons') as Addon[];

    const handlePlanChange = (newPackageId: string) => {
        if (!activeInstitute) return;
        setIsLoading(newPackageId);
        setTimeout(() => {
            updateRecord('institutes', activeInstitute.id, { packageId: newPackageId });
            setIsLoading(null);
        }, 1000); // Simulate network request
    };

    const handleAddonToggle = (addonId: string) => {
        if (!activeInstitute) return;
        setIsLoading(addonId);
        const currentAddons = activeInstitute.activeAddonIds || [];
        const isAddonActive = currentAddons.includes(addonId);
        const newAddons = isAddonActive
            ? currentAddons.filter(id => id !== addonId)
            : [...currentAddons, addonId];
        
        setTimeout(() => {
            updateRecord('institutes', activeInstitute.id, { activeAddonIds: newAddons });
            setIsLoading(null);
        }, 1000);
    };

    const currentPackage = activeInstitute ? packages.find(p => p.id === activeInstitute.packageId) : null;

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-3xl font-bold text-slate-900">Subscription Manager</h2>
                <p className="text-slate-600 mt-1">
                    Upgrade, downgrade, or manage add-ons for the selected institute.
                </p>
            </Card>

            {!activeInstitute ? (
                <Card>
                    <div className="text-center p-8">
                        <i className="ri-information-line text-4xl text-indigo-400 mb-4"></i>
                        <h3 className="text-xl font-semibold text-slate-800">Select an Institute</h3>
                        <p className="text-slate-500 mt-2">Please select an institute from the switcher in the header to manage its subscription.</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-8">
                    {/* Current Plan Summary */}
                    <Card>
                        <h3 className="text-xl font-semibold text-slate-800">Current Plan for <span className="text-indigo-400">{activeInstitute.name}</span></h3>
                        <div className="mt-4 p-4 bg-white/50 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{currentPackage?.name || 'No Package Assigned'}</p>
                                <p className="text-slate-500">{currentPackage?.description}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {activeInstitute.activeAddonIds.map(addonId => {
                                        const addon = addons.find(a => a.id === addonId);
                                        return (
                                            <span key={addonId} className="px-2 py-1 text-xs font-semibold bg-teal-500/20 text-teal-300 rounded-full">
                                                {addon?.name || 'Unknown Add-on'}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-slate-500">Monthly Cost</p>
                                <p className="text-3xl font-bold text-slate-900">
                                    ₹{( (currentPackage?.price || 0) + activeInstitute.activeAddonIds.reduce((sum, id) => sum + (addons.find(a => a.id === id)?.price || 0), 0) ).toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500">Expires: {activeInstitute.subscriptionExpiry}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Change Plan Section */}
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-800 mb-4">Change Plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map(pkg => {
                                const isCurrent = pkg.id === activeInstitute.packageId;
                                const isDowngrade = (pkg.price || 0) < (currentPackage?.price || 0);
                                return (
                                    <Card key={pkg.id} className={`flex flex-col border-t-4 ${isCurrent ? 'border-indigo-500 bg-indigo-900/30' : 'border-slate-200'}`}>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="text-xl font-bold text-slate-900">{pkg.name}</h4>
                                                <p className="text-2xl font-bold text-indigo-400">₹{pkg.price.toLocaleString()}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-2 h-10">{pkg.description}</p>
                                            <ul className="mt-4 space-y-2 text-sm">
                                                {pkg.features.map((feature, index) => (
                                                    <li key={index} className="flex items-center"><i className="ri-check-line text-green-600 mr-2"></i><span className="text-slate-600">{feature}</span></li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="mt-6">
                                            {isCurrent ? (
                                                <button disabled className="w-full py-2 bg-indigo-500 text-white rounded-lg font-semibold cursor-default">Current Plan</button>
                                            ) : (
                                                <button
                                                    onClick={() => handlePlanChange(pkg.id)}
                                                    disabled={isLoading === pkg.id}
                                                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${isDowngrade ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'} disabled:bg-slate-500`}
                                                >
                                                    {isLoading === pkg.id ? 'Updating...' : isDowngrade ? 'Downgrade' : 'Upgrade'}
                                                </button>
                                            )}
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                    {/* Manage Add-ons Section */}
                     <div>
                        <h3 className="text-2xl font-semibold text-slate-800 mb-4">Manage Add-ons</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {addons.map(addon => {
                                 const isActive = activeInstitute.activeAddonIds.includes(addon.id);
                                 return (
                                     <Card key={addon.id} className="flex items-center justify-between">
                                         <div>
                                            <h4 className="text-lg font-bold text-slate-900">{addon.name} <span className="text-base font-normal text-teal-400">+ ₹{addon.price.toLocaleString()}/mo</span></h4>
                                            <p className="text-sm text-slate-500">{addon.description}</p>
                                         </div>
                                         <button
                                            type="button"
                                            onClick={() => handleAddonToggle(addon.id)}
                                            disabled={isLoading === addon.id}
                                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                        >
                                            {isLoading === addon.id && <i className="ri-loader-4-line animate-spin text-slate-900 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></i>}
                                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                     </Card>
                                 )
                             })}
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagerView;

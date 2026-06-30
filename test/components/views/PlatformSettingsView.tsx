﻿
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';

const PlatformSettingsView: React.FC = () => {
    const { settings, updateSettings } = useAppContext();

    const handleToggle = (key: keyof typeof settings) => {
        updateSettings({ [key]: !settings[key] });
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-3xl font-bold text-slate-900">Platform Settings</h2>
                <p className="text-slate-600 mt-1">Manage global settings that affect all institutes on the platform.</p>
            </Card>
            <Card>
                <div className="space-y-6 max-w-2xl">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white/40">
                        <div>
                            <h3 className="font-semibold text-slate-800">Globally Enable AI Features</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                This is the master switch. If turned off, all AI functionalities will be disabled for all institutes, regardless of their subscription plan.
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('isAiGloballyEnabled')}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                settings.isAiGloballyEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                            }`}
                        >
                            <span
                                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                    settings.isAiGloballyEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white/40">
                        <div>
                            <h3 className="font-semibold text-slate-800">Activate Maintenance Mode</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                If enabled, all users except the Product Owner will see a maintenance page and will be unable to log in or use the application.
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('isMaintenanceMode')}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                settings.isMaintenanceMode ? 'bg-amber-500' : 'bg-slate-200'
                            }`}
                        >
                            <span
                                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                    settings.isMaintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PlatformSettingsView;

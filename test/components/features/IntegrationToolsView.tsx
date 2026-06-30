﻿import React, { useState } from 'react';
import Card from '../ui/Card';

interface Integration {
    id: string;
    platform: 'Google Ads' | 'Facebook' | 'Instagram' | 'LinkedIn' | 'Mailchimp';
    icon: string;
    description: string;
    isConnected: boolean;
}

const initialIntegrations: Integration[] = [
    {
        id: 'google-ads',
        platform: 'Google Ads',
        icon: 'ri-google-fill',
        description: 'Connect your Google Ads account to track campaign performance and spend.',
        isConnected: true,
    },
    {
        id: 'facebook',
        platform: 'Facebook',
        icon: 'ri-facebook-box-fill',
        description: 'Integrate with Facebook Ads and Pages to manage campaigns and posts.',
        isConnected: false,
    },
    {
        id: 'instagram',
        platform: 'Instagram',
        icon: 'ri-instagram-fill',
        description: 'Connect your Instagram Business account to schedule posts and view analytics.',
        isConnected: false,
    },
    {
        id: 'linkedin',
        platform: 'LinkedIn',
        icon: 'ri-linkedin-box-fill',
        description: 'Manage your LinkedIn Page posts and advertising campaigns directly.',
        isConnected: true,
    },
    {
        id: 'mailchimp',
        platform: 'Mailchimp',
        icon: 'ri-mail-send-fill',
        description: 'Sync your audience lists and manage email campaigns from Mailchimp.',
        isConnected: false,
    },
];

const IntegrationToolsView: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleToggleConnection = (id: string) => {
        setLoadingId(id);
        setTimeout(() => {
            setIntegrations(prev =>
                prev.map(int =>
                    int.id === id ? { ...int, isConnected: !int.isConnected } : int
                )
            );
            setLoadingId(null);
        }, 1500); // Simulate API call
    };

    return (
        <Card>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Connect Your Tools</h3>
            <p className="text-sm text-slate-500 mb-6">Integrate your favorite marketing platforms to streamline your workflow and consolidate your data.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map(integration => {
                    const isLoading = loadingId === integration.id;
                    return (
                        <Card key={integration.id} className="flex flex-col justify-between !p-4">
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <i className={`${integration.icon} text-3xl mr-3 ${integration.isConnected ? 'text-indigo-400' : 'text-slate-500'}`}></i>
                                        <h4 className="font-bold text-slate-800">{integration.platform}</h4>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${integration.isConnected ? 'bg-green-500/20 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {integration.isConnected ? 'Connected' : 'Disconnected'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-3">{integration.description}</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => handleToggleConnection(integration.id)}
                                    disabled={isLoading}
                                    className={`w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                                        integration.isConnected
                                            ? 'bg-red-500/20 text-red-700 hover:bg-red-500/30'
                                            : 'bg-green-500/20 text-green-700 hover:bg-green-500/30'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                                            Processing...
                                        </span>
                                    ) : integration.isConnected ? (
                                        'Disconnect'
                                    ) : (
                                        'Connect'
                                    )}
                                </button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </Card>
    );
};

export default IntegrationToolsView;
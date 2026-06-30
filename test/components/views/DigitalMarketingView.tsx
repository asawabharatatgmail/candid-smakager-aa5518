import React, { useState } from 'react';
import Card from '../ui/Card';
import MarketingDashboard from '../features/MarketingDashboard';
import GoogleAdsManager from '../features/GoogleAdsManager';
import EmailCampaignManager from '../features/EmailCampaignManager';
import SocialMediaManager from '../features/SocialMediaManager';
import IntegrationToolsView from '../features/IntegrationToolsView';

type ActiveTab = 'dashboard' | 'google' | 'email' | 'social' | 'integrations';

const DigitalMarketingView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

    const tabClasses = (tabName: ActiveTab) =>
        `px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
            activeTab === tabName
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
        }`;

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Digital Marketing Suite</h2>
                        <p className="text-slate-600 mt-1">Manage, analyze, and optimize your marketing campaigns.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg">
                        <button className={tabClasses('dashboard')} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                        <button className={tabClasses('google')} onClick={() => setActiveTab('google')}>Google Ads</button>
                        <button className={tabClasses('email')} onClick={() => setActiveTab('email')}>Email Campaigns</button>
                        <button className={tabClasses('social')} onClick={() => setActiveTab('social')}>Social Media</button>
                        <button className={tabClasses('integrations')} onClick={() => setActiveTab('integrations')}>Integrations</button>
                    </div>
                </div>
            </Card>

            <div>
                {activeTab === 'dashboard' && <MarketingDashboard />}
                {activeTab === 'google' && <GoogleAdsManager />}
                {activeTab === 'email' && <EmailCampaignManager />}
                {activeTab === 'social' && <SocialMediaManager />}
                {activeTab === 'integrations' && <IntegrationToolsView />}
            </div>
        </div>
    );
};

export default DigitalMarketingView;
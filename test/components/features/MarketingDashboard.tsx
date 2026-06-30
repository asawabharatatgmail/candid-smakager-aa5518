﻿import React from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode; }> = ({ title, value, change, icon }) => (
    <Card>
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 uppercase">{title}</p>
            <div className="text-indigo-400">{icon}</div>
        </div>
        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        <p className="text-sm text-green-600 mt-1">{change}</p>
    </Card>
);

const MarketingDashboard: React.FC = () => {
    const { googleAdCampaigns, emailCampaigns, socialPosts } = useAppContext();

    const totalAdSpend = googleAdCampaigns.reduce((sum, camp) => sum + camp.budget, 0);
    const avgOpenRate = emailCampaigns.length > 0
        ? (emailCampaigns.reduce((sum, camp) => sum + camp.openRate, 0) / emailCampaigns.length).toFixed(1)
        : '0';
    const totalEngagement = socialPosts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Ad Spend" 
                    value={`₹${(totalAdSpend / 1000).toFixed(1)}k`} 
                    change="+5.2% vs last month" 
                    icon={<i className="ri-google-fill text-2xl"></i>} 
                />
                <StatCard 
                    title="Avg. Email Open Rate" 
                    value={`${avgOpenRate}%`} 
                    change="+1.8% vs last campaign" 
                    icon={<i className="ri-mail-open-fill text-2xl"></i>} 
                />
                <StatCard 
                    title="Social Engagement" 
                    value={totalEngagement.toLocaleString()} 
                    change="+12% this week" 
                    icon={<i className="ri-thumb-up-fill text-2xl"></i>}
                />
                 <StatCard 
                    title="New Leads (Marketing)" 
                    value="128" 
                    change="+8 from social media" 
                    icon={<i className="ri-user-add-fill text-2xl"></i>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Campaign Performance (Mock)</h3>
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                        <p className="text-slate-500">Chart Placeholder</p>
                    </div>
                </Card>
                 <Card>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Channel Breakdown (Mock)</h3>
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                         <p className="text-slate-500">Pie Chart Placeholder</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MarketingDashboard;

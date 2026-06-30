﻿import React, { useState } from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { EmailCampaign, CampaignStatus } from '../../types';
import CreateEmailCampaignModal from '../modals/CreateEmailCampaignModal';

const EmailCampaignManager: React.FC = () => {
    const { emailCampaigns } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);

    const getStatusBadge = (status: CampaignStatus) => {
        const colors = {
            [CampaignStatus.Active]: 'bg-green-500/20 text-green-700',
            [CampaignStatus.Paused]: 'bg-yellow-500/20 text-amber-700',
            [CampaignStatus.Completed]: 'bg-slate-200 text-slate-600',
            [CampaignStatus.Draft]: 'bg-blue-500/20 text-blue-700',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>{status}</span>;
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Email Campaigns</h3>
                    <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
                        + New Campaign
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Campaign</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Audience</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Open Rate</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Click Rate</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-slate-200">
                            {emailCampaigns.map((campaign: EmailCampaign) => (
                                <tr key={campaign.id} className="hover:bg-slate-100">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{campaign.name}</td>
                                    <td className="px-6 py-4 text-sm">{getStatusBadge(campaign.status)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 text-right">{campaign.audienceSize.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 text-right">{campaign.openRate.toFixed(1)}%</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 text-right">{campaign.clickRate.toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {isModalOpen && <CreateEmailCampaignModal onClose={() => setModalOpen(false)} />}
        </>
    );
};

export default EmailCampaignManager;

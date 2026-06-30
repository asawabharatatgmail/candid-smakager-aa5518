
import React from 'react';
import Card from '../ui/Card';
import IntegrationToolsView from '../features/IntegrationToolsView';

const IntegrationsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <Card>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Marketing Integrations</h2>
                    <p className="text-slate-600 mt-1">Connect your marketing platforms to streamline workflows and consolidate data.</p>
                </div>
            </Card>
            <IntegrationToolsView />
        </div>
    );
};

export default IntegrationsView;

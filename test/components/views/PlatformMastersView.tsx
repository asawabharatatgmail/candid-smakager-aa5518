import React, { useState } from 'react';
import Card from '../ui/Card';
import ManagementView from './ManagementView';
import BoardsMasterView from './BoardsMasterView';

type ActiveTab = 'boards' | 'subjects' | 'discounts' | 'feeStructures';

const PlatformMastersView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('boards');

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
                        <h2 className="text-3xl font-bold text-slate-900">Platform Master Data</h2>
                        <p className="text-slate-600 mt-1">Manage global master data templates. These are visible to all institutes.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg">
                        <button className={tabClasses('boards')} onClick={() => setActiveTab('boards')}>
                            🏫 Boards &amp; Subjects
                        </button>
                        <button className={tabClasses('subjects')} onClick={() => setActiveTab('subjects')}>
                            Subjects
                        </button>
                        <button className={tabClasses('discounts')} onClick={() => setActiveTab('discounts')}>
                            Discounts
                        </button>
                        <button className={tabClasses('feeStructures')} onClick={() => setActiveTab('feeStructures')}>
                            Fee Structures
                        </button>
                    </div>
                </div>
            </Card>

            <div>
                {activeTab === 'boards' && <BoardsMasterView />}
                {activeTab === 'subjects' && <ManagementView category="subjects" />}
                {activeTab === 'discounts' && <ManagementView category="discounts" />}
                {activeTab === 'feeStructures' && <ManagementView category="feeStructures" />}
            </div>
        </div>
    );
};

export default PlatformMastersView;

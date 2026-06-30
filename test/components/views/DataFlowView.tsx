import React, { useState } from 'react';
import Card from '../ui/Card';
import { CLASS_ADMIN_HELP_CONTEXT } from '../../data/helpContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DataFlowDiagram from '../features/DataFlowDiagram';

type ActiveTab = 'diagram' | 'document';

const DataFlowView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('diagram');

    const tabClasses = (tabName: ActiveTab) =>
        `px-4 py-2 font-medium text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
            activeTab === tabName
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
        }`;

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Data Flow & Help</h2>
                        <p className="text-slate-600 mt-1">Visualize data relationships or read the detailed functionality guide.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg">
                        <button className={tabClasses('diagram')} onClick={() => setActiveTab('diagram')}>
                            Visual Diagram
                        </button>
                        <button className={tabClasses('document')} onClick={() => setActiveTab('document')}>
                            Functionality Document
                        </button>
                    </div>
                </div>
            </Card>

            <Card>
                {activeTab === 'diagram' && <DataFlowDiagram />}
                {activeTab === 'document' && (
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {CLASS_ADMIN_HELP_CONTEXT}
                        </ReactMarkdown>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DataFlowView;
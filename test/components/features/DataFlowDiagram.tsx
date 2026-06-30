﻿import React from 'react';

const Node = ({ title, description, icon, color = 'indigo' }: { title: string; description: string; icon: React.ReactNode; color?: string; }) => {
    const colorClasses = {
        indigo: { bg: 'bg-indigo-900/50', text: 'text-indigo-700', border: 'border-indigo-700' },
        green: { bg: 'bg-green-900/50', text: 'text-green-700', border: 'border-green-700' },
        blue: { bg: 'bg-blue-900/50', text: 'text-blue-700', border: 'border-blue-700' },
        yellow: { bg: 'bg-yellow-900/50', text: 'text-amber-700', border: 'border-yellow-700' },
        pink: { bg: 'bg-pink-900/50', text: 'text-pink-300', border: 'border-pink-700' },
    };
    const c = colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo;
    return (
        <div className={`w-48 p-3 rounded-lg shadow-md border ${c.bg} ${c.border}`}>
            <div className="flex items-center">
                <div className={`p-1.5 rounded-full ${c.text} mr-2`}>
                    {icon}
                </div>
                <h4 className={`font-bold text-sm ${c.text}`}>{title}</h4>
            </div>
            <p className="text-xs text-slate-500 mt-2">{description}</p>
        </div>
    );
}

const ArrowIcon = () => (
    <div className="my-2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
    </div>
);

const DataFlowDiagram: React.FC = () => {
    return (
        <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
            <div className="flex flex-col items-center">

                {/* Top Level: Institute */}
                <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg w-56 text-center">
                    <h3 className="text-xl font-bold">Institute</h3>
                    <p className="text-xs text-indigo-200">Central Hub</p>
                </div>
                
                <div className="w-px h-8 bg-gray-600 my-2"></div>

                {/* Mid Level - Main Management Areas */}
                <div className="flex flex-wrap justify-center gap-8">
                    
                    {/* Column 1: Leads & Finance */}
                    <div className="flex flex-col items-center space-y-4">
                        <Node title="Leads Mgt." description="Track prospective students from first contact to enrollment." color="green" icon={<i className="ri-user-search-line"></i>} />
                        <ArrowIcon />
                        <Node title="Finance" description="Manage fee structures, discounts, and payment plans." color="yellow" icon={<i className="ri-money-dollar-circle-line"></i>} />
                    </div>

                    {/* Column 2: Core Academic Flow */}
                    <div className="flex flex-col items-center space-y-4 pt-16">
                        <Node title="Users" description="Onboard Teachers & Admins with specific roles." icon={<i className="ri-user-settings-line"></i>} />
                        <ArrowIcon />
                        <Node title="Branches" description="Manage different campus locations." icon={<i className="ri-building-line"></i>} />
                        <ArrowIcon />
                        <Node title="Classes & Subjects" description="Define the academic structure and curriculum." icon={<i className="ri-book-3-line"></i>} />
                    </div>

                    {/* Column 3: Content & Branding */}
                    <div className="flex flex-col items-center space-y-4">
                         <Node title="Content Library" description="Central repository for all learning materials." color="blue" icon={<i className="ri-archive-line"></i>} />
                         <ArrowIcon />
                         <Node title="Branding & Settings" description="Customize appearance and core platform features." color="pink" icon={<i className="ri-palette-line"></i>} />
                    </div>

                </div>
                
                <div className="w-full flex justify-center items-center my-4">
                   <div className="flex-grow h-px bg-gray-600"></div>
                   <div className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataFlowDiagram;
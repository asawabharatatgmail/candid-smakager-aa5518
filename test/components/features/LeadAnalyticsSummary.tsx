﻿


import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateLeadSummary } from '../../services/apiClient';
import Card from '../ui/Card';
import { LeadStatus } from '../../types';

interface LeadAnalysisData {
    overallSummary: string;
    statusBreakdown: { status: LeadStatus; count: number; percentage: number }[];
    conversionRate: number;
    topPerformingSource: { source: string; qualifiedLeads: number; comment: string };
    actionableSuggestions: string[];
    keyHighlight: string;
}

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.93 2.65c.3-.58.97-.58 1.27 0l1.92 3.7 4.08.6a.75.75 0 0 1 .42 1.28l-2.95 2.88.7 4.06a.75.75 0 0 1-1.09.79l-3.65-1.92-3.65 1.92a.75.75 0 0 1-1.09-.79l.7-4.06-2.95-2.88a.75.75 0 0 1 .42-1.28l4.08-.6 1.92-3.7Z"/><path d="M16.5 15.54c.3-.58.97-.58 1.27 0l.96 1.85 2.04.3a.75.75 0 0 1 .42 1.28l-1.48 1.44.35 2.03a.75.75 0 0 1-1.09.79L18 22.28l-1.82.96a.75.75 0 0 1-1.09-.79l.35-2.03-1.48-1.44a.75.75 0 0 1 .42-1.28l2.04-.3.96-1.85Z"/></svg>);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>);

const statusColors: { [key in LeadStatus]: { bg: string, text: string, progress: string } } = {
    [LeadStatus.New]: { bg: 'bg-blue-900/40', text: 'text-blue-700', progress: 'bg-blue-500' },
    [LeadStatus.Contacted]: { bg: 'bg-yellow-900/40', text: 'text-amber-700', progress: 'bg-yellow-500' },
    [LeadStatus.Qualified]: { bg: 'bg-green-900/40', text: 'text-green-700', progress: 'bg-green-500' },
    [LeadStatus.Lost]: { bg: 'bg-red-900/40', text: 'text-red-700', progress: 'bg-red-500' },
};

const LeadAnalyticsSummary: React.FC = () => {
  const { leads, currentSubscription } = useAppContext();
  const [summary, setSummary] = useState<LeadAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSummary = async () => {
      setIsLoading(true);
      setError(null);
      if (!currentSubscription.isAiEnabled) {
        setError("AI-powered analysis is disabled based on the current subscription.");
        setIsLoading(false);
        return;
      }
      if (leads.length === 0) {
        setError("No leads available for analysis.");
        setIsLoading(false);
        return;
      }
      try {
        const result = await generateLeadSummary(leads);
        setSummary(result);
      } catch (error: any) {
        console.error(error);
        setError(error.message || 'Failed to generate lead analysis.');
      } finally {
        setIsLoading(false);
      }
    };
    getSummary();
  }, [leads, currentSubscription.isAiEnabled]);

  const renderLoading = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 bg-slate-100 rounded w-3/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-100 rounded-lg"></div>
          <div className="h-24 bg-slate-100 rounded-lg"></div>
          <div className="h-24 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="h-24 bg-slate-100 rounded-lg"></div>
      <div className="h-24 bg-slate-100 rounded-lg"></div>
    </div>
  );
  
  const renderError = () => (
    <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
    </div>
  );
  
  const renderContent = () => (
    summary && (
        <div className="space-y-6">
            <p className="text-lg text-slate-600">{summary.overallSummary}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">Conversion Rate</h4>
                    <p className="text-4xl font-bold text-indigo-400 mt-1">{summary.conversionRate.toFixed(1)}%</p>
                </div>
                 <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">Top Source</h4>
                    <p className="text-2xl font-bold text-amber-400 mt-2">{summary.topPerformingSource.source}</p>
                    <p className="text-xs text-amber-400/80">{summary.topPerformingSource.comment}</p>
                </div>
                 <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                    <div className="flex items-center justify-center text-teal-300">
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Key Highlight</h4>
                    </div>
                    <p className="text-sm text-teal-400 mt-2">{summary.keyHighlight}</p>
                </div>
            </div>

            <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Status Breakdown</h4>
                <div className="space-y-3">
                    {summary.statusBreakdown.map(item => (
                        <div key={item.status}>
                            <div className="flex justify-between mb-1">
                                <span className={`font-semibold ${statusColors[item.status]?.text || 'text-slate-800'}`}>{item.status} ({item.count})</span>
                                <span className={`text-sm font-medium ${statusColors[item.status]?.text || 'text-slate-800'}`}>{item.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className={`${statusColors[item.status]?.progress || 'bg-slate-500'} h-2.5 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Actionable Suggestions</h4>
                <ul className="space-y-2">
                    {summary.actionableSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-600">{suggestion}</span>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    )
  );

  return (
    <Card>
      <div className="flex items-center mb-4">
        <TrendingUpIcon className="w-8 h-8 text-indigo-400 mr-3"/>
        <h2 className="text-2xl font-bold text-slate-900">AI-Powered Lead Analysis</h2>
      </div>
      {isLoading ? renderLoading() : error ? renderError() : renderContent()}
    </Card>
  );
};

export default LeadAnalyticsSummary;
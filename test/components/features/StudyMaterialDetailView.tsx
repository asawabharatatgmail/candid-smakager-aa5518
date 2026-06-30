﻿
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const StudyMaterialDetailView: React.FC = () => {
    const { activeStudyMaterial, clearStudyView } = useAppContext();

    if (!activeStudyMaterial) {
        return (
            <Card>
                <p className="text-center">No study material selected. Please go back.</p>
            </Card>
        );
    }
    
    return (
        <div className="space-y-6">
             <Card>
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{activeStudyMaterial.title}</h2>
                        <p className="text-slate-500 mt-1">Topic: {activeStudyMaterial.topic}</p>
                    </div>
                    <button onClick={clearStudyView} className="text-sm text-indigo-400 hover:underline">
                        &larr; Back
                    </button>
                </div>
            </Card>
            <Card>
                 <div className="prose prose-invert max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeStudyMaterial.content}</ReactMarkdown>
                </div>
            </Card>
        </div>
    )
};

export default StudyMaterialDetailView;

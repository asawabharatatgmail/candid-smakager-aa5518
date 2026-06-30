

import React, { useState } from 'react';
import Card from '../ui/Card';
import McqCreator from '../features/McqCreator';
import FlashcardCreator from '../features/FlashcardCreator';
import StudyMaterialCreator from '../features/StudyMaterialCreator';
import DocumentUploader from '../features/DocumentUploader';
import VideoManager from '../features/VideoManager';

type ActiveTab = 'quiz' | 'flashcards' | 'material' | 'document' | 'video';

const LmsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('quiz');

    const tabClasses = (tabName: ActiveTab) => 
        `px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
            activeTab === tabName 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'text-slate-600 hover:bg-slate-100'
        }`;

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold text-slate-900">Content Creator</h1>
                    <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg">
                        <button className={tabClasses('quiz')} onClick={() => setActiveTab('quiz')}>
                            Quiz
                        </button>
                        <button className={tabClasses('flashcards')} onClick={() => setActiveTab('flashcards')}>
                            Flashcards
                        </button>
                         <button className={tabClasses('material')} onClick={() => setActiveTab('material')}>
                            Study Guide
                        </button>
                        <button className={tabClasses('document')} onClick={() => setActiveTab('document')}>
                            Upload Document
                        </button>
                        <button className={tabClasses('video')} onClick={() => setActiveTab('video')}>
                            Add Video
                        </button>
                    </div>
                </div>
            </Card>

            <Card>
                {activeTab === 'quiz' && <McqCreator />}
                {activeTab === 'flashcards' && <FlashcardCreator />}
                {activeTab === 'material' && <StudyMaterialCreator />}
                {activeTab === 'document' && <DocumentUploader />}
                {activeTab === 'video' && <VideoManager />}
            </Card>
        </div>
    );
};

export default LmsView;
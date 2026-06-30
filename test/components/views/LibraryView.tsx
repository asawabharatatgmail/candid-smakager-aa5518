﻿

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { Quiz, StudyMaterial, FlashcardSet, Video, UploadedDocument, Teacher, Student, User } from '../../types';

// Icons for different content types
const QuizIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const StudyGuideIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const DocumentIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>;

const typeConfig = {
    Quiz: { icon: QuizIcon, color: 'text-purple-400', bg: 'bg-purple-500/20', hover: 'hover:bg-purple-500/30' },
    StudyMaterial: { icon: StudyGuideIcon, color: 'text-blue-600', bg: 'bg-blue-500/20', hover: 'hover:bg-blue-500/30' },
    Video: { icon: VideoIcon, color: 'text-red-600', bg: 'bg-red-500/20', hover: 'hover:bg-red-500/30' },
    UploadedDocument: { icon: DocumentIcon, color: 'text-green-600', bg: 'bg-green-500/20', hover: 'hover:bg-green-500/30' },
    FlashcardSet: { icon: StudyGuideIcon, color: 'text-amber-600', bg: 'bg-yellow-500/20', hover: 'hover:bg-yellow-500/30' },
}

const LibraryView: React.FC = () => {
    const {
        filteredQuizzes, filteredStudyMaterials, filteredFlashcardSets, filteredVideos, filteredUploadedDocuments,
        filteredClasses, filteredSubjects, filteredTeachers, filteredStudents, users,
        startQuiz, studyFlashcardSet, viewStudyMaterial, openAiVideoFinder, playVideo
    } = useAppContext();

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        classId: 'all',
        subjectId: 'all',
        ownerId: 'all',
    });

    const combinedLibraryItems = useMemo(() => {
        const allUsers: (Teacher | Student | User)[] = [...filteredTeachers, ...filteredStudents, ...users];

        const allItems = [
            ...filteredQuizzes.map(item => ({ ...item, type: 'Quiz' as const, title: item.quizTitle })),
            ...filteredStudyMaterials.map(item => ({ ...item, type: 'StudyMaterial' as const })),
            ...filteredFlashcardSets.map(item => ({ ...item, type: 'FlashcardSet' as const })),
            ...filteredVideos.map(item => ({ ...item, type: 'Video' as const })),
            ...filteredUploadedDocuments.map(item => ({ ...item, type: 'UploadedDocument' as const })),
        ];

        return allItems.map(item => {
            const owner = allUsers.find(u => u.id === item.ownerId);
            const itemClass = filteredClasses.find(c => c.id === item.classId);
            const itemSubject = filteredSubjects.find(s => s.id === item.subjectId);

            return {
                ...item,
                ownerName: owner?.name || 'Unknown',
                className: itemClass?.name || 'N/A',
                subjectName: itemSubject?.name || 'N/A',
            };
        });
    }, [filteredQuizzes, filteredStudyMaterials, filteredFlashcardSets, filteredVideos, filteredUploadedDocuments, filteredClasses, filteredSubjects, filteredTeachers, filteredStudents, users]);

    const owners = useMemo(() => {
        const ownerIds = new Set(combinedLibraryItems.map(item => item.ownerId));
        return [...filteredTeachers, ...filteredStudents, ...users].filter(u => ownerIds.has(u.id));
    }, [combinedLibraryItems, filteredTeachers, filteredStudents, users]);


    const filteredItems = useMemo(() => {
        return combinedLibraryItems.filter(item => {
            const searchMatch = searchQuery.trim() === '' ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.topic.toLowerCase().includes(searchQuery.toLowerCase());

            const typeMatch = filters.type === 'all' || item.type === filters.type;
            const classMatch = filters.classId === 'all' || item.classId === filters.classId;
            const subjectMatch = filters.subjectId === 'all' || item.subjectId === filters.subjectId;
            const ownerMatch = filters.ownerId === 'all' || item.ownerId === filters.ownerId;

            return searchMatch && typeMatch && classMatch && subjectMatch && ownerMatch;
        });
    }, [combinedLibraryItems, searchQuery, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAction = (item: any) => {
        switch (item.type) {
            case 'Quiz':
                startQuiz(item as Quiz);
                break;
            case 'StudyMaterial':
                viewStudyMaterial(item as StudyMaterial);
                break;
            case 'FlashcardSet':
                studyFlashcardSet(item as FlashcardSet);
                break;
            case 'Video':
                playVideo(item as Video);
                break;
            case 'UploadedDocument':
                window.open(item.fileUrl, '_blank');
                break;
        }
    };


    return (
        <div className="space-y-6">
            <Card>
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Content Library</h2>
                        <p className="text-slate-600 mt-1">Search and filter all educational content across the platform.</p>
                    </div>
                    <button
                        onClick={openAiVideoFinder}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center justify-center"
                    >
                        <i className="ri-vidicon-line mr-2"></i>
                        AI Video Finder
                    </button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <input
                            type="search"
                            placeholder="Search by title or topic..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    {/* Filters */}
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="all">All Types</option>
                        <option value="Quiz">Quiz</option>
                        <option value="StudyMaterial">Study Guide</option>
                        <option value="FlashcardSet">Flashcards</option>
                        <option value="Video">Video</option>
                        <option value="UploadedDocument">Document</option>
                    </select>
                    <select name="classId" value={filters.classId} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="all">All Classes</option>
                        {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="subjectId" value={filters.subjectId} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="all">All Subjects</option>
                        {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {/* Owner filter can be added here if needed */}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => {
                    const config = typeConfig[item.type as keyof typeof typeConfig];
                    const Icon = config.icon;
                    return (
                        <Card key={item.id} className="flex flex-col">
                            <div className="flex-grow">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${config.bg}`}>
                                        <Icon className={`w-6 h-6 ${config.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 leading-tight">{item.title}</h3>
                                        <p className="text-xs text-slate-500">by {item.ownerName}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{item.className}</span>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{item.subjectName}</span>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{item.topic}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200/80">
                                <button onClick={() => handleAction(item)} className={`w-full text-center px-3 py-1.5 text-sm font-semibold rounded-md ${config.bg} ${config.color} ${config.hover} transition-opacity`}>
                                    {item.type === 'Quiz' ? 'Start Quiz' : item.type === 'Video' ? 'Play Video' : 'View Content'}
                                </button>
                            </div>
                        </Card>
                    )
                })}
            </div>
            {filteredItems.length === 0 && (
                 <Card>
                    <p className="text-center text-slate-500 py-8">No library items match your criteria.</p>
                </Card>
            )}
        </div>
    );
};

export default LibraryView;
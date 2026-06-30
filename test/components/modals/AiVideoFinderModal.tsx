import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { findEducationalVideos } from '../../services/apiClient';

interface FoundVideo {
    title: string;
    url: string;
}

interface AiVideoFinderModalProps {
  onClose: () => void;
}

const AiVideoFinderModal: React.FC<AiVideoFinderModalProps> = ({ onClose }) => {
    const { filteredClasses, filteredSubjects, addVideo, currentSubscription } = useAppContext();
    const [selectedClassId, setSelectedClassId] = useState(filteredClasses[0]?.id || '');
    const [selectedSubjectId, setSelectedSubjectId] = useState(filteredSubjects[0]?.id || '');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [foundVideos, setFoundVideos] = useState<FoundVideo[]>([]);
    const [selectedVideos, setSelectedVideos] = useState<FoundVideo[]>([]);

    const handleFindVideos = async () => {
        if (!selectedClassId || !selectedSubjectId) {
            setError('Please select a class and a subject.');
            return;
        }

        if (!currentSubscription.isAiEnabled) {
            setError("AI features are disabled. Please contact the administrator.");
            return;
        }

        setIsLoading(true);
        setError('');
        setFoundVideos([]);
        setSelectedVideos([]);

        try {
            const subject = filteredSubjects.find(s => s.id === selectedSubjectId);
            const classInfo = filteredClasses.find(c => c.id === selectedClassId);
            const videos = await findEducationalVideos(subject!.name, classInfo!.name);
            if (videos) {
                setFoundVideos(videos);
            } else {
                setError('No videos found for this topic.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleToggleVideoSelection = (video: FoundVideo) => {
        setSelectedVideos(prev => 
            prev.some(v => v.url === video.url)
                ? prev.filter(v => v.url !== video.url)
                : [...prev, video]
        );
    };

    const handleAddVideos = () => {
        const subject = filteredSubjects.find(s => s.id === selectedSubjectId);
        selectedVideos.forEach(video => {
            addVideo({
                title: video.title,
                url: video.url,
                topic: subject?.name || 'General',
            });
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-scale-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">AI Video Finder</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md">
                        {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md">
                         {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button onClick={handleFindVideos} disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isLoading ? 'Searching...' : 'Find Videos'}
                    </button>
                </div>

                {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
                
                <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                    {isLoading && (
                         <div className="text-center py-10 text-slate-500">
                            <i className="ri-loader-4-line animate-spin text-4xl text-indigo-500"></i>
                            <p className="mt-2">AI is searching for videos...</p>
                        </div>
                    )}
                    {foundVideos.length > 0 ? foundVideos.map(video => (
                        <div key={video.url} className="flex items-center p-3 bg-slate-100 rounded-lg">
                            <input
                                type="checkbox"
                                checked={selectedVideos.some(v => v.url === video.url)}
                                onChange={() => handleToggleVideoSelection(video)}
                                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 bg-white mr-4"
                            />
                            <div>
                                <p className="font-semibold text-slate-800">{video.title}</p>
                                <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">{video.url}</a>
                            </div>
                        </div>
                    )) : !isLoading && (
                        <div className="text-center py-10 text-slate-500">
                            <p>No videos found. Try a different subject or class.</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">Cancel</button>
                    <button onClick={handleAddVideos} disabled={selectedVideos.length === 0 || isLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed">
                        Add {selectedVideos.length > 0 ? `${selectedVideos.length} ` : ''}Selected to Library
                    </button>
                </div>
            </div>
        </div>
    );
};
export default AiVideoFinderModal;
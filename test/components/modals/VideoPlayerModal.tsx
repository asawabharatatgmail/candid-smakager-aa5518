import React from 'react';
import { Video } from '../../types';

interface VideoPlayerModalProps {
  video: Video;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
    const getYouTubeEmbedUrl = (url: string) => {
        let videoId = '';
        try {
            if (url.includes('youtu.be/')) {
                videoId = new URL(url).pathname.substring(1);
            } else if (url.includes('watch?v=')) {
                videoId = new URL(url).searchParams.get('v') || '';
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
        } catch (error) {
            console.error("Invalid URL for YouTube embed:", url);
            return null;
        }
    };

    const embedUrl = getYouTubeEmbedUrl(video.url);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 truncate">{video.title}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-grow p-2 sm:p-4 bg-black">
                    {embedUrl ? (
                        <div className="aspect-w-16 aspect-h-9">
                             <iframe
                                src={embedUrl}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full rounded-b-lg"
                                style={{ height: 'calc(90vh - 120px)'}}
                            ></iframe>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-red-600">Could not load video. Invalid YouTube URL.</p>
                        </div>
                    )}
                </div>
            </div>
             <style>{`
                .aspect-w-16 { position: relative; padding-bottom: 56.25%; }
                .aspect-h-9 { height: 0; }
                .aspect-w-16 > iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
            `}</style>
        </div>
    );
};

export default VideoPlayerModal;
﻿

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';

const VideoManager: React.FC = () => {
    const { addVideo } = useAppContext();
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [url, setUrl] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !topic || !url) {
            alert('Please fill all fields.');
            return;
        }

        addVideo({
            title,
            topic,
            url,
        });

        setSuccessMessage(`Video "${title}" has been added to the library.`);
        setTitle('');
        setTopic('');
        setUrl('');
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Add Video Content</h2>
            <p className="mt-2 text-slate-600">Add video resources from platforms like YouTube or Vimeo to the library.</p>
            
            {successMessage && (
                <Card className="bg-green-900/20 border-green-500/30">
                    <p className="text-green-700 font-medium">{successMessage}</p>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="vid-title" className="block text-sm font-medium text-slate-600">Video Title</label>
                        <input type="text" id="vid-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="vid-topic" className="block text-sm font-medium text-slate-600">Topic</label>
                        <input type="text" id="vid-topic" value={topic} onChange={(e) => setTopic(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="vid-url" className="block text-sm font-medium text-slate-600">Video URL</label>
                        <input type="url" id="vid-url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://www.youtube.com/watch?v=..." className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Add to Library
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VideoManager;
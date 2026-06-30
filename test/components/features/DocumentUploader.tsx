﻿import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';


const MOCK_DRIVE_FILES = [
    { name: 'Chapter 1 - Biology Notes.gdoc', icon: 'ri-file-word-2-line' },
    { name: 'History Presentation Q1.gslides', icon: 'ri-slideshow-3-line' },
    { name: 'Math Worksheet - Algebra.gsheet', icon: 'ri-file-excel-2-line' },
    { name: 'Annual Report.pdf', icon: 'ri-file-pdf-line' },
];


const GoogleDrivePickerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addUploadedDocument } = useAppContext();
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const handleImport = () => {
        if (!selectedFile) return;
        const file = MOCK_DRIVE_FILES.find(f => f.name === selectedFile);
        if (file) {
            addUploadedDocument({
                title: file.name.split('.')[0],
                fileName: file.name,
                fileUrl: `https://docs.google.com/mock/${file.name.replace(/\s/g, '')}`,
                fileType: 'link',
                topic: 'Imported from Drive',
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-50 rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-scale-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Import from Google Drive (Simulation)</h2>
                <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                    {MOCK_DRIVE_FILES.map(file => (
                        <div
                            key={file.name}
                            onClick={() => setSelectedFile(file.name)}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedFile === file.name ? 'bg-indigo-500/30 ring-2 ring-indigo-500' : 'bg-slate-100 hover:bg-slate-100'}`}
                        >
                            <i className={`${file.icon} text-2xl text-slate-600 mr-3`}></i>
                            <span className="font-medium text-slate-800">{file.name}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-500">Cancel</button>
                    <button onClick={handleImport} disabled={!selectedFile} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400">Import Selected</button>
                </div>
            </div>
        </div>
    );
};


const DocumentUploader: React.FC = () => {
    const { addUploadedDocument } = useAppContext();
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [fileName, setFileName] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [fileType, setFileType] = useState<'pdf' | 'docx' | 'pptx' | 'link'>('pdf');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isDriveModalOpen, setDriveModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !topic || !fileUrl || !fileName) {
            alert('Please fill all fields.');
            return;
        }

        addUploadedDocument({
            title,
            topic,
            fileName,
            fileUrl,
            fileType,
        });

        setSuccessMessage(`Document "${title}" has been added to the library.`);
        setTitle('');
        setTopic('');
        setFileName('');
        setFileUrl('');
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Upload Document or Link</h2>
                    <p className="mt-2 text-slate-600">Add external documents, worksheets, or links to the library.</p>
                </div>
                 <button
                    onClick={() => setDriveModalOpen(true)}
                    className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-500 flex items-center"
                >
                    <i className="ri-google-drive-line mr-2"></i> Import from Google Drive
                </button>
            </div>
            
            {successMessage && (
                <Card className="bg-green-900/20 border-green-500/30">
                    <p className="text-green-700 font-medium">{successMessage}</p>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="doc-title" className="block text-sm font-medium text-slate-600">Document Title</label>
                        <input type="text" id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="doc-topic" className="block text-sm font-medium text-slate-600">Topic</label>
                        <input type="text" id="doc-topic" value={topic} onChange={(e) => setTopic(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="doc-fileName" className="block text-sm font-medium text-slate-600">File Name</label>
                        <input type="text" id="doc-fileName" value={fileName} onChange={(e) => setFileName(e.target.value)} required placeholder="e.g., worksheet.pdf" className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="doc-fileType" className="block text-sm font-medium text-slate-600">File Type</label>
                        <select id="doc-fileType" value={fileType} onChange={(e) => setFileType(e.target.value as any)} className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="pdf">PDF</option>
                            <option value="docx">DOCX</option>
                            <option value="pptx">PPTX</option>
                            <option value="link">External Link</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="doc-fileUrl" className="block text-sm font-medium text-slate-600">File URL (direct link)</label>
                        <input type="url" id="doc-fileUrl" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} required placeholder="https://example.com/document.pdf" className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
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
            {isDriveModalOpen && <GoogleDrivePickerModal onClose={() => setDriveModalOpen(false)} />}
        </div>
    );
};

export default DocumentUploader;
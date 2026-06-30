﻿

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import EmailTemplateModal from '../modals/EmailTemplateModal';
import { EmailTemplate } from '../../types';

const EmailTemplateManager: React.FC = () => {
    const { emailTemplates, deleteEmailTemplate } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setModalOpen(true);
    };
    
    const handleAddNew = () => {
        setEditingTemplate(null);
        setModalOpen(true);
    };
    
    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to delete this template?')) {
            deleteEmailTemplate(id);
        }
    }

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Email Templates</h3>
                    <button onClick={handleAddNew} className="px-2 py-1 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-700">
                        + New
                    </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {emailTemplates.map(template => (
                        <div key={template.id} className="p-2 bg-slate-100 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-sm text-slate-800">{template.name}</p>
                                <p className="text-xs text-slate-500">{template.statusTarget}</p>
                            </div>
                            <div className="space-x-2">
                                <button onClick={() => handleEdit(template)} className="text-slate-500 hover:text-blue-500" title="Edit">
                                    <i className="ri-pencil-line"></i>
                                </button>
                                <button onClick={() => handleDelete(template.id)} className="text-slate-500 hover:text-red-500" title="Delete">
                                    <i className="ri-delete-bin-line"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                     {emailTemplates.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">No templates created yet.</p>
                     )}
                </div>
            </Card>
            {isModalOpen && (
                <EmailTemplateModal
                    template={editingTemplate}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </>
    );
};

export default EmailTemplateManager;
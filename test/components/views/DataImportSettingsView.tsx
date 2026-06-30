﻿import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MANAGEMENT_CONFIG } from '../../constants';
import Card from '../ui/Card';
import { Student, Teacher, AcademicClass, User } from '../../types';

type ActiveTab = 'import' | 'export';

// Function to convert array of objects to CSV
const convertToCSV = (data: any[], headers: string[]): string => {
    const headerRow = headers.join(',');
    const rows = data.map(item => {
        return headers.map(header => {
            const cleanHeader = header.split('(')[0]; // Handle headers like "branchIds(comma-separated)"
            let value = item[cleanHeader]; 
            
            if (Array.isArray(value)) {
                return `"${value.join(';')}"`; // Join array values with semicolon, enclose in quotes
            }
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`; // Enclose strings with commas in quotes
            }
            return value;
        }).join(',');
    });
    return [headerRow, ...rows].join('\n');
};


const DataImportSettingsView: React.FC = () => {
    const { csvTemplates, updateCsvTemplate, branches, classes, subjects, students, teachers, users } = useAppContext();
    const [localTemplates, setLocalTemplates] = useState(csvTemplates);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('import');

    // State for filters
    const [filters, setFilters] = useState<{ [key: string]: { branchId: string; classId: string; subjectId: string; } }>({});

    const handleTemplateChange = (category: string, value: string) => {
        setLocalTemplates(prev => ({ ...prev, [category]: value }));
    };

    const handleSave = (category: string) => {
        updateCsvTemplate(category, localTemplates[category]);
        setSuccess(category);
        setTimeout(() => setSuccess(null), 2000);
    };
    
    const handleFilterChange = (category: string, filterName: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [filterName]: value,
            },
        }));
    };

    const handleDownload = (category: string) => {
        let dataToExport: any[] = [];
        const categoryFilters = filters[category] || { branchId: 'all', classId: 'all', subjectId: 'all' };

        const dataMap: { [key: string]: any[] } = { students, teachers, classes, subjects, branches, users, leads: useAppContext().leads, discounts: useAppContext().discounts, feeStructures: useAppContext().feeStructures };

        switch(category) {
            case 'students':
                dataToExport = students.filter((s: Student) => 
                    (categoryFilters.branchId === 'all' || s.branchIds.includes(categoryFilters.branchId)) &&
                    (categoryFilters.classId === 'all' || s.classId === categoryFilters.classId)
                );
                break;
            case 'teachers':
                 dataToExport = teachers.filter((t: Teacher) => 
                    (categoryFilters.branchId === 'all' || t.branchIds.includes(categoryFilters.branchId)) &&
                    (categoryFilters.classId === 'all' || t.classIds.includes(categoryFilters.classId)) &&
                    (categoryFilters.subjectId === 'all' || t.subjectIds.includes(categoryFilters.subjectId))
                );
                break;
            case 'users':
                dataToExport = users.filter((u: User) =>
                    (categoryFilters.branchId === 'all' || u.branchIds?.includes(categoryFilters.branchId))
                );
                break;
            default:
                // For categories without filters
                dataToExport = dataMap[category as keyof typeof dataMap] || [];
        }

        const headers = csvTemplates[category].split(',');
        const csvString = convertToCSV(dataToExport, headers);
        
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${category}_export.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const categoriesWithCsv = Object.keys(MANAGEMENT_CONFIG).filter(key => MANAGEMENT_CONFIG[key as keyof typeof MANAGEMENT_CONFIG].csvTemplate);

    const tabClasses = (tabName: ActiveTab) =>
        `px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
            activeTab === tabName
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
        }`;

    const renderExportCard = (category: string) => {
        const hasBranchFilter = ['students', 'teachers', 'users'].includes(category);
        const hasClassFilter = ['students', 'teachers'].includes(category);
        const hasSubjectFilter = ['teachers'].includes(category);

        return (
            <Card key={category}>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{MANAGEMENT_CONFIG[category as keyof typeof MANAGEMENT_CONFIG].label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Filters */}
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {hasBranchFilter && (
                            <div>
                                <label className="text-xs text-slate-500">Branch</label>
                                <select onChange={(e) => handleFilterChange(category, 'branchId', e.target.value)} defaultValue="all" className="w-full mt-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm">
                                    <option value="all">All Branches</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        )}
                         {hasClassFilter && (
                            <div>
                                <label className="text-xs text-slate-500">Class</label>
                                <select onChange={(e) => handleFilterChange(category, 'classId', e.target.value)} defaultValue="all" className="w-full mt-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm">
                                    <option value="all">All Classes</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                         {hasSubjectFilter && (
                            <div>
                                <label className="text-xs text-slate-500">Subject</label>
                                <select onChange={(e) => handleFilterChange(category, 'subjectId', e.target.value)} defaultValue="all" className="w-full mt-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm">
                                    <option value="all">All Subjects</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    {/* Download Button */}
                    <div className="md:col-span-1">
                         <button
                            onClick={() => handleDownload(category)}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                            <i className="ri-download-2-line"></i>
                            Download CSV
                        </button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Data Import & Export</h2>
                        <p className="text-slate-600 mt-1">Manage CSV formats for bulk uploads and export existing data.</p>
                    </div>
                     <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg">
                        <button className={tabClasses('import')} onClick={() => setActiveTab('import')}>
                            Import Settings
                        </button>
                        <button className={tabClasses('export')} onClick={() => setActiveTab('export')}>
                            Export Data
                        </button>
                    </div>
                </div>
            </Card>
            
            {activeTab === 'import' && (
                 <div className="space-y-4">
                    {categoriesWithCsv.map(category => (
                        <Card key={category}>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">{MANAGEMENT_CONFIG[category as keyof typeof MANAGEMENT_CONFIG].label}</h3>
                            <p className="text-sm text-slate-500 mb-4">Define the comma-separated headers for the CSV file. The order of columns must match.</p>
                            <textarea
                                value={localTemplates[category]}
                                onChange={(e) => handleTemplateChange(category, e.target.value)}
                                rows={2}
                                className="w-full p-2 bg-white/50 border border-slate-200 text-slate-800 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="flex justify-end items-center mt-4">
                                {success === category && <p className="text-sm text-green-600 mr-4">Saved!</p>}
                                <button
                                    onClick={() => handleSave(category)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                                >
                                    Save Format
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            
            {activeTab === 'export' && (
                <div className="space-y-4">
                    <Card className="!bg-blue-900/30 !border-blue-700">
                        <div className="flex items-center">
                            <i className="ri-information-line text-2xl text-blue-700 mr-4"></i>
                            <div>
                                <h3 className="font-semibold text-slate-800">How to Export and Re-import</h3>
                                <p className="text-sm text-slate-500">1. Select filters to narrow down your data. 2. Download the pre-filled CSV. 3. Make your edits in a spreadsheet program. 4. Go to the relevant management page (e.g., Student Management) and use the "Bulk Upload" button to import your changes.</p>
                            </div>
                        </div>
                    </Card>
                    {categoriesWithCsv.map(renderExportCard)}
                </div>
            )}

        </div>
    );
};

export default DataImportSettingsView;

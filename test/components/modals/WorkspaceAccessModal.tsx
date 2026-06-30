import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Student, Teacher } from '../../types';

const WorkspaceAccessModal: React.FC = () => {
    const { 
        closeWorkspaceAccessModal, 
        filteredStudents, 
        filteredTeachers, 
        impersonateUser 
    } = useAppContext();
    
    const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
    const [searchQuery, setSearchQuery] = useState('');

    const handleImpersonate = (user: Student | Teacher) => {
        impersonateUser(user);
    };

    const searchFilter = (user: Student | Teacher) => {
        if (searchQuery.trim() === '') return true;
        const query = searchQuery.toLowerCase();
        return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
    };

    const studentsToList = useMemo(() => filteredStudents.filter(searchFilter), [filteredStudents, searchQuery]);
    const teachersToList = useMemo(() => filteredTeachers.filter(searchFilter), [filteredTeachers, searchQuery]);

    const tabClasses = (tabName: 'students' | 'teachers') =>
        `px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200 ${
            activeTab === tabName
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-600 hover:bg-slate-100'
        }`;

    const renderList = (users: (Student | Teacher)[]) => (
        <div className="space-y-2 mt-4 pr-2">
            {users.length > 0 ? users.map(user => (
                <div key={user.id} className="flex justify-between items-center p-3 bg-slate-100 rounded-lg">
                    <div>
                        <p className="font-semibold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <button
                        onClick={() => handleImpersonate(user)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                    >
                        View Workspace
                    </button>
                </div>
            )) : (
                <p className="text-center text-slate-500 py-8">No users match your search.</p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-scale-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Individual Workspace</h2>

                <div className="flex flex-col sm:flex-row gap-4 items-center border-b border-slate-200 pb-4 mb-4">
                    <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg">
                        <button className={tabClasses('students')} onClick={() => setActiveTab('students')}>Students</button>
                        <button className={tabClasses('teachers')} onClick={() => setActiveTab('teachers')}>Teachers</button>
                    </div>
                    <div className="relative flex-grow w-full">
                        <input
                            type="search"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg"
                        />
                        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {activeTab === 'students' && renderList(studentsToList)}
                    {activeTab === 'teachers' && renderList(teachersToList)}
                </div>

                <div className="mt-6 flex justify-end pt-4 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={closeWorkspaceAccessModal}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceAccessModal;

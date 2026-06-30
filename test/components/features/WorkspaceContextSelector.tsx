

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';

const WorkspaceContextSelector: React.FC = () => {
    const {
        filteredClasses,
        filteredSubjects,
        teacherWorkspace,
        setTeacherWorkspace,
        currentUser
    } = useAppContext();

    const currentTeacher = currentUser;

    if (!currentTeacher) {
        return null; 
    }

    const assignedClasses = filteredClasses;
    const assignedSubjects = filteredSubjects;

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTeacherWorkspace({ ...teacherWorkspace, classId: e.target.value });
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTeacherWorkspace({ ...teacherWorkspace, subjectId: e.target.value });
    };

    if (assignedClasses.length <= 1 && assignedSubjects.length <= 1) {
        return null;
    }

    return (
        <Card>
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <i className="ri-layout-grid-line text-sm" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700 whitespace-nowrap">Workspace:</h3>
                </div>
                <div className="flex-grow">
                    <label htmlFor="classContext" className="sr-only">Select Class</label>
                    <select
                        id="classContext"
                        value={teacherWorkspace.classId}
                        onChange={handleClassChange}
                        className="select-field"
                        disabled={assignedClasses.length <= 1}
                    >
                        {assignedClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-grow">
                    <label htmlFor="subjectContext" className="sr-only">Select Subject</label>
                    <select
                        id="subjectContext"
                        value={teacherWorkspace.subjectId}
                        onChange={handleSubjectChange}
                        className="select-field"
                        disabled={assignedSubjects.length <= 1}
                    >
                        {assignedSubjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </Card>
    );
};

export default WorkspaceContextSelector;
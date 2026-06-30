﻿

import React from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { UserRole, Student } from '../../types';

const MyCoursesView: React.FC = () => {
    const { currentUser, filteredSubjects, currentRole } = useAppContext();
    
    if (!currentUser || currentRole !== UserRole.Student) {
        return (
            <Card>
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
                    <p className="mt-4 text-slate-500">This view is only available for students.</p>
                </div>
            </Card>
        );
    }

    const mySubjects = filteredSubjects;
    
    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-3xl font-bold text-slate-900">My Courses</h2>
                <p className="text-slate-600 mt-1">All your enrolled subjects in one place.</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mySubjects.map(subject => (
                    <Card key={subject.id} className="flex flex-col">
                        <div className="flex-grow">
                            <span className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-500/20 rounded-full">{subject.category}</span>
                            <h3 className="mt-3 text-xl font-bold text-slate-900">{subject.name}</h3>
                            <p className="mt-2 text-sm text-slate-500">Access study materials, assignments, and track your progress.</p>
                        </div>
                    </Card>
                ))}
                 {mySubjects.length === 0 && (
                    <Card className="col-span-full text-center">
                        <p className="text-slate-500">You are not enrolled in any subjects yet.</p>
                    </Card>
                 )}
            </div>
        </div>
    );
};

export default MyCoursesView;
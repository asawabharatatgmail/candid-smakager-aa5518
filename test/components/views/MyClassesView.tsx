﻿import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { AcademicClass, UserRole, Teacher } from '../../types';

const MyClassesView: React.FC = () => {
    const { currentUser, filteredClasses, currentRole, openMeetModal } = useAppContext();
    
    if (!currentUser || currentRole !== UserRole.Teacher) {
        return (
            <Card>
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
                    <p className="mt-4 text-slate-500">This view is only available for teachers.</p>
                </div>
            </Card>
        );
    }
    
    const myClasses = filteredClasses;

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-3xl font-bold text-slate-900">My Classes</h2>
                <p className="text-slate-600 mt-1">An overview of the classes you are assigned to.</p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClasses.length > 0 ? myClasses.map((cls: AcademicClass) => (
                    <Card key={cls.id}>
                        <h3 className="text-xl font-bold text-slate-900">{cls.name}</h3>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center text-sm text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.001 3.001 0 015.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                <span>{cls.studentIds.length} Students</span>
                            </div>
                             <div className="flex items-center text-sm text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-9-5.747h18M5.464 5.464l13.072 13.072M5.464 18.536L18.536 5.464" /></svg>
                                <span>Main Teacher</span>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-col space-y-2">
                            <button 
                                onClick={() => openMeetModal(cls)}
                                className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 flex items-center justify-center"
                            >
                                <i className="ri-vidicon-line mr-2"></i> Schedule Live Class
                            </button>
                        </div>
                    </Card>
                )) : (
                    <Card className="col-span-full">
                        <p className="text-center text-slate-500">You are not currently assigned to any classes.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default MyClassesView;
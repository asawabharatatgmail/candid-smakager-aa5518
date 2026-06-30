﻿

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { Student } from '../../types';

const StudentProfileView: React.FC = () => {
    const { currentUser, getContextData, openConnectEmailModal, disconnectEmail } = useAppContext();
    const student = currentUser as Student;

    if (!student) {
        return <Card><p>Could not find student profile.</p></Card>;
    }
    
    const studentClass = getContextData('classes', student.classId);
    const studentSubjects = student.subjectIds.map(id => getContextData('subjects', id)).filter(Boolean);

    return (
        <div className="space-y-6">
            <Card>
                 <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">My Profile</h2>
                        <p className="text-slate-500 mt-1">Your personal and academic information.</p>
                    </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500">Full Name</dt>
                            <dd className="mt-1 text-sm text-slate-800">{student.name}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500">Email Address</dt>
                            <dd className="mt-1 text-sm text-slate-800">{student.email}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500">Mobile Number</dt>
                            <dd className="mt-1 text-sm text-slate-800">{student.mobile}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500">Class</dt>
                            <dd className="mt-1 text-sm text-slate-800">{studentClass?.name || 'N/A'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-slate-500">Enrolled Subjects</dt>
                            <dd className="mt-1 text-sm text-slate-800">
                                {studentSubjects.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {studentSubjects.map((sub: any) => (
                                            <span key={sub.id} className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-500/20 rounded-full">
                                                {sub.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    'No subjects enrolled.'
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>
            </Card>
            
            <Card>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Connected Accounts</h3>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white/40">
                  <div className="flex items-center">
                      <i className="ri-google-fill text-2xl text-slate-600 mr-4"></i>
                      <div>
                        <h3 className="font-semibold text-slate-800">Google Account</h3>
                        {currentUser?.connectedEmail ? (
                          <p className="text-sm text-green-600">{currentUser.connectedEmail}</p>
                        ) : (
                          <p className="text-sm text-slate-500">Not Connected</p>
                        )}
                      </div>
                  </div>
                  {currentUser?.connectedEmail ? (
                     <button onClick={disconnectEmail} className="px-4 py-2 bg-red-500/20 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-500/30">
                        Disconnect
                      </button>
                  ) : (
                    <button onClick={openConnectEmailModal} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-500">
                        Connect
                    </button>
                  )}
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-slate-900">My Parent/Guardian Information</h3>
                {student.parentName ? (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600">
                        <div><span className="font-semibold text-slate-500">Name:</span> {student.parentName}</div>
                        <div><span className="font-semibold text-slate-500">Email:</span> {student.parentEmail}</div>
                        <div><span className="font-semibold text-slate-500">Mobile:</span> {student.parentMobile}</div>
                    </div>
                ) : (
                    <p className="mt-4 text-slate-500">No parent or guardian information has been added to your profile. Please contact the administration to update your details.</p>
                )}
            </Card>
        </div>
    );
};

export default StudentProfileView;
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { ExternalStudent } from '../../types';

const ExternalStudentProfileView: React.FC = () => {
  const { currentUser, openConnectEmailModal, disconnectEmail } = useAppContext();
  const student = currentUser as ExternalStudent;

  if (!student) return <Card><p>Could not load profile.</p></Card>;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-bold text-slate-900">My Profile</h2>
        <p className="text-slate-500 mt-1">Your personal and academic information.</p>
        <div className="mt-6 border-t border-slate-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <dt className="text-sm font-medium text-slate-500">Full Name</dt>
            <dd className="mt-1 text-sm text-slate-800">{student.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Email Address</dt>
            <dd className="mt-1 text-sm text-slate-800">{student.email}</dd>
          </div>
          {student.mobile && (
            <div>
              <dt className="text-sm font-medium text-slate-500">Mobile</dt>
              <dd className="mt-1 text-sm text-slate-800">{student.mobile}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-slate-500">Grade / Class</dt>
            <dd className="mt-1 text-sm text-slate-800">{student.grade}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Age</dt>
            <dd className="mt-1 text-sm text-slate-800">{student.age}</dd>
          </div>
          {student.schoolName && (
            <div>
              <dt className="text-sm font-medium text-slate-500">School</dt>
              <dd className="mt-1 text-sm text-slate-800">{student.schoolName}</dd>
            </div>
          )}
          {student.city && (
            <div>
              <dt className="text-sm font-medium text-slate-500">City</dt>
              <dd className="mt-1 text-sm text-slate-800">{student.city}</dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-slate-500">Subjects of Interest</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {student.subjectsOfInterest?.length > 0
                ? student.subjectsOfInterest.map(s => (
                    <span key={s} className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-500/20 rounded-full">{s}</span>
                  ))
                : <span className="text-slate-400 text-sm">No subjects added yet.</span>
              }
            </dd>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Connected Accounts</h3>
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white/40">
          <div className="flex items-center">
            <i className="ri-google-fill text-2xl text-slate-600 mr-4" />
            <div>
              <p className="font-semibold text-slate-800">Google Account</p>
              {currentUser?.connectedEmail
                ? <p className="text-sm text-green-600">{currentUser.connectedEmail}</p>
                : <p className="text-sm text-slate-500">Not Connected</p>
              }
            </div>
          </div>
          {currentUser?.connectedEmail
            ? <button onClick={disconnectEmail} className="px-4 py-2 bg-red-500/20 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-500/30">Disconnect</button>
            : <button onClick={openConnectEmailModal} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-300">Connect</button>
          }
        </div>
      </Card>
    </div>
  );
};

export default ExternalStudentProfileView;

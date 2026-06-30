﻿import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { Student } from '../../types';
import BulkAttendanceUploadModal from '../modals/BulkAttendanceUploadModal';

const AttendanceView: React.FC = () => {
  const { filteredClasses, students, teacherWorkspace, attendance, updateAttendance, getContextData, filteredSubjects } = useAppContext();
  
  const [selectedClassId, setSelectedClassId] = useState(teacherWorkspace.classId || filteredClasses[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(filteredSubjects[0]?.id || '');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isBulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);

  const availableClasses = filteredClasses; // Use filtered classes for role-specific view

  const studentsInClassAndSubject = useMemo(() => {
    if (!selectedClassId || !selectedSubjectId) return [];
    const classInfo = getContextData('classes', selectedClassId);
    if (!classInfo) return [];
    return classInfo.studentIds
      .map((id: string) => getContextData('students', id))
      .filter((s: Student) => s && s.status === 'active' && s.subjectIds.includes(selectedSubjectId));
  }, [selectedClassId, selectedSubjectId, students, getContextData]);

  const getAttendanceStatus = (studentId: string) => {
    const record = attendance.find(a => a.studentId === studentId && a.date === currentDate && a.subjectId === selectedSubjectId);
    return record ? record.status : null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Attendance</h2>
            <p className="text-slate-600 mt-1">Mark daily attendance for your classes by subject.</p>
          </div>
          <button
              onClick={() => setBulkUploadModalOpen(true)}
              className="btn-primary flex items-center gap-2"
          >
              <i className="ri-upload-2-line"></i>
              Bulk Upload (CSV)
          </button>
        </div>
      </Card>
      <Card>
        <div className="flex flex-wrap gap-4 items-center p-4 border-b border-slate-200">
          <div>
            <label htmlFor="class-selector" className="block text-sm font-medium text-slate-600">Class</label>
            <select
              id="class-selector"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-100 border-slate-200 text-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="subject-selector" className="block text-sm font-medium text-slate-600">Subject</label>
            <select
              id="subject-selector"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-100 border-slate-200 text-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="date-selector" className="block text-sm font-medium text-slate-600">Date</label>
            <input
              type="date"
              id="date-selector"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="mt-1 block w-full pl-3 pr-4 py-2 text-base bg-slate-100 border-slate-200 text-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-slate-200">
              {studentsInClassAndSubject.map((student: Student) => {
                const status = getAttendanceStatus(student.id);
                return (
                  <tr key={student.id} className="hover:bg-slate-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{student.name}</div>
                      <div className="text-sm text-slate-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => updateAttendance(student.id, selectedSubjectId, currentDate, 'Present')}
                          className={`px-3 py-1 text-sm rounded-full font-semibold ${status === 'Present' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => updateAttendance(student.id, selectedSubjectId, currentDate, 'Absent')}
                          className={`px-3 py-1 text-sm rounded-full font-semibold ${status === 'Absent' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => updateAttendance(student.id, selectedSubjectId, currentDate, 'Late')}
                          className={`px-3 py-1 text-sm rounded-full font-semibold ${status === 'Late' ? 'bg-yellow-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {studentsInClassAndSubject.length === 0 && <p className="text-center p-4 text-slate-500">No active students in this class for the selected subject.</p>}
        </div>
      </Card>
      {isBulkUploadModalOpen && <BulkAttendanceUploadModal onClose={() => setBulkUploadModalOpen(false)} />}
    </div>
  );
};

export default AttendanceView;
﻿import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Student } from '../../types';
import Card from '../ui/Card';
import ApplyDiscountModal from '../modals/ApplyDiscountModal';
import SetPaymentPlanModal from '../modals/SetPaymentPlanModal';

const StudentFeeManager: React.FC = () => {
    const { students, getStudentFeeProfile } = useAppContext();
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
    const [isPlanModalOpen, setPlanModalOpen] = useState(false);

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
    };

    const getFeeStatus = (studentId: string) => {
        const profile = getStudentFeeProfile(studentId);
        if (!profile) return { text: 'Not Generated', color: 'bg-slate-200 text-slate-600' };
        if (profile.installments.length === 0) return { text: 'Plan Pending', color: 'bg-yellow-500/20 text-amber-700' };
        const isAllPaid = profile.installments.every(i => i.status === 'Paid');
        if (isAllPaid) return { text: 'Fully Paid', color: 'bg-green-500/20 text-green-700' };
        return { text: 'In Progress', color: 'bg-blue-500/20 text-blue-700' };
    };

    return (
        <Card>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Student Fee Management</h3>
            <p className="text-sm text-slate-500 mb-4">Select a student to manage their fees, apply discounts, and set payment plans.</p>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fee Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-slate-200">
                        {students.map(student => {
                            const status = getFeeStatus(student.id);
                            const profile = getStudentFeeProfile(student.id);
                            return (
                                <tr key={student.id} className="hover:bg-slate-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Grade 10-A</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => { setSelectedStudent(student); setDiscountModalOpen(true); }} className="text-indigo-400 hover:text-indigo-700">Apply Discounts</button>
                                        <button onClick={() => { setSelectedStudent(student); setPlanModalOpen(true); }} className="text-green-600 hover:text-green-700" disabled={!profile}>Set Plan</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {isDiscountModalOpen && selectedStudent && (
                <ApplyDiscountModal student={selectedStudent} onClose={() => setDiscountModalOpen(false)} />
            )}
            {isPlanModalOpen && selectedStudent && (
                <SetPaymentPlanModal student={selectedStudent} onClose={() => setPlanModalOpen(false)} />
            )}
        </Card>
    );
};

export default StudentFeeManager;
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Student } from '../../types';

interface SetPaymentPlanModalProps {
  student: Student;
  onClose: () => void;
}

const SetPaymentPlanModal: React.FC<SetPaymentPlanModalProps> = ({ student, onClose }) => {
  const { setStudentPaymentPlan, getStudentFeeProfile } = useAppContext();
  const profile = getStudentFeeProfile(student.id);

  const [numInstallments, setNumInstallments] = useState(profile?.installments.length || 4);
  const [lateFee, setLateFee] = useState(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numInstallments < 1) return;
    setStudentPaymentPlan(student.id, numInstallments, lateFee);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full border border-slate-200 animate-scale-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Payment Plan</h2>
        <p className="text-slate-600 mb-4">For student: <span className="font-semibold">{student.name}</span></p>
        <div className="bg-indigo-500/10 p-3 rounded-lg text-sm text-indigo-700 mb-4">
            Net Payable Amount: <span className="font-bold">₹{profile?.netPayable.toLocaleString() || 'N/A'}</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="numInstallments" className="block text-sm font-medium text-slate-600">Number of Installments (1 for Lumpsum)</label>
            <input
              type="number"
              id="numInstallments"
              value={numInstallments}
              onChange={(e) => setNumInstallments(Number(e.target.value))}
              min="1"
              max="12"
              className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="lateFee" className="block text-sm font-medium text-slate-600">Late Fee (₹ per day)</label>
            <input
              type="number"
              id="lateFee"
              value={lateFee}
              onChange={(e) => setLateFee(Number(e.target.value))}
              min="0"
              className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Generate Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetPaymentPlanModal;
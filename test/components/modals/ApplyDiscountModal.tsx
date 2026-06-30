import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Student, Discount } from '../../types';

interface ApplyDiscountModalProps {
  student: Student;
  onClose: () => void;
}

const ApplyDiscountModal: React.FC<ApplyDiscountModalProps> = ({ student, onClose }) => {
  const { discounts, applyDiscountsToStudent, getStudentFeeProfile } = useAppContext();
  const profile = getStudentFeeProfile(student.id);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>(profile?.appliedDiscounts.map(d => d.discountId) || []);

  const handleToggleDiscount = (discountId: string) => {
    setSelectedDiscounts(prev =>
      prev.includes(discountId)
        ? prev.filter(id => id !== discountId)
        : [...prev, discountId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyDiscountsToStudent(student.id, selectedDiscounts);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full border border-slate-200 animate-scale-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Apply Discounts</h2>
        <p className="text-slate-600 mb-4">For student: <span className="font-semibold">{student.name}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {discounts.map(discount => (
              <label key={discount.id} htmlFor={`discount-${discount.id}`} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  id={`discount-${discount.id}`}
                  checked={selectedDiscounts.includes(discount.id)}
                  onChange={() => handleToggleDiscount(discount.id)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 bg-white"
                />
                <span className="ml-3 text-sm font-medium text-slate-600">{discount.name} ({discount.type === 'Percentage' ? `${discount.value}%` : `₹${discount.value}`})</span>
              </label>
            ))}
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
              Apply & Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyDiscountModal;
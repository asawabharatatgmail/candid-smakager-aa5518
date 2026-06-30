﻿import React from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { Installment, FeeReceipt, UserRole, Parent, Student } from '../../types';

const FeePaymentView: React.FC = () => {
    const { currentUser, getStudentFeeProfile, getReceipt, openReceiptModal, currentRole } = useAppContext();
    
    if (currentRole !== UserRole.Parent && currentRole !== UserRole.Student) {
        return (
            <Card>
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
                    <p className="mt-4 text-slate-500">This view is only available for parents and students.</p>
                </div>
            </Card>
        );
    }
    
    let student: Student | undefined;
    if (currentRole === UserRole.Parent) {
        const parent = currentUser as Parent;
        student = parent.child;
    } else {
        student = currentUser as Student;
    }

    if (!student) {
        return <Card><p>Could not load student profile.</p></Card>;
    }
    
    const studentId = student.id;
    const feeProfile = getStudentFeeProfile(studentId);

    if (!feeProfile) {
        return (
            <Card>
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-slate-900">Fee Information</h2>
                    <p className="mt-4 text-slate-500">Fee details for the current academic year have not been generated yet. Please check back later or contact the administration.</p>
                </div>
            </Card>
        );
    }
    
    const { totalFee, totalDiscount, netPayable, installments } = feeProfile;

    const paymentHistory = installments
        .filter(inst => inst.status === 'Paid' && inst.receiptId)
        .map(inst => getReceipt(inst.receiptId!))
        .filter((r): r is FeeReceipt => r !== undefined);

    const getStatusBadge = (status: Installment['status']) => {
        const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
        switch (status) {
            case 'Paid': return <span className={`${baseClasses} bg-green-500/20 text-green-700`}>{status}</span>;
            case 'Pending': return <span className={`${baseClasses} bg-yellow-500/20 text-amber-700`}>{status}</span>;
            case 'Overdue': return <span className={`${baseClasses} bg-red-500/20 text-red-700`}>{status}</span>;
            case 'Partially Paid': return <span className={`${baseClasses} bg-blue-500/20 text-blue-700`}>{status}</span>;
            default: return <span className={`${baseClasses} bg-slate-100 text-slate-600`}>{status}</span>;
        }
    };
    
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-bold text-slate-900">My Fees</h2>
        <p className="text-slate-600 mt-1">Review and pay outstanding fees for {student.name}.</p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <p className="text-sm font-medium text-slate-500">Total Academic Fee</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">₹{totalFee.toLocaleString()}</p>
        </Card>
        <Card>
            <p className="text-sm font-medium text-slate-500">Total Discount</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">- ₹{totalDiscount.toLocaleString()}</p>
        </Card>
        <Card className="bg-indigo-600 text-white">
            <p className="text-sm font-medium text-indigo-200">Net Payable Amount</p>
            <p className="text-2xl font-semibold mt-1">₹{netPayable.toLocaleString()}</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Installment Plan</h3>
         <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Installment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount Due</th>
                 <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-slate-200">
              {installments.map(inst => (
                <tr key={inst.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">Installment {inst.installmentNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(inst.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 text-right font-medium">₹{(inst.amountDue + inst.lateFeeApplied).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{getStatusBadge(inst.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    {inst.status === 'Pending' || inst.status === 'Overdue' ? (
                        <button className="px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-md hover:bg-green-700">Pay Now</button>
                    ) : (
                        inst.status === 'Paid' && inst.receiptId ? (
                            <button onClick={() => openReceiptModal(inst.receiptId!)} className="text-indigo-400 hover:text-indigo-700 text-xs font-semibold">View Receipt</button>
                        ) : null
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
       <Card>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Payment History</h3>
         <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Paid For</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-slate-200">
              {paymentHistory.length > 0 ? paymentHistory.map(receipt => (
                <tr key={receipt.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-400 hover:underline cursor-pointer" onClick={() => openReceiptModal(receipt.id)}>{receipt.receiptNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(receipt.paymentDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{receipt.paidFor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 text-right font-medium">₹{receipt.amountPaid.toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={4} className="text-center p-4 text-slate-500">No payment history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

export default FeePaymentView;

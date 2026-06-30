
import React from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { Student } from '../../types';

const FeesView: React.FC = () => {
    const { students } = useAppContext();
    const activeStudents = students.filter(s => s.status === 'active');
    
    // Mock fee data for demonstration
    const feeData = activeStudents.map((student, index) => {
        const statuses = ['Paid', 'Pending', 'Overdue'];
        const status = statuses[index % 3];
        let amount = 15000;
        let dueDate = '2024-08-10';
        if (status === 'Overdue') {
            dueDate = '2024-07-10';
        }
        return { student, status, amount, dueDate };
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Paid': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{status}</span>;
            case 'Pending': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{status}</span>;
            case 'Overdue': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{status}</span>;
            default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-bold text-gray-800">Fee Management</h2>
        <p className="text-gray-600 mt-1">Track and manage student fee payments for this branch.</p>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeData.map(({ student, status, amount, dueDate }) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900">Send Reminder</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FeesView;

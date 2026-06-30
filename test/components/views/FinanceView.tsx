import React, { useState } from 'react';
import Card from '../ui/Card';
import FeeStructureManager from '../features/FeeStructureManager';
import DiscountManager from '../features/DiscountManager';
import StudentFeeManager from '../features/StudentFeeManager';

type ActiveTab = 'studentFees' | 'structures' | 'discounts';

const FinanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studentFees');

  const tabClasses = (tabName: ActiveTab) =>
    `px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
      activeTab === tabName
        ? 'bg-indigo-600 text-white shadow'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Finance Management</h2>
            <p className="text-slate-600 mt-1">Oversee all financial operations from fee structures to collections.</p>
          </div>
          <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg">
            <button className={tabClasses('studentFees')} onClick={() => setActiveTab('studentFees')}>
              Student Fees
            </button>
            <button className={tabClasses('structures')} onClick={() => setActiveTab('structures')}>
              Fee Structures
            </button>
            <button className={tabClasses('discounts')} onClick={() => setActiveTab('discounts')}>
              Discounts
            </button>
          </div>
        </div>
      </Card>

      <div>
        {activeTab === 'studentFees' && <StudentFeeManager />}
        {activeTab === 'structures' && <FeeStructureManager />}
        {activeTab === 'discounts' && <DiscountManager />}
      </div>
    </div>
  );
};

export default FinanceView;
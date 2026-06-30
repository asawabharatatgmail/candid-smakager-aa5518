

import React from 'react';
import { useAppContext } from '../context/AppContext';

const InstituteSwitcher: React.FC = () => {
  const { institutes, activeInstituteId, setActiveInstituteId } = useAppContext();
  
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setActiveInstituteId(value === 'all' ? null : value);
  };

  return (
    <div className="relative">
      <select
        value={activeInstituteId || 'all'}
        onChange={handleChange}
        className="appearance-none w-full bg-slate-100 border border-slate-200 text-slate-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-slate-200 focus:border-indigo-500 text-sm"
      >
        <option value="all">View All Institutes</option>
        {institutes.map((inst) => (
          <option key={inst.id} value={inst.id}>
            View as: {inst.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default InstituteSwitcher;
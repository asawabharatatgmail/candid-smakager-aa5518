import React from 'react';
import { NAV_LINKS } from '../../constants';
import { UserRole } from '../../types';
import PersonalizedInsights from '../features/PersonalizedInsights';
import { useAppContext } from '../../context/AppContext';

const ClassAdminDashboard: React.FC = () => {
  const { filteredBranches, filteredStudents, filteredTeachers, filteredClasses, setActiveView } = useAppContext();
  const adminLinks = NAV_LINKS[UserRole.ClassAdmin].filter(l => l.key !== 'dashboard');

  const stats = [
    { label: 'Branches',  value: filteredBranches.length,  icon: 'ri-building-2-line',  color: 'bg-indigo-100 text-indigo-600',  view: 'branches'  },
    { label: 'Students',  value: filteredStudents.length,  icon: 'ri-graduation-cap-line', color: 'bg-emerald-100 text-emerald-600', view: 'students' },
    { label: 'Teachers',  value: filteredTeachers.length,  icon: 'ri-user-3-line',      color: 'bg-violet-100 text-violet-600',  view: 'teachers'  },
    { label: 'Classes',   value: filteredClasses.length,   icon: 'ri-book-2-line',      color: 'bg-amber-100 text-amber-600',    view: 'classes-subjects' },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="page-title text-2xl">Institute Dashboard</h1>
        <p className="page-sub">Overview of your institute's academic and operational status.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setActiveView(s.view)}
            className="card text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <i className={`${s.icon} text-xl`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5 uppercase tracking-wide">{s.label}</p>
          </button>
        ))}
      </div>

      {/* AI Insight */}
      <PersonalizedInsights role={UserRole.ClassAdmin} />

      {/* Navigation cards */}
      <div>
        <h2 className="section-head">Admin Controls</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <button
                key={link.key}
                onClick={() => setActiveView(link.key)}
                className="card-hover text-left group animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                    <p className="text-xs text-slate-500">Manage {link.label.toLowerCase()}</p>
                  </div>
                  <i className="ri-arrow-right-line ml-auto text-slate-600 group-hover:text-indigo-500 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClassAdminDashboard;

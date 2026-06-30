import React from 'react';
import { NAV_LINKS } from '../../constants';
import { UserRole } from '../../types';
import { useAppContext } from '../../context/AppContext';

const ParentDashboard: React.FC = () => {
  const parentLinks = NAV_LINKS[UserRole.Parent].filter(l => l.key !== 'dashboard');
  const { setActiveView, currentUser } = useAppContext();

  const iconColors = [
    'bg-indigo-100 text-indigo-600',
    'bg-emerald-100 text-emerald-600',
    'bg-violet-100 text-violet-600',
    'bg-amber-100 text-amber-600',
    'bg-pink-100 text-pink-600',
    'bg-cyan-100 text-cyan-600',
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="page-title text-2xl">Parent Dashboard</h1>
        <p className="page-sub">Monitor your child's academic progress and activities.</p>
      </div>

      {/* Summary banner */}
      <div className="card bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <i className="ri-parent-line text-2xl" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Viewing as {currentUser?.name || 'Parent'}</p>
            <p className="text-sm text-slate-500 mt-0.5">Stay updated on attendance, fees, and academic performance.</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-head">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parentLinks.map((link, i) => {
            const Icon = link.icon;
            const colorClass = iconColors[i % iconColors.length];
            return (
              <button
                key={link.key}
                onClick={() => setActiveView(link.key)}
                className="card-hover text-left group animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                    <p className="text-xs text-slate-500">View details</p>
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

export default ParentDashboard;

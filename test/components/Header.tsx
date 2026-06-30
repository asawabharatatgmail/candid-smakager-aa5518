import React from 'react';
import { useAppContext } from '../context/AppContext';
import InstituteSwitcher from './InstituteSwitcher';
import { UserRole } from '../types';
import LiveClock from './features/LiveClock';

const Header: React.FC = () => {
  const {
    currentRole, activeView, getViewLabel, activeInstitute,
    currentUser, logout, toggleSidebar, openWorkspaceAccessModal,
  } = useAppContext();

  const instituteName =
    currentRole === UserRole.ProductOwner
      ? (activeInstitute?.name || 'All Institutes')
      : (activeInstitute?.name || 'EduVeda Platform');

  const roleBadgeColors: Record<string, string> = {
    [UserRole.ProductOwner]: 'bg-amber-100 text-amber-700',
    [UserRole.ClassAdmin]:   'bg-indigo-100 text-indigo-700',
    [UserRole.BranchAdmin]:  'bg-violet-100 text-violet-700',
    [UserRole.Teacher]:      'bg-emerald-100 text-emerald-700',
    [UserRole.Student]:      'bg-cyan-100 text-cyan-700',
    [UserRole.Parent]:       'bg-pink-100 text-pink-700',
  };
  const badgeClass = roleBadgeColors[currentRole] || 'bg-slate-100 text-slate-700';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-indigo-600 md:hidden p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          aria-label="Toggle sidebar"
        >
          <i className="ri-menu-line text-xl" />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight truncate max-w-[160px] sm:max-w-xs">
            {getViewLabel(activeView)}
          </h2>
          <p className="text-xs text-slate-500 truncate max-w-[160px] sm:max-w-xs">{instituteName}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-3">
        {currentRole === UserRole.ProductOwner && <InstituteSwitcher />}

        {(currentRole === UserRole.ClassAdmin || currentRole === UserRole.BranchAdmin) && (
          <button
            onClick={openWorkspaceAccessModal}
            style={{ backgroundColor: '#2563EB', color: '#ffffff', border: 'none' }}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            <i className="ri-eye-line" /> View As…
          </button>
        )}

        <LiveClock />

        <div className="hidden sm:flex flex-col items-end">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{currentUser?.name || 'User'}</p>
          <span className={`badge text-xs ${badgeClass}`}>
            {currentRole}
          </span>
        </div>

        <div className="relative">
          <img
            className="h-9 w-9 rounded-xl object-cover ring-2 ring-indigo-200"
            src={`https://i.pravatar.cc/150?u=${currentUser?.id || currentRole.replace(/\s/g, '')}`}
            alt="avatar"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>

        <button
          onClick={logout}
          style={{ backgroundColor: '#2563EB', color: '#ffffff', border: 'none' }}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          title="Sign out"
        >
          <i className="ri-logout-circle-r-line text-base" /> Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;

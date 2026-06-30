import React from 'react';
import { NAV_LINKS } from '../constants';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { currentRole, activeView, setActiveView, activeInstitute, isSidebarOpen, currentSubscription, themeSettings } = useAppContext();
  const navLinks = NAV_LINKS[currentRole] || [];
  const showInstituteBranding = currentRole !== UserRole.ProductOwner && activeInstitute;

  const visibleLinks = navLinks.filter((link) => {
    if (currentRole === UserRole.ProductOwner) return true;
    switch (link.key) {
      case 'leads': case 'digital-marketing': case 'integrations': case 'finance':
        return currentSubscription.isLeadManagementEnabled;
      case 'content-creator': case 'ai-study-tool': case 'gamification':
        return currentSubscription.isAiEnabled;
      default: return true;
    }
  });

  return (
    <div
      className={`
        app-sidebar flex flex-col flex-shrink-0 w-64
        fixed inset-y-0 left-0 z-30
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ background: `linear-gradient(180deg, ${themeSettings?.sidebarFrom || '#1e1b4b'} 0%, ${themeSettings?.sidebarTo || '#312e81'} 100%)` }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 flex-shrink-0">
        {showInstituteBranding && activeInstitute.logoUrl ? (
          <img src={activeInstitute.logoUrl} alt="logo" className="h-8 w-8 rounded-lg object-contain bg-white/10 p-1" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <i className="ri-graduation-cap-line text-white text-base" />
          </div>
        )}
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-white leading-tight truncate">
            {showInstituteBranding ? activeInstitute.name : 'System4Learn'}
          </p>
          <p className="text-xs text-indigo-300 leading-tight">Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const active = activeView === link.key;
          return (
            <a
              key={link.key}
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveView(link.key); }}
              className={`nav-item ${active ? 'nav-active' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{link.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0" />}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
        {showInstituteBranding && activeInstitute.tagline ? (
          <p className="text-xs text-indigo-300 italic truncate">"{activeInstitute.tagline}"</p>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-indigo-300">All systems online</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

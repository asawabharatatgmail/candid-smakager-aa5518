import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppContext } from '../context/AppContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isSidebarOpen, closeSidebar } = useAppContext();

  return (
    <div className="light-theme flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-white/50 z-20 md:hidden"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DashboardLayout;

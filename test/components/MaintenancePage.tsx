
import React from 'react';

const MaintenancePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-center p-4">
            <div className="text-indigo-400 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">Under Maintenance</h1>
            <p className="text-lg text-slate-300 max-w-xl">
                Our platform is currently undergoing scheduled maintenance to improve your experience. We'll be back online shortly.
            </p>
            <p className="text-md text-slate-400 mt-2">Thank you for your patience.</p>
        </div>
    );
};

export default MaintenancePage;

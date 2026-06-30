﻿import React, { useState } from 'react';
import Card from '../ui/Card';

// Define a more flexible status type
type ServiceStatus = 'Operational' | 'Degraded' | 'Offline' | 'Checking...';

interface StatusIndicatorProps {
  status: ServiceStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const statusConfig = {
    Operational: { text: 'Operational', bg: 'bg-green-500/20', text_color: 'text-green-700', dot: 'bg-green-400' },
    Degraded: { text: 'Degraded', bg: 'bg-yellow-500/20', text_color: 'text-amber-700', dot: 'bg-yellow-400' },
    Offline: { text: 'Offline', bg: 'bg-red-500/20', text_color: 'text-red-700', dot: 'bg-red-400' },
    'Checking...': { text: 'Checking...', bg: 'bg-blue-500/20', text_color: 'text-blue-700', dot: 'bg-blue-400 animate-pulse' },
  };
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text_color}`}>
      <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${config.dot}`} fill="currentColor" viewBox="0 0 8 8">
        <circle cx={4} cy={4} r={3} />
      </svg>
      {config.text}
    </span>
  );
};

interface Service {
    name: string;
    status: ServiceStatus;
    lastCheck: string;
    details: string;
}

const initialServices: Service[] = [
    { name: 'Web Application', status: 'Operational', lastCheck: '5 minutes ago', details: 'Serving from edge cache.' },
    { name: 'API Gateway', status: 'Operational', lastCheck: '5 minutes ago', details: '2ms average latency.' },
    { name: 'Cloud SQL Primary Database', status: 'Operational', lastCheck: '5 minutes ago', details: 'Region: us-central1 | CPU: 15% | Connections: 12/100' },
    { name: 'Cloud SQL Analytics Replica', status: 'Operational', lastCheck: '5 minutes ago', details: 'Region: us-central1 | Replication Lag: 2s' },
    { name: 'Google Gemini AI Service', status: 'Operational', lastCheck: '5 minutes ago', details: 'Using gemini-2.5-flash | 10ms latency' },
    { name: 'Authentication Service', status: 'Operational', lastCheck: '5 minutes ago', details: 'OAuth 2.0 provider active.' },
    { name: 'Notification Service', status: 'Operational', lastCheck: '5 minutes ago', details: 'Email & SMS delivery active.' },
];

const initialLogs = [
    "[INFO] System initialized successfully.",
    "[INFO] User 'po@saaa.com' authenticated.",
    "[WARN] High memory usage detected on Web Application server.",
    "[INFO] Database connection pool stable."
];

const SystemHealthView: React.FC = () => {
    const [services, setServices] = useState<Service[]>(initialServices);
    const [logs, setLogs] = useState<string[]>(initialLogs);
    const [isChecking, setIsChecking] = useState(false);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 100)); // Keep last 100 logs
    };

    const runDiagnostics = () => {
        if (isChecking) return;

        setIsChecking(true);
        addLog("[INFO] Starting full system diagnostics...");
        setServices(prev => prev.map(s => ({ ...s, status: 'Checking...' })));

        services.forEach((service, index) => {
            setTimeout(() => {
                const isDegraded = Math.random() < 0.1; // 10% chance of being degraded
                const newStatus: ServiceStatus = isDegraded ? 'Degraded' : 'Operational';

                let newDetails = service.details;
                if (service.name.includes('Cloud SQL Primary Database')) {
                    const cpu = Math.floor(Math.random() * 20) + 10; // 10-30%
                    const connections = Math.floor(Math.random() * 20) + 10; // 10-30
                    newDetails = `Region: us-central1 | CPU: ${cpu}% | Connections: ${connections}/100`;
                }
                
                setServices(prev => prev.map(s => s.name === service.name ? { ...s, status: newStatus, lastCheck: 'less than a minute ago', details: newDetails } : s));
                addLog(`[${newStatus === 'Operational' ? 'INFO' : 'WARN'}] ${service.name} check complete. Status: ${newStatus}`);
                
                if (index === services.length - 1) {
                    setIsChecking(false);
                    addLog("[SUCCESS] System diagnostics complete. All services checked.");
                }
            }, (index + 1) * 700); // Stagger the updates
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">System Health &amp; Troubleshooting</h2>
                        <p className="mt-2 text-slate-600">Monitor the real-time status of application services.</p>
                    </div>
                    <button
                        onClick={runDiagnostics}
                        disabled={isChecking}
                        className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait"
                    >
                        {isChecking ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Running...</span></>
                        ) : (
                            <><i className="ri-shield-check-line mr-2"></i><span>Run Diagnostics</span></>
                        )}
                    </button>
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Service Status</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Checked</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-slate-200">
                            {services.map((service) => (
                                <tr key={service.name} className="hover:bg-slate-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{service.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <StatusIndicator status={service.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{service.lastCheck}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{service.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Live Event Log</h3>
                <div className="bg-white text-slate-600 font-mono text-xs rounded-lg p-4 h-64 overflow-y-scroll border border-slate-200 flex flex-col-reverse">
                    <div>
                        {logs.map((log, index) => (
                            <p key={index} className="animate-fade-in">
                                <span className={log.includes('[WARN]') ? 'text-amber-600' : log.includes('[SUCCESS]') ? 'text-green-600' : 'text-blue-600'}>
                                    {log.split(']')[0]}]
                                </span>
                                {log.substring(log.indexOf(']') + 1)}
                            </p>
                        ))}
                    </div>
                </div>
            </Card>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default SystemHealthView;

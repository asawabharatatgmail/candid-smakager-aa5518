import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';
import { NAV_LINKS } from '../../constants';

const statColors = {
  indigo:  { bg: 'bg-indigo-100',  text: 'text-indigo-600',  ring: 'ring-indigo-200' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  violet:  { bg: 'bg-violet-100',  text: 'text-violet-600',  ring: 'ring-violet-200'  },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-600',   ring: 'ring-amber-200'   },
};

type StatColor = keyof typeof statColors;

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: StatColor; sub?: string }> = ({ title, value, icon, color, sub }) => {
  const c = statColors[color];
  return (
    <div className="card flex items-center gap-4 animate-fade-in-up">
      <div className={`stat-icon ${c.bg} ${c.text}`}>
        <i className={`${icon} text-xl`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

const navDescriptions: Record<string, string> = {
  institutes:            'Create and manage client institutes and their subscriptions.',
  'subscription-management': 'View and edit subscription packages and renewals.',
  'subscription-modeler':'Model pricing and feature tiers for new packages.',
  'platform-settings':   'Configure global platform settings and feature flags.',
  'platform-masters':    'Manage master data: categories, tags, and system values.',
  'data-import-settings':'Configure bulk data import templates and field mappings.',
  'system-health':       'Monitor API status, error rates, and server health.',
  'payment-gateway':     'Manage payment gateways, keys, and transaction logs.',
};

const ProductOwnerDashboard: React.FC = () => {
  const { institutes, users, setActiveView, getData } = useAppContext();
  const adminLinks = NAV_LINKS[UserRole.ProductOwner].filter(l => l.key !== 'dashboard');
  const packages = getData('packages');

  const activeInstitutes  = institutes.filter(i => i.subscriptionStatus === 'active').length;
  const totalTeachers     = institutes.reduce((s, i) => s + (packages.find((p: any) => p.id === i.packageId)?.maxTeachers || 0), 0);
  const totalAdmins       = institutes.reduce((s, i) => s + (packages.find((p: any) => p.id === i.packageId)?.maxBranchAdmins || 0), 0);
  const totalUsers        = users.filter(u => u.role !== UserRole.ProductOwner).length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title text-2xl">Product Owner Dashboard</h1>
          <p className="page-sub">Oversee all institutes, subscriptions, and platform health.</p>
        </div>
        <span className="badge badge-indigo">
          <i className="ri-shield-star-line" /> Platform Admin
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Institutes"      value={`${activeInstitutes} / ${institutes.length}`} icon="ri-building-2-line"  color="indigo"  sub="total registered" />
        <StatCard title="Teacher Licences"        value={totalTeachers}   icon="ri-user-3-line"        color="emerald" sub="across all institutes" />
        <StatCard title="Admin Licences"          value={totalAdmins}     icon="ri-admin-line"         color="violet"  sub="branch + class admins" />
        <StatCard title="Total Users"             value={totalUsers}      icon="ri-team-line"          color="amber"   sub="students & staff" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="section-head">Admin Controls</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {adminLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <button
                key={link.key}
                onClick={() => setActiveView(link.key)}
                className="card-hover text-left group animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{navDescriptions[link.key] || `Manage ${link.label.toLowerCase()}.`}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <i className="ri-arrow-right-line ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductOwnerDashboard;

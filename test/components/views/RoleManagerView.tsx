import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { RoleConfig, UserRole } from '../../types';

const ROLE_ICONS: Partial<Record<UserRole, string>> = {
  [UserRole.ClassAdmin]:      '🏫',
  [UserRole.BranchAdmin]:     '🏢',
  [UserRole.Teacher]:         '👨‍🏫',
  [UserRole.Student]:         '👨‍🎓',
  [UserRole.Parent]:          '👨‍👩‍👧',
  [UserRole.ExternalParent]:  '🌐👨‍👩‍👧',
  [UserRole.ExternalStudent]: '🌐👨‍🎓',
};

const RoleManagerView: React.FC = () => {
  const {
    roleConfigs, setRoleConfigs,
    externalParents, externalStudents,
    parentSubscriptions, parentPlans,
  } = useAppContext();

  const toggleActive      = (role: UserRole) => setRoleConfigs(prev => prev.map(rc => rc.role === role ? { ...rc, isActive: !rc.isActive } : rc));
  const toggleRegistration= (role: UserRole) => setRoleConfigs(prev => prev.map(rc => rc.role === role ? { ...rc, registrationOpen: !rc.registrationOpen } : rc));

  const instituteRoles = roleConfigs.filter(rc => rc.isInstituteRole);
  const externalRoles  = roleConfigs.filter(rc => !rc.isInstituteRole);

  // Revenue stats for external roles
  const extParentRevenue = parentSubscriptions.filter(ps => externalParents.some(ep => ep.id === ps.parentId) && ps.status === 'active')
    .reduce((s, ps) => { const p = parentPlans.find(pl => pl.id === ps.planId); return s + (p?.price ?? 0); }, 0);

  const RoleCard: React.FC<{ rc: RoleConfig }> = ({ rc }) => {
    const isExternal = !rc.isInstituteRole;
    const extParentCount = isExternal && rc.role === UserRole.ExternalParent ? externalParents.filter(p => p.isActive).length : 0;
    const extStudentCount = isExternal && rc.role === UserRole.ExternalStudent ? externalStudents.filter(s => s.isActive).length : 0;
    const subscribedCount = rc.role === UserRole.ExternalParent
      ? parentSubscriptions.filter(ps => externalParents.some(ep => ep.id === ps.parentId) && ps.status === 'active').length
      : 0;

    return (
      <div className={`bg-white rounded-2xl border-2 p-5 transition-all ${rc.isActive ? 'border-slate-200 hover:border-indigo-200' : 'border-slate-100 opacity-60'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ROLE_ICONS[rc.role] ?? '👤'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">{rc.label}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${rc.revenueStream === 'direct' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {rc.revenueStream === 'direct' ? '💰 Direct Revenue' : '🏫 Institute Revenue'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{rc.description}</p>
            </div>
          </div>
        </div>

        {/* Stats for external roles */}
        {isExternal && (
          <div className="grid grid-cols-3 gap-3 mb-4 bg-slate-50 rounded-xl p-3">
            {rc.role === UserRole.ExternalParent && (
              <>
                <div className="text-center">
                  <p className="text-xl font-black text-slate-800">{extParentCount}</p>
                  <p className="text-xs text-slate-400">Registered</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-green-600">{subscribedCount}</p>
                  <p className="text-xs text-slate-400">Subscribed</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-black text-indigo-600">₹{extParentRevenue}</p>
                  <p className="text-xs text-slate-400">MRR</p>
                </div>
              </>
            )}
            {rc.role === UserRole.ExternalStudent && (
              <div className="col-span-3 text-center">
                <p className="text-xl font-black text-slate-800">{extStudentCount}</p>
                <p className="text-xs text-slate-400">Registered External Students</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {/* Active/Inactive toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-slate-700">Role Active</p>
              <p className="text-xs text-slate-400">Users of this role can log in to the platform</p>
            </div>
            <button
              onClick={() => toggleActive(rc.role)}
              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${rc.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${rc.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Registration Open toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-slate-700">Registration Open</p>
              <p className="text-xs text-slate-400">New users can self-register for this role</p>
            </div>
            <button
              onClick={() => toggleRegistration(rc.role)}
              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${rc.registrationOpen ? 'bg-indigo-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${rc.registrationOpen ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Status summary */}
        <div className="mt-3 flex gap-2">
          <span className={`badge text-xs ${rc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {rc.isActive ? '✓ Active' : '✕ Disabled'}
          </span>
          <span className={`badge text-xs ${rc.registrationOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
            {rc.registrationOpen ? '🔓 Open Registration' : '🔒 Closed Registration'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Role Manager</h2>
        <p className="text-sm text-slate-500 mt-1">
          Control which roles are active on the platform and whether self-registration is open.
          <span className="text-green-600 font-medium"> External roles are independent revenue streams — not linked to any institute.</span>
        </p>
      </div>

      {/* Revenue Summary */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-5 text-white">
        <h3 className="font-bold text-lg mb-3">External Revenue Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-black">{externalParents.filter(p => p.isActive).length}</p>
            <p className="text-green-100 text-xs">External Parents</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-black">{externalStudents.filter(s => s.isActive).length}</p>
            <p className="text-green-100 text-xs">External Students</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-black">₹{extParentRevenue.toLocaleString()}</p>
            <p className="text-green-100 text-xs">Monthly Direct Revenue</p>
          </div>
        </div>
      </div>

      {/* External Roles (Direct Revenue) */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-bold text-slate-800">🌐 External Roles</h3>
          <span className="badge bg-green-100 text-green-700 text-xs">Direct Revenue — Independent of Institutes</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {externalRoles.map(rc => <RoleCard key={rc.role} rc={rc} />)}
        </div>
      </div>

      {/* Institute Roles */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-bold text-slate-800">🏫 Institute Roles</h3>
          <span className="badge bg-blue-100 text-blue-700 text-xs">Institute Revenue — Linked to Subscriptions</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {instituteRoles.map(rc => <RoleCard key={rc.role} rc={rc} />)}
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">⚠️ Important</p>
        <p>Disabling a role prevents existing users of that role from logging in. It does not delete their data. Re-enabling the role restores access immediately.</p>
      </div>
    </div>
  );
};

export default RoleManagerView;

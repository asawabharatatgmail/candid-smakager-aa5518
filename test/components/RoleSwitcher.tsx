import React from 'react';
import { UserRole } from '../types';
import { useAppContext } from '../context/AppContext';

const RoleSwitcher: React.FC = () => {
  const { currentRole, switchRole, originalUser, exitImpersonation } = useAppContext();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    if (selectedRole === "exit_impersonation") {
      exitImpersonation();
    } else {
      switchRole(selectedRole as UserRole);
    }
  };

  return (
    <div className="relative">
      <select
        value={originalUser ? currentRole : "admin_view"}
        onChange={handleRoleChange}
        style={{ backgroundColor: '#1e3a8a', color: '#ffffff', borderColor: '#3b82f6' }}
        className="appearance-none w-full border py-1.5 pl-3 pr-8 rounded-lg leading-tight focus:outline-none text-xs font-semibold cursor-pointer"
      >
        {originalUser ? (
          <>
            <option value={currentRole}>Viewing as {currentRole}</option>
            <option value="exit_impersonation">Back to Admin View</option>
          </>
        ) : (
          <option value="admin_view" disabled>View As...</option>
        )}
        {[UserRole.Student, UserRole.Teacher]
          .filter(role => role !== currentRole) // Don't show the current role in the options
          .map(role => (
            <option key={role} value={role}>{role}</option>
          ))
        }
      </select>
       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2" style={{ color: '#93c5fd' }}>
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default RoleSwitcher;
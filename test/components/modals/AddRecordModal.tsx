
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ManagementCategory, ManagementField, UserRole } from '../../types';
import { MANAGEMENT_CONFIG } from '../../constants';

interface AddRecordModalProps {
  category: ManagementCategory;
  recordToEdit?: any | null;
  onClose: () => void;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({ category, recordToEdit, onClose }) => {
  const { addRecord, updateRecord, getData, settings, users, currentSubscription } = useAppContext();
  const config = MANAGEMENT_CONFIG[category];
  const isEditMode = !!recordToEdit;

  const getInitialFormData = () => {
    const initialData = config.fields.reduce((acc, field) => {
        if (field.type === 'multiselect') {
            acc[field.name] = [];
        } else if (field.type === 'toggle') {
            acc[field.name] = true;
        } else if (field.type === 'number') {
            acc[field.name] = 0;
        } else {
            acc[field.name] = '';
        }
        return acc;
    }, {} as any);
    
    if (isEditMode) {
      return { ...initialData, ...recordToEdit };
    }
    
    return initialData;
  };
  
  const [formData, setFormData] = useState<any>(getInitialFormData);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'select-multiple') {
        const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions).map(option => option.value);
        setFormData({ ...formData, [name]: selectedOptions });
    } else if (type === 'checkbox') {
        setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleToggle = (name: string) => {
      setFormData({ ...formData, [name]: !formData[name] });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    for (const field of config.fields) {
      if (field.required && !isEditMode && (!formData[field.name] || (Array.isArray(formData[field.name]) && formData[field.name].length === 0))) {
        // Skip branch validation if multi-branch is disabled
        if (field.name === 'branchIds' && !settings.multiBranchEnabled) {
          continue;
        }
        setError(`Field "${field.label}" is required.`);
        return;
      }
    }

    if (isEditMode) {
      updateRecord(category, recordToEdit.id, formData);
    } else {
        if (category === 'users') {
            const role = formData.role;
            const currentUsersOfRole = users.filter(u => u.role === role).length;
            if (role === UserRole.Teacher && currentUsersOfRole >= currentSubscription.maxTeachers) {
                setError(`Cannot add new teacher. The license limit of ${currentSubscription.maxTeachers} has been reached for this institute.`);
                return;
            }
            if (role === UserRole.BranchAdmin && currentUsersOfRole >= currentSubscription.maxBranchAdmins) {
                setError(`Cannot add new branch admin. The license limit of ${currentSubscription.maxBranchAdmins} has been reached for this institute.`);
                return;
            }
        }
        addRecord(category, formData);
    }
    onClose();
  };
  
  const renderField = (field: ManagementField) => {
    if (field.name === 'branchIds' && !settings.multiBranchEnabled) {
      return null;
    }
    
    if (field.type === 'select' || field.type === 'multiselect') {
        const options = field.optionsFromContext ? getData(field.optionsFromContext) : (field.options || []);
        return (
            <select
                name={field.name}
                id={field.name}
                multiple={field.type === 'multiselect'}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required && !isEditMode}
                className="select-field mt-1"
            >
                {field.type === 'select' && <option value="">Select {field.label}</option>}
                {options.map((opt: any) => (
                    <option key={opt.id || opt} value={opt.id || opt}>
                        {opt.name || opt}
                    </option>
                ))}
            </select>
        );
    }
    
    if (field.type === 'toggle') {
        return (
             <button
                type="button"
                onClick={() => handleToggle(field.name)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    formData[field.name] ? 'bg-indigo-600' : 'bg-slate-600'
                }`}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        formData[field.name] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        )
    }
    
    if(field.type === 'textarea') {
      return (
        <textarea
            name={field.name}
            id={field.name}
            rows={3}
            required={field.required && !isEditMode}
            value={formData[field.name] || ''}
            onChange={handleChange}
            className="input-field mt-1"
        />
      );
    }

    return (
        <input
            type={field.type}
            name={field.name}
            id={field.name}
            required={field.required && !isEditMode}
            value={formData[field.name] || ''}
            onChange={handleChange}
            className="input-field mt-1"
        />
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">{isEditMode ? 'Edit' : 'Add New'} {config.label.slice(0, -1)}</h2>
          <button onClick={onClose} className="btn-icon"><i className="ri-close-line text-lg" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map((field) => (
                (field.name === 'branchIds' && !settings.multiBranchEnabled) ? null :
                <div key={field.name} className={field.type === 'toggle' ? 'flex items-center justify-between col-span-1 border border-slate-100 bg-slate-50 p-3 rounded-xl' : 'col-span-1'}>
                <label htmlFor={field.name} className="block text-sm font-medium text-slate-700 mb-1">
                    {field.label}
                </label>
                {renderField(field)}
                </div>
            ))}
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mt-2">{error}</p>}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Record</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;
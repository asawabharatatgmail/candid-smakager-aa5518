﻿import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ManagementCategory, Lead, LeadStatus } from '../../types';
import AddRecordModal from '../modals/AddRecordModal';
import BulkUploadModal from '../modals/BulkUploadModal';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import { MANAGEMENT_CONFIG, ResetPasswordIcon, EditIcon } from '../../constants';
import PasswordResetModal from '../modals/PasswordResetModal';

const DeleteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

interface ManagementViewProps {
  category: ManagementCategory;
  renderActions?: (item: any) => React.ReactNode;
}

const ManagementView: React.FC<ManagementViewProps> = ({ category, renderActions }) => {
  const { getData, settings, updateRecord, getContextData, deleteRecord } = useAppContext();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isBulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [passwordResetTarget, setPasswordResetTarget] = useState<{ name: string; email: string; mobile: string } | null>(null);

  const config = MANAGEMENT_CONFIG[category];
  const rawData = getData(category);

  const data = useMemo(() => {
    if (category === 'leads') {
      return [...rawData].sort((a: Lead, b: Lead) => {
        const aQ = a.status === LeadStatus.Qualified;
        const bQ = b.status === LeadStatus.Qualified;
        if (aQ && !bQ) return -1;
        if (!aQ && bQ) return 1;
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      });
    }
    return rawData;
  }, [rawData, category]);

  if (!config) {
    return (
      <div className="card">
        <p className="text-slate-500">Error: Invalid management category specified.</p>
      </div>
    );
  }

  const handleToggleStatus = (record: any) => {
    updateRecord(category, record.id, { status: record.status === 'active' ? 'inactive' : 'active' });
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setAddModalOpen(true);
  };

  const closeModal = () => {
    setAddModalOpen(false);
    setEditingRecord(null);
  };

  const columnsWithActions = [...config.columns, { header: 'Actions', accessor: 'actions' as any }];

  return (
    <div className="space-y-5 animate-fade-in">
      {config.fields.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="btn-secondary"
          >
            <i className="ri-upload-cloud-2-line mr-1.5" /> Bulk Upload CSV
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="btn-primary"
          >
            <i className="ri-add-line mr-1" /> Add {config.label.slice(0, -1)}
          </button>
        </div>
      )}

      <div className="table-wrap">
        <table className="min-w-full">
          <thead>
            <tr className="table-head">
              {columnsWithActions.map(col => (
                <th key={String(col.header)} className="table-th">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length > 0 ? (
              data.map(item => (
                <tr
                  key={item.id}
                  className={`table-row ${
                    category === 'leads' && item.status === LeadStatus.Qualified
                      ? 'bg-emerald-50'
                      : item.status === 'inactive'
                      ? 'opacity-60'
                      : ''
                  }`}
                >
                  {columnsWithActions.map(col => (
                    <td key={String(col.accessor)} className="table-td">
                      {col.accessor === 'actions' ? (
                        <div className="flex items-center gap-2">
                          {renderActions ? renderActions(item) : (
                            <>
                              {['institutes', 'branches', 'users', 'students', 'teachers', 'classes', 'subjects', 'feeHeads', 'discounts'].includes(category) && (
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  title="Edit"
                                >
                                  <EditIcon className="w-4 h-4" />
                                </button>
                              )}

                              {item.hasOwnProperty('status') && (
                                <button
                                  onClick={() => handleToggleStatus(item)}
                                  className={`p-1.5 rounded-md transition-colors ${
                                    item.status === 'active'
                                      ? 'text-emerald-500 hover:bg-emerald-50'
                                      : 'text-slate-500 hover:bg-slate-100'
                                  }`}
                                  title={item.status === 'active' ? 'Deactivate' : 'Activate'}
                                >
                                  <i className={`text-base ${item.status === 'active' ? 'ri-toggle-fill' : 'ri-toggle-line'}`} />
                                </button>
                              )}

                              {(category === 'institutes' || ['users', 'students', 'teachers'].includes(category)) && (
                                <button
                                  onClick={() => setPasswordResetTarget({
                                    name: item.name,
                                    email: item.adminEmail || item.email,
                                    mobile: item.adminMobile || item.mobile
                                  })}
                                  className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  title="Reset Password"
                                >
                                  <ResetPasswordIcon className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                                className="p-1.5 rounded-md text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <DeleteIcon />
                              </button>
                            </>
                          )}
                        </div>
                      ) : 'render' in col && col.render ? (
                        col.render(item, { settings, getContextData })
                      ) : (
                        <span className="text-slate-700">{item[col.accessor]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnsWithActions.length} className="px-6 py-12 text-center">
                  <div className="empty-state">
                    <i className="ri-inbox-line text-4xl text-slate-600 mb-2 block" />
                    <p className="text-slate-500 font-medium">No records found</p>
                    <p className="text-slate-500 text-xs mt-1">Add a new record to get started.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddRecordModal category={category} recordToEdit={editingRecord} onClose={closeModal} />
      )}
      {isBulkModalOpen && (
        <BulkUploadModal category={category} onClose={() => setBulkModalOpen(false)} />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          categoryLabel={config.label.slice(0, -1)}
          itemName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => { deleteRecord(category, deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
      {passwordResetTarget && (
        <PasswordResetModal
          name={passwordResetTarget.name}
          email={passwordResetTarget.email}
          mobile={passwordResetTarget.mobile}
          onClose={() => setPasswordResetTarget(null)}
        />
      )}
    </div>
  );
};

export default ManagementView;

import React from 'react';

interface ConfirmDeleteModalProps {
  categoryLabel: string;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ categoryLabel, itemName, onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0">
            <i className="ri-delete-bin-line text-lg" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Delete {categoryLabel}</h2>
        </div>
        <p className="text-slate-600 text-sm mb-6">
          Are you sure you want to delete <strong className="text-slate-900">"{itemName}"</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="button" onClick={onConfirm} className="btn-danger">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

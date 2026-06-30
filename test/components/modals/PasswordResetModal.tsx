import React from 'react';

interface PasswordResetModalProps {
  name: string;
  email: string;
  mobile: string;
  onClose: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ name, email, mobile, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md text-center animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <i className="ri-mail-check-line text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Password Reset Initiated</h2>
        <p className="text-slate-600 text-sm mb-1">
          A password reset link has been sent for <strong className="text-slate-800">{name}</strong>.
        </p>
        <p className="text-xs text-slate-500 mb-6">
          Email: {email} &nbsp;·&nbsp; Mobile: {mobile}
        </p>
        <button type="button" onClick={onClose} className="btn-primary w-full">OK</button>
      </div>
    </div>
  );
};

export default PasswordResetModal;

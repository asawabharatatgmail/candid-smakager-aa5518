import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const ConnectEmailModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { currentUser, connectEmail } = useAppContext();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const handleConnect = () => {
        setIsConnecting(true);
        // Simulate API call for OAuth
        setTimeout(() => {
            connectEmail();
            setIsConnecting(false);
            setIsConnected(true);
        }, 1500);
    };
    
    useEffect(() => {
        if (isConnected) {
            // Close modal after showing success message
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isConnected, onClose]);


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center border border-slate-200 animate-scale-in">
                {!isConnected ? (
                    <>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 mb-4">
                            <i className="ri-google-fill text-2xl text-slate-600"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect your Google Account</h2>
                        <p className="text-slate-600 mb-6">
                            Connect your account to streamline communication. You will be asked to grant permission to access your email.
                        </p>
                        <p className="text-sm bg-slate-50 border border-slate-200 rounded-md p-2 mb-6">
                            You are connecting as: <span className="font-semibold text-indigo-600">{currentUser?.email}</span>
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isConnecting}
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center"
                            >
                                {isConnecting && <i className="ri-loader-4-line animate-spin mr-2"></i>}
                                {isConnecting ? 'Connecting...' : 'Connect with Google'}
                            </button>
                        </div>
                    </>
                ) : (
                     <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10 mb-4">
                            <i className="ri-check-double-line text-2xl text-green-600"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Connected!</h2>
                        <p className="text-slate-600 mb-6">Your Google account <span className="font-semibold text-green-600">{currentUser?.email}</span> has been successfully connected.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectEmailModal;

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { requestPasswordReset } = useAppContext();
    const [identifier, setIdentifier] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await requestPasswordReset(identifier);
            // We show the success message regardless of whether the user was found
            // This is a security best practice to prevent user enumeration.
            setIsSubmitted(true);
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full border border-slate-200 animate-scale-in">
                {!isSubmitted ? (
                    <>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Your Password</h2>
                        <p className="text-slate-600 mb-6">Enter your email or mobile number and we'll send you a link to get back into your account.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="reset-identifier" className="block text-sm font-medium text-slate-600">
                                    Email or Mobile Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="reset-identifier"
                                        name="reset-identifier"
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
                                >
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10 mb-4">
                            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email/SMS</h2>
                        <p className="text-slate-600 mb-6">If an account with that email or mobile exists, we have sent a password reset link.</p>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                        >
                            OK
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
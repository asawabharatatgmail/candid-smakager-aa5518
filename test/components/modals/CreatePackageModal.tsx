

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { BASIC_PACKAGE } from '../../constants';

interface CreatePackageModalProps {
    onClose: () => void;
}

const CreatePackageModal: React.FC<CreatePackageModalProps> = ({ onClose }) => {
    const { addPackage } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [markup, setMarkup] = useState(100); // Default to 100% markup
    const [maxStudents, setMaxStudents] = useState(Math.round(BASIC_PACKAGE.maxStudents * (1 + 100 / 100)));
    const [maxTeachers, setMaxTeachers] = useState(Math.round(BASIC_PACKAGE.maxTeachers * (1 + 100 / 100)));
    const [maxBranchAdmins, setMaxBranchAdmins] = useState(Math.round(BASIC_PACKAGE.maxBranchAdmins * (1 + 100 / 100)));

    const newPrice = useMemo(() => {
        return Math.round(BASIC_PACKAGE.price * (1 + markup / 100));
    }, [markup]);

    const handleMarkupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMarkup = Number(e.target.value);
        setMarkup(newMarkup);
        // Auto-adjust limits based on markup, as a suggestion
        const multiplier = 1 + newMarkup / 100;
        setMaxStudents(Math.round(BASIC_PACKAGE.maxStudents * multiplier));
        setMaxTeachers(Math.round(BASIC_PACKAGE.maxTeachers * multiplier));
        setMaxBranchAdmins(Math.round(BASIC_PACKAGE.maxBranchAdmins * multiplier));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newPackage = {
            id: `package_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
            name,
            price: newPrice,
            description,
            features: [
                ...BASIC_PACKAGE.features,
                'Increased user limits',
                'Priority Support (Placeholder)',
            ],
            maxStudents,
            maxTeachers,
            maxBranchAdmins,
        };
        addPackage(newPackage);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full border border-slate-200 animate-scale-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Create New Subscription Package</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-600">Package Name</label>
                            <input type="text" name="name" id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Professional" className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="markup" className="block text-sm font-medium text-slate-600">Markup on Basic Plan (%)</label>
                            <input type="number" name="markup" id="markup" value={markup} onChange={handleMarkupChange} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-600">Description</label>
                        <input type="text" name="description" id="description" value={description} onChange={e => setDescription(e.target.value)} required placeholder="A brief description of this package" className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                        <p className="text-sm text-slate-500">Basic Price: ₹{BASIC_PACKAGE.price.toLocaleString()}</p>
                        <p className="text-2xl font-bold text-indigo-600">New Calculated Price: ₹{newPrice.toLocaleString()}/mo</p>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-2">User Limits</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label htmlFor="maxStudents" className="block text-xs font-medium text-slate-500">Max Students</label>
                                <input type="number" name="maxStudents" id="maxStudents" value={maxStudents} onChange={e => setMaxStudents(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                            </div>
                             <div>
                                <label htmlFor="maxTeachers" className="block text-xs font-medium text-slate-500">Max Teachers</label>
                                <input type="number" name="maxTeachers" id="maxTeachers" value={maxTeachers} onChange={e => setMaxTeachers(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                            </div>
                             <div>
                                <label htmlFor="maxBranchAdmins" className="block text-xs font-medium text-slate-500">Max Branch Admins</label>
                                <input type="number" name="maxBranchAdmins" id="maxBranchAdmins" value={maxBranchAdmins} onChange={e => setMaxBranchAdmins(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Create Package</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePackageModal;
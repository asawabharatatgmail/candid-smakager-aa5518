﻿import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { FUNCTIONALITY_BASE_COSTS } from '../../constants';
import { SubscriptionPackage, FunctionalityCost } from '../../types';

const getInitialTierSelections = () => {
    const selections: { [key: string]: string } = {};
    FUNCTIONALITY_BASE_COSTS.forEach(func => {
        if (func.tiers && func.tiers.length > 0) {
            selections[func.id] = func.tiers[0].name; // Default to the first tier
        }
    });
    return selections;
};


const SubscriptionModelerView: React.FC = () => {
    const [licenses, setLicenses] = useState({ students: 100, teachers: 10, admins: 2 });
    const [selectedFuncs, setSelectedFuncs] = useState<string[]>(FUNCTIONALITY_BASE_COSTS.map(f => f.id));
    const [selectedTiers, setSelectedTiers] = useState<{ [key: string]: string }>(getInitialTierSelections());
    const [markup, setMarkup] = useState(100);
    const [packageName, setPackageName] = useState('');
    const [packageDescription, setPackageDescription] = useState('');
    const { addPackage } = useAppContext();

    const { baseCost, finalPrice } = useMemo(() => {
        let cost = 0;
        selectedFuncs.forEach(funcId => {
            const func = FUNCTIONALITY_BASE_COSTS.find(f => f.id === funcId);
            if (!func) return;

            let unitCost = 0;
            if (func.tiers) {
                const selectedTierName = selectedTiers[func.id];
                const tier = func.tiers.find(t => t.name === selectedTierName);
                if (tier) {
                    unitCost = tier.cost;
                }
            } else {
                unitCost = func.cost || 0;
            }

            switch (func.unit) {
                case 'student': cost += unitCost * licenses.students; break;
                case 'teacher': cost += unitCost * licenses.teachers; break;
                case 'admin': cost += unitCost * licenses.admins; break;
                case 'institute': cost += unitCost; break;
            }
        });
        const final = cost * (1 + markup / 100);
        return { baseCost: cost, finalPrice: Math.ceil(final / 50) * 50 };
    }, [licenses, selectedFuncs, markup, selectedTiers]);

    const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLicenses(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleFuncToggle = (funcId: string) => {
        setSelectedFuncs(prev =>
            prev.includes(funcId) ? prev.filter(id => id !== funcId) : [...prev, funcId]
        );
    };

    const handleTierChange = (funcId: string, tierName: string) => {
        setSelectedTiers(prev => ({...prev, [funcId]: tierName}));
    };

    const handleCreatePackage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!packageName.trim() || !packageDescription.trim()) {
            alert('Please provide a name and description for the new package.');
            return;
        }

        const features = FUNCTIONALITY_BASE_COSTS
            .filter(f => selectedFuncs.includes(f.id))
            .map(f => {
                if (f.tiers) {
                    const selectedTierName = selectedTiers[f.id];
                    return `${f.name} (${selectedTierName})`;
                }
                return f.name;
            });

        const newPackage: SubscriptionPackage = {
            id: `package_${packageName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
            name: packageName,
            description: packageDescription,
            price: finalPrice,
            features,
            maxStudents: licenses.students,
            maxTeachers: licenses.teachers,
            maxBranchAdmins: licenses.admins,
        };
        
        addPackage(newPackage);
        setPackageName('');
        setPackageDescription('');
        alert('New package created successfully! You can now assign it to an institute.');
    };
    
    const renderFunctionality = (func: FunctionalityCost) => {
        const isSelected = selectedFuncs.includes(func.id);
        
        if (func.tiers) {
            return (
                <div key={func.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <label htmlFor={`func-${func.id}`} className="flex items-start cursor-pointer">
                         <input
                            type="checkbox"
                            id={`func-${func.id}`}
                            checked={isSelected}
                            onChange={() => handleFuncToggle(func.id)}
                            className="h-5 w-5 mt-0.5 text-indigo-600 border-gray-500 rounded focus:ring-indigo-500 bg-slate-200"
                        />
                         <div className="ml-3 text-sm">
                            <p className="font-medium text-slate-800">{func.name}</p>
                            <p className="text-slate-500 text-xs">{func.description}</p>
                        </div>
                    </label>
                    {isSelected && (
                        <div className="mt-3 ml-8 space-y-2">
                            {func.tiers.map(tier => (
                                <label key={tier.name} htmlFor={`${func.id}-${tier.name}`} className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        id={`${func.id}-${tier.name}`}
                                        name={func.id}
                                        value={tier.name}
                                        checked={selectedTiers[func.id] === tier.name}
                                        onChange={() => handleTierChange(func.id, tier.name)}
                                        className="h-4 w-4 text-indigo-600 border-gray-500 focus:ring-indigo-500 bg-slate-200"
                                    />
                                    <div className="ml-2 text-xs">
                                        <span className="font-semibold text-slate-600">{tier.name}</span>
                                        <span className="text-slate-500"> - {tier.description} (₹{tier.cost}/{func.unit})</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )
        }
        
        return (
            <label key={func.id} htmlFor={`func-${func.id}`} className="flex items-start p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <input
                    type="checkbox"
                    id={`func-${func.id}`}
                    checked={isSelected}
                    onChange={() => handleFuncToggle(func.id)}
                    className="h-5 w-5 mt-0.5 text-indigo-600 border-gray-500 rounded focus:ring-indigo-500 bg-slate-200"
                />
                <div className="ml-3 text-sm">
                    <p className="font-medium text-slate-800">{func.name}</p>
                    <p className="text-slate-500 text-xs">{func.description} (₹{func.cost}/{func.unit})</p>
                </div>
            </label>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-3xl font-bold text-slate-900">Subscription Modeler</h2>
                <p className="text-slate-600 mt-1">Design new subscription packages by modeling costs based on licenses and features.</p>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Step 1: Define License Counts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="students" className="block text-sm font-medium text-slate-600">Students</label>
                                <input type="number" name="students" id="students" value={licenses.students} onChange={handleLicenseChange} className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="teachers" className="block text-sm font-medium text-slate-600">Teachers</label>
                                <input type="number" name="teachers" id="teachers" value={licenses.teachers} onChange={handleLicenseChange} className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="admins" className="block text-sm font-medium text-slate-600">Admins</label>
                                <input type="number" name="admins" id="admins" value={licenses.admins} onChange={handleLicenseChange} className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Step 2: Select Functionalities & AI Tiers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {FUNCTIONALITY_BASE_COSTS.map(renderFunctionality)}
                        </div>
                    </Card>
                </div>
                <div className="lg:sticky top-6 self-start">
                    <Card>
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Summary & Creation</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="markup" className="block text-sm font-medium text-slate-600">Step 3: Business Markup ({markup}%)</label>
                                <input type="range" min="0" max="300" step="10" id="markup" value={markup} onChange={e => setMarkup(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                            </div>

                            <div className="bg-white/50 p-4 rounded-lg border border-slate-200 text-center">
                                <p className="text-sm text-slate-500">Total Base Infrastructure Cost</p>
                                <p className="text-2xl font-bold text-slate-800">₹{baseCost.toLocaleString()}/mo</p>
                                <hr className="border-slate-200 my-2" />
                                <p className="text-sm font-semibold text-indigo-700">Suggested Monthly Price</p>
                                <p className="text-4xl font-extrabold text-indigo-400">₹{finalPrice.toLocaleString()}/mo</p>
                            </div>
                            
                            <form onSubmit={handleCreatePackage} className="space-y-4 pt-4 border-t border-slate-200">
                                <h4 className="text-lg font-semibold text-slate-800">Step 4: Create Package</h4>
                                <div>
                                    <label htmlFor="packageName" className="block text-sm font-medium text-slate-600">Package Name</label>
                                    <input type="text" id="packageName" value={packageName} onChange={e => setPackageName(e.target.value)} required placeholder="e.g., Enterprise Plan" className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="packageDescription" className="block text-sm font-medium text-slate-600">Description</label>
                                    <textarea id="packageDescription" value={packageDescription} onChange={e => setPackageDescription(e.target.value)} required rows={2} placeholder="A brief description for this package" className="mt-1 block w-full px-3 py-2 bg-slate-100 border-slate-200 rounded-md"></textarea>
                                </div>
                                <button type="submit" className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                                    Save New Package
                                </button>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModelerView;
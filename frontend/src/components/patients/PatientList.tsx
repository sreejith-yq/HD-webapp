import React, { useState } from 'react';

interface Patient {
    id: string;
    name: string;
    phone: string;
    avatarUrl: string | null;
    program?: {
        name: string;
        color: string;
    };
}

interface PatientListProps {
    patients: Patient[];
    selectedId: string | null;
    onSelect: (patient: Patient) => void;
    onSearch: (query: string) => void;
}

export function PatientList({ patients, selectedId, onSelect, onSearch }: PatientListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full md:w-80 lg:w-96">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Patients</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {patients.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No patients found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {patients.map((patient) => (
                            <div
                                key={patient.id}
                                onClick={() => onSelect(patient)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === patient.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative flex-shrink-0">
                                        {patient.avatarUrl ? (
                                            <img src={patient.avatarUrl} alt={patient.name} className="w-12 h-12 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                {patient.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-medium truncate ${selectedId === patient.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                            {patient.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate">{patient.phone}</p>
                                        {patient.program && (
                                            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                                {patient.program.name}
                                            </div>
                                        )}
                                    </div>
                                    <svg className={`w-5 h-5 ${selectedId === patient.id ? 'text-blue-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

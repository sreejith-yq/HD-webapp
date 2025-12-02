import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface NewConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (patientId: string) => void;
}

export function NewConversationModal({ isOpen, onClose, onStart }: NewConversationModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            // Load initial list (optional, or just wait for search)
            loadInitialPatients();
        }
    }, [isOpen]);

    const loadInitialPatients = async () => {
        setIsLoading(true);
        try {
            const res = await api.patients.list({ limit: 10 });
            setResults(res.data);
        } catch (error) {
            console.error('Failed to load patients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length >= 2) {
            setIsLoading(true);
            try {
                const res = await api.patients.search(val);
                setResults(res.data);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsLoading(false);
            }
        } else if (val.length === 0) {
            loadInitialPatients();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">New Conversation</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search patients by name or phone..."
                            value={query}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No patients found.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {results.map((patient) => (
                                <button
                                    key={patient.id}
                                    onClick={() => onStart(patient.id)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-colors text-left group"
                                >
                                    <div className="relative flex-shrink-0">
                                        {patient.avatarUrl ? (
                                            <img src={patient.avatarUrl} alt={patient.name} className="w-10 h-10 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {patient.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">{patient.name}</h3>
                                        <p className="text-xs text-gray-500">{patient.program?.name || 'No active program'}</p>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

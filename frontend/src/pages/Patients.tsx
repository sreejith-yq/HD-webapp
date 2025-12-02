import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PatientList } from '../components/patients/PatientList';
import { PatientProfile } from '../components/patients/PatientProfile';

export function Patients() {
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPatients = async (params = {}) => {
        try {
            const res = await api.patients.list(params);
            setPatients(res.data);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleSearch = async (query: string) => {
        if (query.length >= 2) {
            try {
                const res = await api.patients.search(query);
                setPatients(res.data);
            } catch (error) {
                console.error('Search failed:', error);
            }
        } else if (query.length === 0) {
            fetchPatients();
        }
    };

    if (isLoading && !patients.length) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100 overflow-hidden">
            {/* List View - Hidden on mobile if profile is open */}
            <div className={`${selectedPatient ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full`}>
                <PatientList
                    patients={patients}
                    selectedId={selectedPatient?.id}
                    onSelect={setSelectedPatient}
                    onSearch={handleSearch}
                />
            </div>

            {/* Profile Area */}
            {selectedPatient ? (
                <div className="flex-1 flex flex-col h-full relative">
                    {/* Mobile Back Button */}
                    <div className="md:hidden bg-white p-4 border-b border-gray-200 flex items-center gap-2">
                        <button onClick={() => setSelectedPatient(null)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="font-bold text-gray-900">Back to List</span>
                    </div>

                    <PatientProfile patientId={selectedPatient.id} />
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 text-gray-400 flex-col">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium">Select a patient to view details</p>
                </div>
            )}
        </div>
    );
}

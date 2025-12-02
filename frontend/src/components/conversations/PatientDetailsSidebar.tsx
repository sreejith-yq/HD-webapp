import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface PatientDetailsSidebarProps {
    patientId: string;
    onClose: () => void;
}

export function PatientDetailsSidebar({ patientId, onClose }: PatientDetailsSidebarProps) {
    const [patient, setPatient] = useState<any>(null);
    const [vitals, setVitals] = useState<any>(null);
    const [programs, setPrograms] = useState<any>(null);
    const [prescriptions, setPrescriptions] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [patientRes, vitalsRes, programsRes, prescriptionsRes] = await Promise.all([
                    api.patients.get(patientId),
                    api.patients.getVitals(patientId),
                    api.patients.getPrograms(patientId),
                    api.patients.getPrescriptions(patientId),
                ]);

                setPatient(patientRes.data);
                setVitals(vitalsRes.data);
                setPrograms(programsRes.data);
                setPrescriptions(prescriptionsRes.data);
            } catch (error) {
                console.error('Failed to fetch patient details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (patientId) {
            fetchData();
        }
    }, [patientId]);

    if (isLoading) {
        return <div className="w-80 bg-white border-l border-gray-200 p-4 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    if (!patient) return null;

    return (
        <div className="w-full md:w-80 lg:w-96 bg-gray-50 border-l border-gray-200 h-full overflow-y-auto flex flex-col">
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                <h3 className="font-bold text-gray-900">Patient Details</h3>
                <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-6 text-center bg-white mb-2">
                <div className="mx-auto mb-3 relative inline-block">
                    {patient.avatarUrl ? (
                        <img src={patient.avatarUrl} alt={patient.name} className="w-20 h-20 rounded-2xl object-cover" />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl">
                            {patient.name.charAt(0)}
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                <p className="text-sm text-gray-500">{patient.phone}</p>
                {patient.currentProgram && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {patient.currentProgram.name}
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4">
                {/* Vitals */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-3">Latest Vitals</h4>
                    {vitals ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Blood Pressure</span>
                                <span className="font-medium text-gray-900">{vitals.systolic}/{vitals.diastolic} mmHg</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Heart Rate</span>
                                <span className="font-medium text-gray-900">{vitals.heartRate} bpm</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Weight</span>
                                <span className="font-medium text-gray-900">{vitals.weight} kg</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No vitals recorded</p>
                    )}
                </div>

                {/* Programs */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-3">Programs</h4>
                    {programs?.myPrograms.map((prog: any) => (
                        <div key={prog.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg mb-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{prog.program.name}</p>
                                <p className="text-xs text-gray-500">{prog.status}</p>
                            </div>
                        </div>
                    ))}
                    {programs?.otherPrograms.activeCount > 0 && (
                        <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 text-xs font-medium flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {programs.otherPrograms.activeCount} other active programs
                        </div>
                    )}
                </div>

                {/* Prescriptions */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wide text-indigo-600">Prescriptions</h4>
                        <button className="text-xs text-indigo-600 font-medium hover:underline">View All</button>
                    </div>
                    {prescriptions?.myPrescriptions.slice(0, 2).map((rx: any) => (
                        <div key={rx.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg mb-2">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{rx.title}</p>
                                <p className="text-xs text-gray-500">{new Date(rx.prescribedDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface PatientProfileProps {
    patientId: string;
}

export function PatientProfile({ patientId }: PatientProfileProps) {
    const [patient, setPatient] = useState<any>(null);
    const [vitals, setVitals] = useState<any>(null);
    const [programs, setPrograms] = useState<any>(null);
    const [prescriptions, setPrescriptions] = useState<any>(null);
    const [labReports, setLabReports] = useState<any>(null);
    const [historyRequest, setHistoryRequest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRequestingHistory, setIsRequestingHistory] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [patientRes, vitalsRes, programsRes, prescriptionsRes, labsRes, historyRes] = await Promise.all([
                api.patients.get(patientId),
                api.patients.getVitals(patientId),
                api.patients.getPrograms(patientId),
                api.patients.getPrescriptions(patientId),
                api.patients.getLabReports(patientId),
                api.patients.getHistoryRequestStatus(patientId),
            ]);

            setPatient(patientRes.data);
            setVitals(vitalsRes.data);
            setPrograms(programsRes.data);
            setPrescriptions(prescriptionsRes.data);
            setLabReports(labsRes.data);
            setHistoryRequest(historyRes.data);
        } catch (error) {
            console.error('Failed to fetch patient details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (patientId) {
            fetchData();
        }
    }, [patientId]);

    const handleRequestHistory = async () => {
        setIsRequestingHistory(true);
        try {
            await api.patients.requestHistory(patientId, {
                message: 'I would like to review your full medical history for better diagnosis.',
            });
            // Refresh status
            const historyRes = await api.patients.getHistoryRequestStatus(patientId);
            setHistoryRequest(historyRes.data);
        } catch (error) {
            console.error('Failed to request history:', error);
            alert('Failed to send request. Please try again.');
        } finally {
            setIsRequestingHistory(false);
        }
    };

    if (isLoading) {
        return <div className="flex-1 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    if (!patient) return null;

    return (
        <div className="flex-1 h-full overflow-y-auto bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative">
                        {patient.avatarUrl ? (
                            <img src={patient.avatarUrl} alt={patient.name} className="w-24 h-24 rounded-2xl object-cover shadow-md" />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-4xl shadow-md">
                                {patient.name.charAt(0)}
                            </div>
                        )}
                        <span className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold border-2 border-white ${patient.enrollmentStatus === 'active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                            }`}>
                            {patient.enrollmentStatus === 'active' ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {patient.phone}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {patient.email || 'No email'}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {new Date(patient.dateOfBirth).toLocaleDateString()} ({new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yrs)
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            Message
                        </button>
                        {!historyRequest ? (
                            <button
                                onClick={handleRequestHistory}
                                disabled={isRequestingHistory}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Request History
                            </button>
                        ) : (
                            <div className={`px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-2 ${historyRequest.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    historyRequest.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                        'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {historyRequest.status === 'pending' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> :
                                        historyRequest.status === 'approved' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> :
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                                </svg>
                                History Request {historyRequest.status.charAt(0).toUpperCase() + historyRequest.status.slice(1)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Blood Pressure</h3>
                        <p className="text-2xl font-bold text-gray-900">{vitals ? `${vitals.systolic}/${vitals.diastolic}` : '--/--'} <span className="text-sm font-normal text-gray-500">mmHg</span></p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Heart Rate</h3>
                        <p className="text-2xl font-bold text-gray-900">{vitals?.heartRate || '--'} <span className="text-sm font-normal text-gray-500">bpm</span></p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Weight</h3>
                        <p className="text-2xl font-bold text-gray-900">{vitals?.weight || '--'} <span className="text-sm font-normal text-gray-500">kg</span></p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Programs */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Therapy Programs</h3>
                            {programs?.otherPrograms.activeCount > 0 && (
                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                                    +{programs.otherPrograms.activeCount} others
                                </span>
                            )}
                        </div>
                        <div className="p-4 space-y-3">
                            {programs?.myPrograms.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No active programs with you.</p>
                            ) : (
                                programs?.myPrograms.map((prog: any) => (
                                    <div key={prog.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{prog.program.name}</h4>
                                            <p className="text-sm text-gray-500">Started {new Date(prog.startDate).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`ml-auto px-2 py-1 rounded text-xs font-bold uppercase ${prog.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>{prog.status}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Prescriptions */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Prescriptions</h3>
                            <button className="text-sm text-blue-600 font-medium hover:underline">+ New</button>
                        </div>
                        <div className="p-4 space-y-3">
                            {prescriptions?.myPrescriptions.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No prescriptions issued.</p>
                            ) : (
                                prescriptions?.myPrescriptions.map((rx: any) => (
                                    <div key={rx.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{rx.title}</h4>
                                            <p className="text-sm text-gray-500">{new Date(rx.prescribedDate).toLocaleDateString()}</p>
                                        </div>
                                        {rx.documentUrl && (
                                            <a href={rx.documentUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </a>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Lab Reports */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Shared Lab Reports</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {labReports?.length === 0 ? (
                                <div className="col-span-full text-center py-4 text-gray-500">No lab reports shared with you.</div>
                            ) : (
                                labReports?.map((report: any) => (
                                    <div key={report.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{report.title}</h4>
                                            <p className="text-sm text-gray-500">{report.labName} • {new Date(report.reportDate).toLocaleDateString()}</p>
                                        </div>
                                        {report.documentUrl && (
                                            <a href={report.documentUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            </a>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

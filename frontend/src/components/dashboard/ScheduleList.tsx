import React from 'react';

interface Appointment {
    id: string;
    title: string;
    scheduledAt: string;
    duration: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    patient: {
        name: string;
        avatarUrl: string | null;
    };
    program?: {
        name: string;
    };
}

interface ScheduleListProps {
    appointments: Appointment[];
    isLoading: boolean;
}

export function ScheduleList({ appointments, isLoading }: ScheduleListProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Schedule</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Today's Schedule</h2>
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
            </div>

            {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No appointments scheduled for today.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt) => {
                        const time = new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                            <div key={apt.id} className="flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                                <div className="flex-shrink-0 mr-4 text-center min-w-[3rem]">
                                    <p className="text-sm font-bold text-gray-900">{time}</p>
                                    <p className="text-xs text-gray-500">{apt.duration}m</p>
                                </div>

                                <div className="flex-shrink-0 relative">
                                    {apt.patient.avatarUrl ? (
                                        <img src={apt.patient.avatarUrl} alt={apt.patient.name} className="h-12 w-12 rounded-xl object-cover" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                            {apt.patient.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${apt.status === 'scheduled' ? 'bg-green-400' :
                                            apt.status === 'completed' ? 'bg-gray-400' : 'bg-red-400'
                                        }`}></div>
                                </div>

                                <div className="ml-4 flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{apt.patient.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{apt.title}</p>
                                </div>

                                {apt.program && (
                                    <div className="ml-2 hidden sm:block">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {apt.program.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

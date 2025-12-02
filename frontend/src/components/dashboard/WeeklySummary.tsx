import React from 'react';

interface WeeklySummaryProps {
    data: {
        queriesResolved: number;
        checkinsReviewed: number;
        weekStartDate: string;
    } | null;
    isLoading: boolean;
}

export function WeeklySummary({ data, isLoading }: WeeklySummaryProps) {
    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white h-full shadow-lg animate-pulse">
                <div className="h-6 bg-white/20 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                    <div className="h-16 bg-white/10 rounded-2xl"></div>
                    <div className="h-16 bg-white/10 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white h-full shadow-lg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

            <h2 className="text-lg font-bold mb-1 relative z-10">Weekly Summary</h2>
            <p className="text-blue-100 text-sm mb-6 relative z-10">Since {new Date(data.weekStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>

            <div className="space-y-4 relative z-10">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-white/10">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <span className="font-medium">Queries Resolved</span>
                    </div>
                    <span className="text-2xl font-bold">{data.queriesResolved}</span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-white/10">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="font-medium">Check-ins Reviewed</span>
                    </div>
                    <span className="text-2xl font-bold">{data.checkinsReviewed}</span>
                </div>
            </div>
        </div>
    );
}

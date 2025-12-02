import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { api } from '../services/api';
import { StatsCard } from '../components/dashboard/StatsCard';
import { ScheduleList } from '../components/dashboard/ScheduleList';
import { WeeklySummary } from '../components/dashboard/WeeklySummary';

interface DashboardStats {
    activePatients: number;
    pendingQueries: number;
    checkinsToday: number;
    appointmentsToday: number;
    totalUnread: number;
}

interface WeeklySummaryData {
    queriesResolved: number;
    checkinsReviewed: number;
    weekStartDate: string;
}

export function Dashboard() {
    const doctor = useAuthStore((state) => state.doctor);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, scheduleRes, summaryRes] = await Promise.all([
                    api.dashboard.getStats(),
                    api.dashboard.getSchedule(),
                    api.dashboard.getWeeklySummary(),
                ]);

                setStats(statsRes.data);
                setSchedule(scheduleRes.data);
                setWeeklySummary(summaryRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},
                        <span className="text-blue-600 block md:inline md:ml-2">{doctor?.name}</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Here's what's happening in your clinic today.</p>
                </div>
                <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    label="Active Patients"
                    value={isLoading ? '-' : stats?.activePatients || 0}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                    color="bg-blue-50 border-blue-100"
                />
                <StatsCard
                    label="Pending Queries"
                    value={isLoading ? '-' : stats?.pendingQueries || 0}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    }
                    trend={stats?.pendingQueries ? `${stats.pendingQueries} new` : undefined}
                    trendDirection="down" // Assuming pending queries is "bad" so we want it down, but here it shows count. Let's keep neutral or use logic.
                    color="bg-orange-50 border-orange-100"
                />
                <StatsCard
                    label="Check-ins Today"
                    value={isLoading ? '-' : stats?.checkinsToday || 0}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="bg-green-50 border-green-100"
                />
                <StatsCard
                    label="Appointments"
                    value={isLoading ? '-' : stats?.appointmentsToday || 0}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                    color="bg-purple-50 border-purple-100"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Schedule Section */}
                <div className="lg:col-span-2 h-96">
                    <ScheduleList appointments={schedule} isLoading={isLoading} />
                </div>

                {/* Weekly Summary Section */}
                <div className="h-96">
                    <WeeklySummary data={weeklySummary} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}

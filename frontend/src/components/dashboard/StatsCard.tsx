import React from 'react';

interface StatsCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'neutral';
    color?: string;
}

export function StatsCard({ label, value, icon, trend, trendDirection = 'neutral', color = 'bg-white' }: StatsCardProps) {
    return (
        <div className={`${color} rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-32`}>
            <div className="flex justify-between items-start">
                <div className="p-2 bg-gray-50 rounded-xl text-gray-600">
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendDirection === 'up' ? 'bg-green-100 text-green-700' :
                            trendDirection === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
            </div>
        </div>
    );
}

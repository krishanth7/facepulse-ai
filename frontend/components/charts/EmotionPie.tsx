'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { EmotionData } from '@/types';

interface EmotionPieProps {
    data: EmotionData[];
}

const COLORS: Record<string, string> = {
    neutral: '#94a3b8',
    happy: '#10b981',
    sad: '#3b82f6',
    angry: '#ef4444',
    surprised: '#f59e0b',
    disgusted: '#8b5cf6',
    fearful: '#6366f1'
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-lg shadow-2xl">
                <p className="text-white font-bold capitalize text-sm">{payload[0].name}</p>
                <p className="text-blue-400 text-xs font-mono">
                    {payload[0].value} Detections
                </p>
            </div>
        );
    }
    return null;
};

const EmotionPie: React.FC<EmotionPieProps> = ({ data }) => {
    const distribution = data.reduce((acc, curr) => {
        acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(distribution).map(([name, value]) => ({
        name,
        value,
    }));

    if (chartData.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-widest">
                Awaiting Neural Data...
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <defs>
                        {Object.entries(COLORS).map(([key, color]) => (
                            <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.3} />
                            </linearGradient>
                        ))}
                    </defs>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={`url(#gradient-${entry.name})`}
                                className="hover:opacity-80 transition-opacity cursor-pointer duration-300"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        content={({ payload }: any) => (
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {payload?.map((entry: any, index: number) => (
                                    <div key={`item-${index}`} className="flex items-center space-x-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: (COLORS as any)[entry.value] || entry.color }}
                                        />
                                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">
                                            {entry.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-4">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none mb-1">Total</div>
                <div className="text-xl font-black text-white">{data.length}</div>
            </div>
        </div>
    );
};

export default EmotionPie;

'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EmotionData } from '@/types';

interface EmotionTrendProps {
    data: EmotionData[];
}

const EMOTION_SCORES: Record<string, number> = {
    angry: 1,
    fearful: 2,
    sad: 3,
    disgusted: 4,
    neutral: 5,
    surprised: 6,
    happy: 7
};

const EmotionTrend: React.FC<EmotionTrendProps> = ({ data }) => {
    const chartData = data.slice(-20).map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        score: EMOTION_SCORES[d.emotion] || 0,
        emotion: d.emotion,
        confidence: d.confidence * 100
    }));

    if (chartData.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-widest">
                Syncing Neural Stream...
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                        dataKey="time"
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        hide
                    />
                    <YAxis
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 8]}
                        ticks={[1, 3, 5, 7]}
                        tickFormatter={(value: number) => {
                            if (value === 1) return 'LOW';
                            if (value === 4) return 'MED';
                            if (value === 7) return 'HIGH';
                            return '';
                        }}
                    />
                    <Tooltip
                        content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-lg shadow-2xl">
                                        <p className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-1">{data.time}</p>
                                        <p className="text-white font-bold capitalize text-sm">{data.emotion}</p>
                                        <p className="text-slate-400 text-[10px] font-mono">CONFIDENCE: {data.confidence.toFixed(1)}%</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EmotionTrend;

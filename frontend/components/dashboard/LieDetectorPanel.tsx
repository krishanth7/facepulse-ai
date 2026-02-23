'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LieDetectionResult } from '@/ai/lieDetector';
import { ShieldCheck, ShieldAlert, ShieldX, Brain } from 'lucide-react';

interface LieDetectorPanelProps {
    result: LieDetectionResult | null;
    isActive: boolean;
}

const getIcon = (label: string) => {
    switch (label) {
        case 'Truthful': return <ShieldCheck className="w-8 h-8" />;
        case 'Low Risk': return <ShieldCheck className="w-8 h-8" />;
        case 'Suspicious': return <ShieldAlert className="w-8 h-8" />;
        case 'Deceptive': return <ShieldX className="w-8 h-8" />;
        default: return <Brain className="w-8 h-8" />;
    }
};

const LieDetectorPanel: React.FC<LieDetectorPanelProps> = ({ result, isActive }) => {
    if (!isActive) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Brain className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Start a session to activate</p>
                <p className="text-slate-600 font-mono text-[10px] mt-1">Micro-expression analysis requires live feed</p>
            </div>
        );
    }

    if (!result || result.label === 'Calibrating...') {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-10 h-10 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin mb-3" />
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Calibrating Baseline...</p>
                <p className="text-slate-600 font-mono text-[10px] mt-1">Analyzing micro-expression patterns</p>
            </div>
        );
    }

    const { score, label, color, indicators } = result;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full"
            >
                {/* Gauge */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Deception Index</div>
                        <div className="text-4xl font-black tracking-tighter" style={{ color }}>
                            {score}<span className="text-xl text-slate-500"> / 100</span>
                        </div>
                    </div>

                    {/* SVG Radial Gauge */}
                    <div className="relative w-24 h-24">
                        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                            <circle cx="48" cy="48" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                            <motion.circle
                                cx="48"
                                cy="48"
                                r="45"
                                fill="none"
                                stroke={color}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center" style={{ color }}>
                            {getIcon(label)}
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div
                    className="text-center py-2 px-4 rounded-xl font-black text-sm uppercase tracking-widest mb-5"
                    style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
                >
                    {label}
                </div>

                {/* Indicators */}
                <div className="space-y-2 flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Active Indicators</div>
                    {indicators.map((indicator, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center space-x-2 text-xs text-slate-400"
                        >
                            <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            <span className="font-mono">{indicator}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-[9px] text-slate-600 font-mono leading-relaxed">
                        ⚠️ BCI Disclaimer: This system is an educational tool based on Ekman micro-expression research.
                        Not for use in legal, medical or judicial contexts.
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LieDetectorPanel;

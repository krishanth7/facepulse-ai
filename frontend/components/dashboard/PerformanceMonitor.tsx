'use client';

import React from 'react';
import { Activity, Clock, Cpu, Wifi } from 'lucide-react';

interface PerformanceMonitorProps {
    fps: number;
    latency: number;
    isBackendConnected: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ fps, latency, isBackendConnected }) => {
    return (
        <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Inference</span>
                    <span className="text-xs font-mono text-white leading-none">{fps} FPS</span>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Latency</span>
                    <span className="text-xs font-mono text-white leading-none">{latency.toFixed(0)} MS</span>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Wifi className={`w-4 h-4 ${isBackendConnected ? 'text-blue-500' : 'text-rose-500'}`} />
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Neural SDK</span>
                    <span className={`text-xs font-mono uppercase leading-none ${isBackendConnected ? 'text-white' : 'text-rose-400'}`}>
                        {isBackendConnected ? 'Online' : 'Restricted'}
                    </span>
                </div>
            </div>

            <div className="hidden lg:flex items-center space-x-2 border-l border-slate-800 pl-6">
                <Cpu className="w-4 h-4 text-amber-500" />
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Platform</span>
                    <span className="text-xs font-mono text-white leading-none">JS/WASM</span>
                </div>
            </div>
        </div>
    );
};

export default PerformanceMonitor;

'use client';

import React from 'react';
import { LayoutDashboard, Camera, History, Settings, BarChart3, CloudLightning, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', active: true },
        { icon: Camera, label: 'Live Camera' },
        { icon: History, label: 'Sessions' },
        { icon: BarChart3, label: 'Analytics' },
        { icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="w-64 h-screen bg-slate-950 border-r border-slate-900 p-6 flex flex-col fixed left-0 top-0">
            <div className="flex items-center space-x-3 mb-10 px-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CloudLightning size={20} className="text-white fill-white" />
                </div>
                <span className="text-xl font-black text-white tracking-tighter italic">FacePulse <span className="text-blue-500">AI</span></span>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ x: 5 }}
                        className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors ${item.active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                            }`}
                    >
                        <item.icon size={20} />
                        <span className="font-semibold text-sm">{item.label}</span>
                    </motion.div>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-900">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Secured</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">System running at peak performance. AI models updated.</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

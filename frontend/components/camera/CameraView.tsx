'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DetectionResult } from '@/ai/emotionEngine';

interface CameraViewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    results: DetectionResult[];          // Phase 2: array of all subjects
    lastResult: DetectionResult | null;  // Primary (first) subject
    isStreaming: boolean;
}

// Per-subject HUD colors for up to 6 concurrent subjects
const SUBJECT_COLORS = [
    { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.1)', glow: 'rgba(59,130,246,0.5)', label: 'SUBJECT 01' },
    { stroke: '#10b981', fill: 'rgba(16,185,129,0.1)', glow: 'rgba(16,185,129,0.5)', label: 'SUBJECT 02' },
    { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.1)', glow: 'rgba(245,158,11,0.5)', label: 'SUBJECT 03' },
    { stroke: '#8b5cf6', fill: 'rgba(139,92,246,0.1)', glow: 'rgba(139,92,246,0.5)', label: 'SUBJECT 04' },
    { stroke: '#ef4444', fill: 'rgba(239,68,68,0.1)', glow: 'rgba(239,68,68,0.5)', label: 'SUBJECT 05' },
    { stroke: '#ec4899', fill: 'rgba(236,72,153,0.1)', glow: 'rgba(236,72,153,0.5)', label: 'SUBJECT 06' },
];

const drawSubjectHUD = (
    ctx: CanvasRenderingContext2D,
    result: DetectionResult,
    colorSet: typeof SUBJECT_COLORS[0]
) => {
    const { box } = result;
    const { x, y, width, height } = box;
    const cornerSize = Math.min(width, height) * 0.18;

    ctx.strokeStyle = colorSet.stroke;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = colorSet.glow;

    // Corners only
    const corners: [number, number, number, number, number, number][] = [
        [x, y + cornerSize, x, y, x + cornerSize, y],
        [x + width - cornerSize, y, x + width, y, x + width, y + cornerSize],
        [x, y + height - cornerSize, x, y + height, x + cornerSize, y + height],
        [x + width - cornerSize, y + height, x + width, y + height, x + width, y + height - cornerSize],
    ];

    corners.forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.stroke();
    });

    // Fill
    ctx.shadowBlur = 0;
    ctx.fillStyle = colorSet.fill;
    ctx.fillRect(x, y, width, height);

    // Label bar
    ctx.font = 'bold 13px "Space Mono", monospace';
    const label = `${colorSet.label} | ${result.dominantEmotion.toUpperCase()} | ${(result.confidence * 100).toFixed(0)}%`;
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = colorSet.stroke;
    ctx.fillRect(x, y - 24, textWidth + 14, 20);
    ctx.fillStyle = 'white';
    ctx.fillText(label, x + 7, y - 10);
};

const CameraView: React.FC<CameraViewProps> = ({ videoRef, results, lastResult, isStreaming }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !videoRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Phase 2: Draw HUD for EVERY detected face
        results.forEach((result, index) => {
            const colorSet = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
            drawSubjectHUD(ctx, result, colorSet);
        });
    }, [results, videoRef]);

    return (
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.07] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.5)_2px,rgba(0,0,0,0.5)_4px)]" />

            {/* Scan sweep */}
            <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-[2px] bg-blue-500/20 z-20 pointer-events-none blur-sm"
            />

            {!isStreaming && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-30">
                    <div className="w-16 h-16 border-2 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-4" />
                    <p className="font-mono text-xs tracking-widest uppercase">Initializing Neural Link...</p>
                </div>
            )}

            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover brightness-110"
            />

            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-40"
            />

            {/* System badge */}
            <div className="absolute top-5 left-5 z-50 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl">
                    <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`} />
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                            {isStreaming ? `${results.length} Subject${results.length !== 1 ? 's' : ''} Active` : 'System Offline'}
                        </span>
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">NEURAL LINK v2.0 · MULTI-BIOMETRICS</div>
                </div>
            </div>

            {/* Live emotion panel for primary subject */}
            <AnimatePresence>
                {lastResult && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute bottom-5 right-5 z-50 bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 p-5 rounded-2xl min-w-[190px]"
                    >
                        <div className="text-[9px] text-blue-400 uppercase font-black tracking-[0.2em] mb-1.5">Primary Subject</div>
                        <div className="text-3xl font-black text-white capitalize mb-2 tracking-tighter">
                            {lastResult.dominantEmotion}
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${lastResult.confidence * 100}%` }}
                                className="h-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"
                            />
                        </div>
                        <div className="text-[9px] text-white/40 font-mono">CONF: {(lastResult.confidence * 100).toFixed(1)}%</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CameraView;

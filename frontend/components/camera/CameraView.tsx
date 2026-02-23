'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DetectionResult } from '@/ai/emotionEngine';

interface CameraViewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    lastResult: DetectionResult | null;
    isStreaming: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ videoRef, lastResult, isStreaming }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !videoRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Sync canvas display size with video element
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!lastResult) return;

        const { box } = lastResult;
        const color = '#3b82f6';
        const glowColor = 'rgba(59, 130, 246, 0.5)';

        // Draw HUD-style bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 4; // Bolder for better visibility
        ctx.shadowBlur = 15;
        ctx.shadowColor = glowColor;

        const cornerSize = Math.min(box.width, box.height) * 0.2;
        const { x, y, width, height } = box;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(x, y + cornerSize);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerSize, y);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + width - cornerSize, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + cornerSize);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x, y + height - cornerSize);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + cornerSize, y + height);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + width - cornerSize, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + width, y + height - cornerSize);
        ctx.stroke();

        // Draw subtle box fill
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.fillRect(x, y, width, height);

        // Reset shadow for text
        ctx.shadowBlur = 0;

        // Draw futuristic label
        ctx.font = 'bold 14px "Space Mono", monospace';
        const label = `ID: FACE_01 | ${lastResult.dominantEmotion.toUpperCase()} | ${(lastResult.confidence * 100).toFixed(1)}%`;
        const textWidth = ctx.measureText(label).width;

        ctx.fillStyle = color;
        ctx.fillRect(x, y - 25, textWidth + 10, 20);

        ctx.fillStyle = 'white';
        ctx.fillText(label, x + 5, y - 11);
    }, [lastResult, videoRef]);

    return (
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
            {/* Scanline Animation */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-blue-500/30 z-20 pointer-events-none blur-sm"
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
                className="w-full h-full object-cover grayscale-[0.2] brightness-110"
            />

            <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-40"
            />

            {/* HUD Overlays */}
            <div className="absolute top-6 left-6 z-50 flex items-start space-x-4 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl">
                    <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">System Active</span>
                    </div>
                    <div className="text-xs text-white/70 font-mono italic">REC: 00:00:24:12</div>
                </div>
            </div>

            <AnimatePresence>
                {lastResult && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute bottom-6 right-6 z-50 bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 p-6 rounded-2xl min-w-[200px]"
                    >
                        <div className="text-[10px] text-blue-400 uppercase font-black tracking-[0.2em] mb-2">Subject Emotion</div>
                        <div className="text-4xl font-black text-white capitalize mb-1 tracking-tighter">
                            {lastResult.dominantEmotion}
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${lastResult.confidence * 100}%` }}
                                className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                            />
                        </div>
                        <div className="mt-2 text-[10px] text-white/50 font-mono">CONFIDENCE: {(lastResult.confidence * 100).toFixed(2)}%</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CameraView;

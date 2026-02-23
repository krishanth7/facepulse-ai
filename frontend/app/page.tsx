'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Square,
  Download,
  Camera as CameraIcon,
  BrainCircuit,
  Activity,
  CloudLightning
} from 'lucide-react';
import axios from 'axios';

import CameraView from '@/components/camera/CameraView';
import EmotionTrend from '@/components/charts/EmotionTrend';
import EmotionPie from '@/components/charts/EmotionPie';
import PerformanceMonitor from '@/components/dashboard/PerformanceMonitor';
import { useCamera } from '@/hooks/useCamera';
import { useEmotionDetection } from '@/hooks/useEmotionDetection';
import { EmotionData } from '@/types';

const API_BASE = 'http://localhost:8080/api';

export default function Dashboard() {
  const { videoRef, startCamera, stopCamera, stream } = useCamera();
  const { isModelLoaded, lastResult, fps, latency, startDetection, stopDetection } = useEmotionDetection(videoRef);

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<EmotionData[]>([]);
  const [backendStatus, setBackendStatus] = useState(false);

  // Check backend health
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get(`${API_BASE}/sessions`);
        setBackendStatus(true);
      } catch (err) {
        setBackendStatus(false);
      }
    };
    checkBackend();
  }, []);

  // Update session data when new results arrive
  useEffect(() => {
    if (isSessionActive && lastResult) {
      const newData: EmotionData = {
        timestamp: new Date().toISOString(),
        emotion: lastResult.dominantEmotion,
        confidence: lastResult.confidence,
      };
      setSessionData((prev: EmotionData[]) => [...prev, newData]);

      // Send to backend (debounced or throttled would be better, but doing it directly for demo)
      if (sessionId && Math.random() > 0.7) { // Sample data to backend
        axios.post(`${API_BASE}/analytics`, { id: sessionId, data: newData }).catch(() => { });
      }
    }
  }, [lastResult, isSessionActive, sessionId]);

  const toggleSession = async () => {
    if (!isSessionActive) {
      const camStream = await startCamera();
      if (camStream) {
        startDetection();
        setIsSessionActive(true);
        setSessionData([]);
        try {
          const res = await axios.post(`${API_BASE}/session/start`);
          setSessionId(res.data.id);
        } catch (err) {
          console.error("Backend unavailable, running in local mode");
        }
      }
    } else {
      stopCamera();
      stopDetection();
      setIsSessionActive(false);
      if (sessionId) {
        await axios.post(`${API_BASE}/session/end`, { id: sessionId }).catch(() => { });
        setSessionId(null);
      }
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facepulse-session-${new Date().getTime()}.json`;
    a.click();
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-8">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:mb-12">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">FacePulse <span className="text-blue-500">Analytics</span></h1>
          </div>
          <p className="text-slate-500 font-medium ml-12">Real-time Biometric Intelligence Dashboard</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center shadow-inner">
          <PerformanceMonitor
            fps={fps}
            latency={latency}
            isBackendConnected={backendStatus}
          />
        </div>
      </header>

      {/* Model Loading State */}
      {!isModelLoaded && (
        <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-2xl mb-8 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-4">
            <BrainCircuit className="text-blue-500" size={32} />
            <div>
              <h3 className="text-blue-100 font-bold">Neural Engine Initializing...</h3>
              <p className="text-blue-400 text-sm">Downloading vision models and optimizing WASM threads.</p>
            </div>
          </div>
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Vision Feed */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-2">
                <CameraIcon className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Vision Stream</h3>
              </div>
              <div className="flex items-center space-x-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Live Feed</span>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <CameraView
                videoRef={videoRef}
                lastResult={lastResult}
                isStreaming={!!stream}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 py-4">
              <button
                onClick={toggleSession}
                disabled={!isModelLoaded}
                className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center space-x-3 transition-all transform active:scale-95 shadow-xl disabled:opacity-50 ${isSessionActive
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20'
                  }`}
              >
                {isSessionActive ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Terminate Link</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Initialize Core</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExport}
                disabled={sessionData.length === 0}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center space-x-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl border border-slate-700"
              >
                <Download className="w-4 h-4" />
                <span>Sync Data Log</span>
              </button>
            </div>
          </section>

          <section className="bg-slate-900/30 backdrop-blur-md border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-24 h-24 text-blue-500" />
            </div>
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">Timeline Analytics</h3>
                <p className="text-xs text-slate-500 font-mono">Real-time intensity fluctuations across session</p>
              </div>
            </div>
            <div className="h-[250px]">
              <EmotionTrend data={sessionData} />
            </div>
          </section>
        </div>

        {/* Right Column: Insights */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900/30 backdrop-blur-md border border-slate-800 p-8 rounded-[2.5rem]">
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">Cognitive Mix</h3>
            <p className="text-xs text-slate-500 font-mono mb-8">Subject's emotional composition</p>
            <div className="h-[300px]">
              <EmotionPie data={sessionData} />
            </div>
          </section>

          <section className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none"
            >
              <CloudLightning className="w-48 h-48" />
            </motion.div>

            <h4 className="text-2xl font-black tracking-tighter mb-2">PRO EDITION</h4>
            <p className="text-indigo-100/70 text-sm mb-8 leading-relaxed">
              Unlock multi-face tracking, micro-expression analysis, and team behavioral reports.
            </p>

            <button className="w-full bg-white text-indigo-700 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/40 transform active:scale-95">
              Secure License
            </button>
          </section>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl">
              <div className="text-slate-500 text-[10px] font-black tracking-widest uppercase mb-2">Total Detections</div>
              <div className="text-2xl font-black text-white leading-none">{sessionData.length}</div>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl">
              <div className="text-slate-500 text-[10px] font-black tracking-widest uppercase mb-2">Top State</div>
              <div className="text-lg font-black text-blue-400 capitalize leading-none">
                {sessionData.length > 0 ? (
                  (() => {
                    const counts = sessionData.reduce((acc, c) => ({ ...acc, [c.emotion]: (acc[c.emotion] || 0) + 1 }), {} as Record<string, number>);
                    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
                  })()
                ) : '--'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

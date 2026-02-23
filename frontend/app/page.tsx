'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Square, Download,
  Camera as CameraIcon, BrainCircuit, Activity, CloudLightning, Users, Radar
} from 'lucide-react';
import axios from 'axios';

import CameraView from '@/components/camera/CameraView';
import EmotionTrend from '@/components/charts/EmotionTrend';
import EmotionPie from '@/components/charts/EmotionPie';
import PerformanceMonitor from '@/components/dashboard/PerformanceMonitor';
import LieDetectorPanel from '@/components/dashboard/LieDetectorPanel';
import { useCamera } from '@/hooks/useCamera';
import { useEmotionDetection } from '@/hooks/useEmotionDetection';
import { EmotionData } from '@/types';

const API_BASE = 'http://localhost:8080/api';

export default function Dashboard() {
  const { videoRef, startCamera, stopCamera, stream } = useCamera();
  const {
    isModelLoaded, results, lastResult,
    fps, latency, lieResult,
    startDetection, stopDetection
  } = useEmotionDetection(videoRef);

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<EmotionData[]>([]);
  const [backendStatus, setBackendStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'multiface' | 'liedetect'>('analytics');

  useEffect(() => {
    axios.get(`${API_BASE}/sessions`).then(() => setBackendStatus(true)).catch(() => setBackendStatus(false));
  }, []);

  useEffect(() => {
    if (isSessionActive && lastResult) {
      const newData: EmotionData = {
        timestamp: new Date().toISOString(),
        emotion: lastResult.dominantEmotion,
        confidence: lastResult.confidence,
      };
      setSessionData(prev => [...prev, newData]);
      if (sessionId && Math.random() > 0.7) {
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
        } catch { console.log('Running in offline mode'); }
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
    a.download = `facepulse-session-${Date.now()}.json`;
    a.click();
  };

  const topEmotion = sessionData.length > 0
    ? (() => {
      const counts = sessionData.reduce((acc, c) => ({ ...acc, [c.emotion]: (acc[c.emotion] || 0) + 1 }), {} as Record<string, number>);
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    })()
    : '--';

  const TABS = [
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'multiface', label: 'Multi-Subject', icon: Users },
    { id: 'liedetect', label: 'Lie Detector', icon: Radar },
  ] as const;

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-8">
      {/* ── Header ── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
              FacePulse <span className="text-blue-500">Analytics</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium ml-12 text-sm">
            Real-time Biometric Intelligence · Multi-Subject · Lie Detection
          </p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl">
          <PerformanceMonitor fps={fps} latency={latency} isBackendConnected={backendStatus} />
        </div>
      </header>

      {/* ── Model Loading Banner ── */}
      {!isModelLoaded && (
        <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl mb-8 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-4">
            <BrainCircuit className="text-blue-500" size={28} />
            <div>
              <h3 className="text-blue-100 font-bold text-sm">Neural Engine Initializing...</h3>
              <p className="text-blue-400 text-xs">Downloading TinyFaceDetector + Micro-Expression models.</p>
            </div>
          </div>
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Left: Camera Feed ── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <CameraIcon className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Vision Stream</h3>
              {results.length > 0 && (
                <span className="bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {results.length} ACTIVE
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSessionActive ? 'bg-blue-400' : 'bg-slate-600'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSessionActive ? 'bg-blue-500' : 'bg-slate-600'}`}></span>
              </span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">
                {isSessionActive ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-35 transition duration-1000"></div>
            <CameraView
              videoRef={videoRef}
              results={results}
              lastResult={lastResult}
              isStreaming={!!stream}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={toggleSession}
              disabled={!isModelLoaded}
              className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center space-x-3 transition-all transform active:scale-95 shadow-xl disabled:opacity-40 ${isSessionActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20'
                }`}
            >
              {isSessionActive
                ? <><Square className="w-4 h-4 fill-current" /><span>Terminate Link</span></>
                : <><Play className="w-4 h-4 fill-current" /><span>Initialize Core</span></>
              }
            </button>
            <button
              onClick={handleExport}
              disabled={sessionData.length === 0}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center space-x-3 transition-all disabled:opacity-40 shadow-xl border border-slate-700"
            >
              <Download className="w-4 h-4" />
              <span>Export Log</span>
            </button>
          </div>

          {/* Multi-Subject Grid — Phase 2 */}
          <AnimatePresence>
            {results.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-white">
                    Multi-Subject Biometrics
                  </h4>
                  <span className="text-[10px] text-emerald-500 font-mono">
                    {results.length} subjects tracked
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {results.map((r, i) => {
                    const colors = ['border-blue-500/40 bg-blue-600/10 text-blue-400', 'border-emerald-500/40 bg-emerald-600/10 text-emerald-400', 'border-amber-500/40 bg-amber-600/10 text-amber-400', 'border-violet-500/40 bg-violet-600/10 text-violet-400', 'border-rose-500/40 bg-rose-600/10 text-rose-400', 'border-pink-500/40 bg-pink-600/10 text-pink-400'];
                    return (
                      <div key={r.id} className={`border rounded-2xl p-4 ${colors[i % colors.length]}`}>
                        <div className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Subject 0{i + 1}</div>
                        <div className="text-xl font-black capitalize leading-none mb-1">{r.dominantEmotion}</div>
                        <div className="w-full h-0.5 bg-current/20 rounded-full">
                          <div className="h-full bg-current rounded-full" style={{ width: `${r.confidence * 100}%` }} />
                        </div>
                        <div className="text-[9px] font-mono mt-1 opacity-60">{(r.confidence * 100).toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Panels ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl">
              <div className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1">Detections</div>
              <div className="text-2xl font-black text-white">{sessionData.length}</div>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl">
              <div className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1">Subjects</div>
              <div className="text-2xl font-black text-emerald-400">{results.length}</div>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl">
              <div className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1">Top State</div>
              <div className="text-sm font-black text-blue-400 capitalize leading-tight mt-1">{topEmotion}</div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="flex border-b border-slate-800">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-3 gap-1 text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === tab.id
                    ? 'text-blue-400 bg-blue-600/10 border-b-2 border-blue-500'
                    : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 min-h-[400px]">
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1">Cognitive Mix</h3>
                    <p className="text-[10px] text-slate-500 font-mono mb-4">Emotional composition breakdown</p>
                    <div className="h-[280px]">
                      <EmotionPie data={sessionData} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'multiface' && (
                <div className="space-y-3">
                  <div className="text-xs font-black text-white uppercase tracking-widest mb-4">Live Biometric Feed</div>
                  {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="w-10 h-10 text-slate-700 mb-3" />
                      <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">No subjects detected</p>
                    </div>
                  ) : (
                    results.map((r, i) => (
                      <div key={r.id} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Subject 0{i + 1}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{(r.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="text-lg font-black text-white capitalize mb-2">{r.dominantEmotion}</div>
                        <div className="grid grid-cols-3 gap-1">
                          {Object.entries(r.expressions).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).map(([em, val]: any) => (
                            <div key={em} className="bg-slate-900/60 rounded-lg p-1.5 text-center">
                              <div className="text-[8px] text-slate-500 capitalize">{em}</div>
                              <div className="text-[10px] font-black text-white">{(val * 100).toFixed(0)}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'liedetect' && (
                <LieDetectorPanel result={lieResult} isActive={isSessionActive} />
              )}
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800 p-6 rounded-3xl">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1">Intensity Timeline</h3>
            <p className="text-[10px] text-slate-500 font-mono mb-4">Emotional arc over session</p>
            <div className="h-[180px]">
              <EmotionTrend data={sessionData} />
            </div>
          </div>

          {/* Pro Upgrade CTA */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-7 rounded-3xl text-white relative overflow-hidden group">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none"
            >
              <CloudLightning className="w-40 h-40" />
            </motion.div>
            <h4 className="text-xl font-black tracking-tighter mb-1">ENTERPRISE</h4>
            <p className="text-indigo-100/60 text-xs mb-5 leading-relaxed">
              PostgreSQL storage, team workspaces, API key management, and alerting pipelines.
            </p>
            <button className="w-full bg-white text-indigo-700 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

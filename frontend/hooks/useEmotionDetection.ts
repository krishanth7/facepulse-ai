import { useState, useEffect, useRef, useCallback } from 'react';
import { loadModels } from '@/ai/modelLoader';
import { detectEmotions, DetectionResult } from '@/ai/emotionEngine';
import { LieDetectionEngine, LieDetectionResult } from '@/ai/lieDetector';

export const useEmotionDetection = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [results, setResults] = useState<DetectionResult[]>([]);         // Phase 2: array
    const [lastResult, setLastResult] = useState<DetectionResult | null>(null); // Primary face
    const [fps, setFps] = useState(0);
    const [latency, setLatency] = useState(0);
    const [lieResult, setLieResult] = useState<LieDetectionResult | null>(null); // Phase 3
    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const lieEngineRef = useRef<LieDetectionEngine>(new LieDetectionEngine());

    useEffect(() => {
        loadModels().then((success) => {
            setIsModelLoaded(success);
        });
    }, []);

    const detectionLoop = useCallback(async () => {
        if (videoRef.current && videoRef.current.readyState === 4 && isModelLoaded) {
            const startTime = performance.now();

            // Phase 2: all faces
            const detected = await detectEmotions(videoRef.current);

            const endTime = performance.now();
            setLatency(endTime - startTime);
            setResults(detected);

            // Primary subject = first (largest) face
            const primary = detected[0] || null;
            setLastResult(primary);

            // Phase 3: feed primary subject to Lie Detector
            if (primary) {
                lieEngineRef.current.addFrame(primary.dominantEmotion, primary.confidence);
                const lie = lieEngineRef.current.analyze();
                setLieResult(lie);
            }

            // Calculate FPS
            const now = performance.now();
            const delta = now - lastTimeRef.current;
            if (delta > 0) {
                setFps(Math.round(1000 / delta));
            }
            lastTimeRef.current = now;
        }
        requestRef.current = requestAnimationFrame(detectionLoop);
    }, [isModelLoaded, videoRef]);

    const startDetection = useCallback(() => {
        lieEngineRef.current.reset();
        requestRef.current = requestAnimationFrame(detectionLoop);
    }, [detectionLoop]);

    const stopDetection = useCallback(() => {
        cancelAnimationFrame(requestRef.current);
    }, []);

    return { isModelLoaded, results, lastResult, fps, latency, lieResult, startDetection, stopDetection };
};

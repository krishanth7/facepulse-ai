import { useState, useEffect, useRef, useCallback } from 'react';
import { loadModels } from '@/ai/modelLoader';
import { detectEmotions, DetectionResult } from '@/ai/emotionEngine';

export const useEmotionDetection = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [lastResult, setLastResult] = useState<DetectionResult | null>(null);
    const [fps, setFps] = useState(0);
    const [latency, setLatency] = useState(0);
    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        loadModels().then((success) => {
            setIsModelLoaded(success);
        });
    }, []);

    const detectionLoop = useCallback(async () => {
        if (videoRef.current && videoRef.current.readyState === 4 && isModelLoaded) {
            const startTime = performance.now();

            const result = await detectEmotions(videoRef.current);

            const endTime = performance.now();
            setLatency(endTime - startTime);
            setLastResult(result);

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
        requestRef.current = requestAnimationFrame(detectionLoop);
    }, [detectionLoop]);

    const stopDetection = useCallback(() => {
        cancelAnimationFrame(requestRef.current);
    }, []);

    return { isModelLoaded, lastResult, fps, latency, startDetection, stopDetection };
};

import { useState, useCallback } from 'react';

export const usePerformance = () => {
    const [fps, setFps] = useState(0);
    const [latency, setLatency] = useState(0);

    const updateMetrics = useCallback((newLatency: number, delta: number) => {
        setLatency(newLatency);
        if (delta > 0) {
            setFps(Math.round(1000 / delta));
        }
    }, []);

    return { fps, latency, updateMetrics };
};

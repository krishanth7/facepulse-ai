import { useState, useCallback, useRef } from 'react';

export const useCamera = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, frameRate: { ideal: 30 } },
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            return mediaStream;
        } catch (err) {
            setError('Camera permission denied or not found.');
            console.error(err);
            return null;
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            setStream(null);
        }
    }, [stream]);

    return { videoRef, startCamera, stopCamera, stream, error };
};

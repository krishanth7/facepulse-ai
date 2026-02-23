export interface DetectionResult {
    id: number;
    box: { x: number; y: number; width: number; height: number };
    expressions: Record<string, number>;
    dominantEmotion: string;
    confidence: number;
    landmarks?: any;
    lieScore?: number; // Phase 3
}

// Phase 1 & 2: Detect ALL faces concurrently
export const detectEmotions = async (
    videoElement: HTMLVideoElement
): Promise<DetectionResult[]> => {
    const faceapi: any = await import('@vladmandic/face-api');

    const detections = await faceapi
        .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.45 }))
        .withFaceLandmarks()
        .withFaceExpressions();

    if (!detections || detections.length === 0) return [];

    return detections.map((detection: any, index: number) => {
        const expressions: Record<string, number> = detection.expressions;
        const sorted = Object.entries(expressions).sort((a: any, b: any) => b[1] - a[1]);
        const [dominantEmotion, confidence] = sorted[0];

        return {
            id: index,
            box: detection.detection.box,
            expressions,
            dominantEmotion,
            confidence: confidence as number,
            landmarks: detection.landmarks,
        };
    });
};

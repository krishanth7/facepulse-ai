export interface DetectionResult {
    box: any;
    expressions: any;
    dominantEmotion: string;
    confidence: number;
}

export const detectEmotions = async (
    videoElement: HTMLVideoElement
): Promise<DetectionResult | null> => {
    const faceapi: any = await import('@vladmandic/face-api');
    const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceExpressions();

    if (!detection) return null;

    const expressions = (detection as any).expressions;
    const sorted = Object.entries(expressions).sort((a: any, b: any) => b[1] - a[1]);
    const [dominantEmotion, confidence] = sorted[0];

    return {
        box: (detection as any).detection.box,
        expressions,
        dominantEmotion,
        confidence: confidence as number,
    };
};

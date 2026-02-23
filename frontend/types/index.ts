export interface EmotionData {
    timestamp: string;
    emotion: string;
    confidence: number;
}

export interface Session {
    id: string;
    start_time: string;
    end_time?: string;
    duration_seconds: number;
    analytics: EmotionData[];
    insights: string;
}

export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';

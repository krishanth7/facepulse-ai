/**
 * Phase 3: Lie Detection Scoring Algorithm
 *
 * Lie detection is based on the study of "micro-expression leakage" — a concept
 * from Ekman & Friesen (1969). People attempting deception often:
 * 1. Suppress their true emotions (masking with Neutral/Happy).
 * 2. Show brief flashes of suppressed emotion (micro-expressions).
 * 3. Have high emotional volatility despite a calm facade.
 *
 * Our algorithm scores 0-100:
 * 0-30:  Highly Truthful / Stable
 * 31-60: Some Inconsistency / Warrants Attention
 * 61-100: Deception Indicators Detected
 */

export interface LieDetectionResult {
    score: number;           // 0-100
    label: string;           // e.g. "Truthful", "Suspicious", "Deceptive"
    color: string;           // For UI display
    indicators: string[];    // Human-readable reasons
}

const SUPPRESSED_EMOTIONS = ['angry', 'fearful', 'disgusted', 'sad'];

interface EmotionWindow {
    emotion: string;
    confidence: number;
    timestamp: number;
}

export class LieDetectionEngine {
    private history: EmotionWindow[] = [];
    private readonly WINDOW_MS = 5000; // 5-second rolling window

    addFrame(emotion: string, confidence: number) {
        const now = Date.now();
        // Prune old frames outside the rolling window
        this.history = this.history.filter(e => now - e.timestamp < this.WINDOW_MS);
        this.history.push({ emotion, confidence, timestamp: now });
    }

    analyze(): LieDetectionResult {
        if (this.history.length < 5) {
            return {
                score: 0,
                label: 'Calibrating...',
                color: '#64748b',
                indicators: ['Collecting baseline data...'],
            };
        }

        let score = 0;
        const indicators: string[] = [];
        const recent = this.history;

        // --- Factor 1: Masking Score (0-30 pts) ---
        // How often is Neutral/Happy shown while other suppressed emotions appear?
        const suppressedFlashes = recent.filter(e => SUPPRESSED_EMOTIONS.includes(e.emotion)).length;
        const neutralHappyCount = recent.filter(e => e.emotion === 'neutral' || e.emotion === 'happy').length;
        const suppressionMaskRatio = neutralHappyCount > 0 ? suppressedFlashes / neutralHappyCount : 0;

        if (suppressionMaskRatio > 0.4) {
            score += 20;
            indicators.push('Emotional masking pattern detected');
        } else if (suppressionMaskRatio > 0.2) {
            score += 10;
            indicators.push('Minor emotional suppression');
        }

        // --- Factor 2: Micro-expression Volatility (0-30 pts) ---
        // Rapid emotional transitions within the window are a deception indicator
        let transitions = 0;
        for (let i = 1; i < recent.length; i++) {
            if (recent[i].emotion !== recent[i - 1].emotion) transitions++;
        }
        const volatility = transitions / recent.length;
        if (volatility > 0.6) {
            score += 30;
            indicators.push('High micro-expression volatility');
        } else if (volatility > 0.4) {
            score += 15;
            indicators.push('Moderate emotional instability');
        }

        // --- Factor 3: Fear/Anger Leakage (0-25 pts) ---
        // Brief flashes of fear/anger that are immediately overridden
        const fearAngerFlashes = recent.filter(
            (e, i) => (e.emotion === 'fearful' || e.emotion === 'angry') &&
                recent[i + 1] && recent[i + 1].emotion !== e.emotion
        ).length;

        if (fearAngerFlashes > 3) {
            score += 25;
            indicators.push('Fear/anger leakage detected');
        } else if (fearAngerFlashes > 1) {
            score += 12;
            indicators.push('Trace fear signals present');
        }

        // --- Factor 4: Low Confidence Neutral (0-15 pts) ---
        // A person faking neutral often has low confidence in the prediction
        const lowConfidenceNeutrals = recent.filter(e =>
            e.emotion === 'neutral' && e.confidence < 0.5
        ).length;

        if (lowConfidenceNeutrals > recent.length * 0.3) {
            score += 15;
            indicators.push('Forced neutral expression');
        }

        score = Math.min(Math.round(score), 100);

        if (indicators.length === 0) {
            indicators.push('Consistent emotional baseline');
        }

        // --- Map score to label ---
        let label: string;
        let color: string;
        if (score < 25) {
            label = 'Truthful';
            color = '#10b981'; // green
        } else if (score < 50) {
            label = 'Low Risk';
            color = '#f59e0b'; // yellow
        } else if (score < 75) {
            label = 'Suspicious';
            color = '#f97316'; // orange
        } else {
            label = 'Deceptive';
            color = '#ef4444'; // red
        }

        return { score, label, color, indicators };
    }

    reset() {
        this.history = [];
    }
}

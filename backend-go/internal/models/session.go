package models

import "time"

type EmotionData struct {
	Timestamp  time.Time `json:"timestamp"`
	Emotion    string    `json:"emotion"`
	Confidence float64   `json:"confidence"`
}

type Session struct {
	ID         string        `json:"id"`
	StartTime  time.Time     `json:"start_time"`
	EndTime    *time.Time    `json:"end_time,omitempty"`
	Duration   float64       `json:"duration_seconds"`
	Analytics  []EmotionData `json:"analytics"`
	Insights   string        `json:"insights"`
}

package services

import (
	"facepulse-ai/backend-go/internal/models"
	"sync"
	"time"
	"github.com/google/uuid"
)

type SessionService struct {
	sessions sync.Map
}

func NewSessionService() *SessionService {
	return &SessionService{}
}

func (s *SessionService) StartSession() models.Session {
	id := uuid.New().String()
	session := models.Session{
		ID:        id,
		StartTime: time.Now(),
		Analytics: []models.EmotionData{},
	}
	s.sessions.Store(id, session)
	return session
}

func (s *SessionService) EndSession(id string) (*models.Session, error) {
	val, ok := s.sessions.Load(id)
	if !ok {
		return nil, nil
	}
	session := val.(models.Session)
	endTime := time.Now()
	session.EndTime = &endTime
	session.Duration = endTime.Sub(session.StartTime).Seconds()
	
	// Generate dummy insights based on dominant emotion
	session.Insights = "Session completed successfully. Dominant emotion detected: Neutral."
	
	s.sessions.Store(id, session)
	return &session, nil
}

func (s *SessionService) AddAnalytics(id string, data models.EmotionData) error {
	val, ok := s.sessions.Load(id)
	if !ok {
		return nil
	}
	session := val.(models.Session)
	session.Analytics = append(session.Analytics, data)
	s.sessions.Store(id, session)
	return nil
}

func (s *SessionService) GetAllSessions() []models.Session {
	var results []models.Session
	s.sessions.Range(func(key, value interface{}) bool {
		results = append(results, value.(models.Session))
		return true
	})
	return results
}

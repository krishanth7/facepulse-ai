package handlers

import (
	"encoding/json"
	"facepulse-ai/backend-go/internal/models"
	"facepulse-ai/backend-go/internal/services"
	"net/http"
	"strings"
)

type SessionHandler struct {
	service *services.SessionService
}

func NewSessionHandler(service *services.SessionService) *SessionHandler {
	return &SessionHandler{service: service}
}

func (h *SessionHandler) HandleSession(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		return
	}

	switch {
	case r.Method == "POST" && strings.HasSuffix(r.URL.Path, "/start"):
		session := h.service.StartSession()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(session)

	case r.Method == "POST" && strings.HasSuffix(r.URL.Path, "/end"):
		var req struct {
			ID string `json:"id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		session, err := h.service.EndSession(req.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(session)

	case r.Method == "POST" && strings.HasSuffix(r.URL.Path, "/analytics"):
		var req struct {
			ID   string             `json:"id"`
			Data models.EmotionData `json:"data"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_ = h.service.AddAnalytics(req.ID, req.Data)
		w.WriteHeader(http.StatusAccepted)

	case r.Method == "GET" && r.URL.Path == "/api/sessions":
		sessions := h.service.GetAllSessions()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(sessions)

	default:
		http.NotFound(w, r)
	}
}

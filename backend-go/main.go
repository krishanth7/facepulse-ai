package main

import (
	"facepulse-ai/backend-go/internal/handlers"
	"facepulse-ai/backend-go/internal/services"
	"log"
	"net/http"
)

func main() {
	sessionService := services.NewSessionService()
	sessionHandler := handlers.NewSessionHandler(sessionService)

	http.HandleFunc("/api/session/start", sessionHandler.HandleSession)
	http.HandleFunc("/api/session/end", sessionHandler.HandleSession)
	http.HandleFunc("/api/analytics", sessionHandler.HandleSession)
	http.HandleFunc("/api/sessions", sessionHandler.HandleSession)

	port := ":8080"
	log.Printf("FacePulse AI Backend starting on %s...", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}

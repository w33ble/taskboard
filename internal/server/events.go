package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

// Coarse realtime event types. The frontend refetches on receipt.
const (
	EventConnected       = "connected"
	EventTicketsUpdated  = "tickets.updated"
	EventProjectsUpdated = "projects.updated"
	EventTeamsUpdated    = "teams.updated"
	EventLabelsUpdated   = "labels.updated"
)

type sseClient struct {
	ch chan string
}

type sseHub struct {
	mu      sync.Mutex
	clients map[*sseClient]struct{}
}

func newSSEHub() *sseHub {
	return &sseHub{clients: make(map[*sseClient]struct{})}
}

func (h *sseHub) add(c *sseClient) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[c] = struct{}{}
}

func (h *sseHub) remove(c *sseClient) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, c)
}

func (h *sseHub) broadcast(eventType string, payload any) {
	if payload == nil {
		payload = map[string]string{"type": eventType}
	}
	data, err := json.Marshal(payload)
	if err != nil {
		return
	}
	frame := fmt.Sprintf("event: %s\ndata: %s\n\n", eventType, string(data))
	h.mu.Lock()
	defer h.mu.Unlock()
	for c := range h.clients {
		select {
		case c.ch <- frame:
		default:
		}
	}
}

func (s *Server) handleEvents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	client := &sseClient{ch: make(chan string, 16)}
	s.events.add(client)
	defer s.events.remove(client)

	fmt.Fprintf(w, "event: %s\ndata: {\"type\":\"%s\"}\n\n", EventConnected, EventConnected)
	flusher.Flush()

	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case msg := <-client.ch:
			fmt.Fprint(w, msg)
			flusher.Flush()
		case <-ticker.C:
			fmt.Fprint(w, ": ping\n\n")
			flusher.Flush()
		}
	}
}

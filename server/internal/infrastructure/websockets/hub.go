package websockets

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

// Client represents a single WebSocket client (a user's browser).
type Client struct {
	UserID uint
	Conn   *websocket.Conn
	Send   chan []byte
}

// Hub maintains the set of active clients and broadcasts messages.
type Hub struct {
	clients    map[uint]*Client // Map of userID to Client
	mu         sync.RWMutex
	register   chan *Client
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[uint]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Register provides a public method to register a client.
func (h *Hub) Register(client *Client) {
	h.register <- client
}

// Unregister provides a public method to unregister a client.
func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
}

// Run starts the Hub's event loop.
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.UserID] = client
			h.mu.Unlock()
			log.Printf("Client registered for user ID: %d", client.UserID)
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.UserID]; ok {
				delete(h.clients, client.UserID)
				close(client.Send)
			}
			h.mu.Unlock()
			log.Printf("Client unregistered for user ID: %d", client.UserID)
		}
	}
}

// Notify sends a message to a specific user if they are connected.
func (h *Hub) Notify(userID uint, message []byte) {
	h.mu.RLock()
	client, ok := h.clients[userID]
	h.mu.RUnlock()

	if ok {
		select {
		case client.Send <- message:
		default:
			// If the send buffer is full, we might be sending too fast.
			// For this app, we can just drop the message.
			log.Printf("Message buffer full for user %d. Dropping message.", userID)
		}
	}
}

// Disconnect finds a client by userID and triggers the unregister process.
// This is called by the HTTP logout handler.
func (h *Hub) Disconnect(userID uint) {
	h.mu.RLock()
	client, ok := h.clients[userID]
	h.mu.RUnlock()

	if ok {
		// If the client exists, use the existing Unregister method
		// to safely send them to the unregister channel.
		h.Unregister(client)
	}
}

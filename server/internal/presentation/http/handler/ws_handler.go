package handler

import (
	"log"
	"net/http"

	"github.com/diabahmed/sykell-crawler/internal/infrastructure/websockets"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000"
	},
}

type WSHandler struct {
	hub *websockets.Hub
}

func NewWSHandler(hub *websockets.Hub) *WSHandler {
	return &WSHandler{hub: hub}
}

// ServeWs handles websocket requests from the peer.
func (h *WSHandler) ServeWs(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &websockets.Client{UserID: userID, Conn: conn, Send: make(chan []byte, 256)}
	h.hub.Register(client)

	// Allow collection of memory referenced by the caller by doing all work in new goroutines.
	go h.writePump(client)
	go h.readPump(client)
}

// writePump pumps messages from the hub to the websocket connection.
func (h *WSHandler) writePump(client *websockets.Client) {
	defer func() {
		client.Conn.Close()
	}()
	for {
		message, ok := <-client.Send
		if !ok {
			// The hub closed the channel.
			// Send a proper close message with a status code.
			msg := websocket.FormatCloseMessage(websocket.CloseNormalClosure, "")
			client.Conn.WriteMessage(websocket.CloseMessage, msg)
			return
		}
		client.Conn.WriteMessage(websocket.TextMessage, message)
	}
}

// readPump pumps messages from the websocket connection to the hub.
func (h *WSHandler) readPump(client *websockets.Client) {
	defer func() {
		h.hub.Unregister(client)
		client.Conn.Close()
	}()
	for {
		// The server application doesn't need to read messages from the client for this use case,
		// but we need this loop to detect when the client closes the connection.
		if _, _, err := client.Conn.ReadMessage(); err != nil {
			break
		}
	}
}

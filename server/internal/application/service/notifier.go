package service

// Notifier defines the interface for sending real-time notifications.
type Notifier interface {
	Notify(userID uint, message []byte)
}

package entity

import "gorm.io/gorm"

// User represents a user in the system.
// It includes gorm.Model to get ID, CreatedAt, UpdatedAt, DeletedAt fields.
type User struct {
	gorm.Model
	FirstName    string  `gorm:"type:varchar(50);not null" json:"firstName"`
	LastName     string  `gorm:"type:varchar(50);not null" json:"lastName"`
	Email        string  `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	PasswordHash string  `gorm:"not null" json:"-"` // Never expose this field
	Crawls       []Crawl `json:"crawls,omitempty"`  // A user can have many crawls
}

package entity

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// BrokenLinkDetail is a helper struct for storing broken link information.
type BrokenLinkDetail struct {
	URL        string `json:"url"`
	StatusCode int    `json:"status_code"`
}

// Crawl represents the results of a single crawl operation performed by a user.
type Crawl struct {
	gorm.Model
	UserID           uint           `gorm:"not null" json:"user_id"`
	URL              string         `gorm:"type:varchar(2048);not null" json:"url"`
	Status           string         `gorm:"type:varchar(20);default:'PENDING'" json:"status"` // PENDING, PROCESSING, COMPLETED, FAILED
	HTMLVersion      string         `json:"html_version"`
	Title            string         `json:"title"`
	HeadingCounts    datatypes.JSON `gorm:"type:json" json:"heading_counts"` // Storing map[string]int
	InternalLinks    int            `json:"internal_links"`
	ExternalLinks    int            `json:"external_links"`
	BrokenLinks      int            `json:"broken_links"`
	BrokenLinkDetail datatypes.JSON `gorm:"type:json" json:"broken_link_detail"` // Storing []BrokenLinkDetail
	TotalLinks       int            `json:"total_links"`
	HasLoginForm     bool           `json:"has_login_form"`
	ProcessingTimeMs int64          `json:"processing_time_ms"`
	ErrorMessage     string         `gorm:"type:text" json:"error_message,omitempty"`
}

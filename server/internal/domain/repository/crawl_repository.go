package repository

import (
	"context"

	"github.com/diabahmed/sykell-crawler/internal/domain/entity"
)

// CrawlRepository defines the interface for crawl data operations.
type CrawlRepository interface {
	// Create saves a new crawl record to the database.
	Create(ctx context.Context, crawl *entity.Crawl) error

	// FindByUserID retrieves all crawl records for a specific user.
	FindByUserID(ctx context.Context, userID uint) ([]entity.Crawl, error)

	// FindByID retrieves a single crawl record by its ID and user ID.
	FindByID(ctx context.Context, id, userID uint) (*entity.Crawl, error)

	// Update modifies an existing crawl record in the database.
	Update(ctx context.Context, crawl *entity.Crawl) error

	// Delete removes a crawl record by its ID and user ID.
	Delete(ctx context.Context, id, userID uint) error

	// DeleteBulk removes multiple crawl records by their IDs and user ID.
	DeleteBulk(ctx context.Context, ids []uint, userID uint) error
}

package repository

import (
	"context"

	"github.com/diabahmed/sykell-crawler/internal/domain/entity"
	"github.com/diabahmed/sykell-crawler/internal/domain/repository"
	"gorm.io/gorm"
)

// gormCrawlRepository is the GORM implementation of the CrawlRepository.
type gormCrawlRepository struct {
	db *gorm.DB
}

// NewGormCrawlRepository creates a new instance of gormCrawlRepository.
func NewGormCrawlRepository(db *gorm.DB) repository.CrawlRepository {
	return &gormCrawlRepository{db: db}
}

// Create saves a new crawl record to the database.
func (r *gormCrawlRepository) Create(ctx context.Context, crawl *entity.Crawl) error {
	return r.db.WithContext(ctx).Create(crawl).Error
}

// FindByUserID retrieves all crawl records for a specific user.
func (r *gormCrawlRepository) FindByUserID(ctx context.Context, userID uint) ([]entity.Crawl, error) {
	var crawls []entity.Crawl
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("created_at desc").Find(&crawls).Error
	if err != nil {
		return nil, err
	}
	return crawls, nil
}

// FindByID retrieves a single crawl record by its ID, ensuring it belongs to the specified user.
func (r *gormCrawlRepository) FindByID(ctx context.Context, id, userID uint) (*entity.Crawl, error) {
	var crawl entity.Crawl
	err := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", id, userID).First(&crawl).Error
	if err != nil {
		return nil, err
	}
	return &crawl, nil
}

// Update modifies an existing crawl record in the database.
// GORM's Save method will update all fields of the record if it has a primary key.
func (r *gormCrawlRepository) Update(ctx context.Context, crawl *entity.Crawl) error {
	return r.db.WithContext(ctx).Save(crawl).Error
}

// Delete removes a single crawl record, ensuring it belongs to the user.
func (r *gormCrawlRepository) Delete(ctx context.Context, id, userID uint) error {
	// We use a transaction to first find the record to ensure it belongs to the user,
	// then delete it. This is a crucial security check.
	// GORM's delete won't return an error if the record doesn't exist, so we check first.
	var crawl entity.Crawl
	if err := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", id, userID).First(&crawl).Error; err != nil {
		return err // Returns gorm.ErrRecordNotFound if not found/owned
	}
	return r.db.WithContext(ctx).Delete(&crawl).Error
}

// DeleteBulk removes multiple crawl records, ensuring they all belong to the user.
func (r *gormCrawlRepository) DeleteBulk(ctx context.Context, ids []uint, userID uint) error {
	// The WHERE clause ensures we only delete records that match both the ID list AND the user ID.
	// This prevents a user from deleting other users' records.
	return r.db.WithContext(ctx).Where("id IN ? AND user_id = ?", ids, userID).Delete(&entity.Crawl{}).Error
}

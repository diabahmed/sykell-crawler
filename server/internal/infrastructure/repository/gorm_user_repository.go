package repository

import (
	"context"

	"github.com/diabahmed/sykell-crawler/internal/domain/entity"
	"github.com/diabahmed/sykell-crawler/internal/domain/repository"
	"gorm.io/gorm"
)

// gormUserRepository is the GORM implementation of the UserRepository interface.
type gormUserRepository struct {
	db *gorm.DB
}

// NewGormUserRepository creates a new instance of gormUserRepository.
// It takes a GORM DB connection and returns a UserRepository interface.
// This is a key part of our dependency injection setup.
func NewGormUserRepository(db *gorm.DB) repository.UserRepository {
	return &gormUserRepository{db: db}
}

// Create saves a new user to the database.
func (r *gormUserRepository) Create(ctx context.Context, user *entity.User) error {
	// WithContext allows us to pass the request context down to the database driver,
	// enabling features like query cancellation.
	return r.db.WithContext(ctx).Create(user).Error
}

// FindByEmail retrieves a user by their email address.
// GORM returns a specific 'ErrRecordNotFound' error if no record is found.
func (r *gormUserRepository) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	var user entity.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByID retrieves a user by their ID.
func (r *gormUserRepository) FindByID(ctx context.Context, id uint) (*entity.User, error) {
	var user entity.User
	err := r.db.WithContext(ctx).First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

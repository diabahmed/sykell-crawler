package repository

import (
	"context"

	"github.com/diabahmed/sykell-crawler/internal/domain/entity"
)

// UserRepository defines the interface for user data operations.
// The application layer will depend on this, and the infrastructure layer will implement it.
type UserRepository interface {
	// Create saves a new user to the database.
	Create(ctx context.Context, user *entity.User) error

	// FindByEmail retrieves a user by their email address.
	FindByEmail(ctx context.Context, email string) (*entity.User, error)

	// FindByID retrieves a user by their ID.
	FindByID(ctx context.Context, id uint) (*entity.User, error)
}

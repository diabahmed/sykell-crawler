package service

import (
	"context"
	"errors"

	"github.com/diabahmed/sykell-crawler/internal/domain/entity"
	"github.com/diabahmed/sykell-crawler/internal/domain/repository"
	"github.com/diabahmed/sykell-crawler/internal/shared/utils"
	"gorm.io/gorm"
)

// UserService defines the interface for user-related business logic.
type UserService interface {
	Register(ctx context.Context, email, password string, firstName, lastName string) (*entity.User, error)
	Login(ctx context.Context, email, password string) (*entity.User, error)
	GetUserByID(ctx context.Context, id uint) (*entity.User, error)
}

type userService struct {
	userRepo repository.UserRepository
}

// NewUserService creates a new instance of UserService.
func NewUserService(repo repository.UserRepository) UserService {
	return &userService{userRepo: repo}
}

// Register handles the logic for creating a new user.
func (s *userService) Register(ctx context.Context, email, password string, firstName, lastName string) (*entity.User, error) {
	// Check if user already exists
	_, err := s.userRepo.FindByEmail(ctx, email)
	if err == nil {
		// User found, so it's an error for registration
		return nil, errors.New("user with this email already exists")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		// A different error occurred
		return nil, err
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}

	// Create the user entity
	newUser := &entity.User{
		FirstName:    firstName,
		LastName:     lastName,
		Email:        email,
		PasswordHash: hashedPassword,
	}

	// Save to database
	if err := s.userRepo.Create(ctx, newUser); err != nil {
		return nil, err
	}

	return newUser, nil
}

// Login handles the user authentication logic.
func (s *userService) Login(ctx context.Context, email, password string) (*entity.User, error) {
	// Find user by email
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}

	// Check password
	if !utils.CheckPasswordHash(password, user.PasswordHash) {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

// GetUserByID retrieves a user by their ID.
// This method is useful for fetching user details after authentication.
func (s *userService) GetUserByID(ctx context.Context, id uint) (*entity.User, error) { // <-- ADD THIS
	return s.userRepo.FindByID(ctx, id)
}

package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// TokenManager provides an interface for JWT token generation and validation.
type TokenManager interface {
	Generate(userID uint) (string, error)
	Validate(tokenString string) (*jwt.RegisteredClaims, error)
}

type jwtManager struct {
	secretKey     string
	tokenDuration time.Duration
}

// NewJWTManager creates a new instance of TokenManager.
func NewJWTManager(secretKey string, tokenDuration time.Duration) TokenManager {
	return &jwtManager{secretKey: secretKey, tokenDuration: tokenDuration}
}

// Generate creates a new JWT for a given user ID.
func (m *jwtManager) Generate(userID uint) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   fmt.Sprint(userID),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.tokenDuration)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(m.secretKey))
}

// Validate checks the validity of a JWT string.
func (m *jwtManager) Validate(tokenString string) (*jwt.RegisteredClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Check the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(m.secretKey), nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

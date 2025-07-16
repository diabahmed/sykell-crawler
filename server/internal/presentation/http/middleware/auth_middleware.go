package middleware

import (
	"net/http"
	"strconv"

	"github.com/diabahmed/sykell-crawler/internal/infrastructure/auth"
	"github.com/gin-gonic/gin"
)

const (
	AuthorizationHeaderKey  = "Authorization"
	AuthorizationTypeBearer = "bearer"
	AuthorizationPayloadKey = "authorization_payload"
)

// AuthMiddleware creates a Gin middleware for authorization.
func AuthMiddleware(tokenManager auth.TokenManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodOptions { // let CORS pre‑flights through
			c.Status(http.StatusOK)
			return
		}

		// Extract the token from the "access_token" cookie.
		accessToken, err := c.Cookie("access_token")
		if err != nil {
			// http.ErrNoCookie means the cookie was not found.
			// check the query parameter for WebSockets.
			accessToken = c.Query("token")
		}
		if accessToken == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization token not provided"})
			return
		}

		claims, err := tokenManager.Validate(accessToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		userID, err := strconv.ParseUint(claims.Subject, 10, 32)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid user ID in token"})
			return
		}

		c.Set("userID", uint(userID))
		c.Next()
	}
}

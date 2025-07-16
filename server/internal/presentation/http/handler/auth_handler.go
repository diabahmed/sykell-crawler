package handler

import (
	"net/http"
	"time"

	"github.com/diabahmed/sykell-crawler/internal/application/service"
	"github.com/diabahmed/sykell-crawler/internal/infrastructure/auth"
	"github.com/diabahmed/sykell-crawler/internal/infrastructure/websockets"
	"github.com/diabahmed/sykell-crawler/internal/presentation/dto/request"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userService  service.UserService
	tokenManager auth.TokenManager
	hub          *websockets.Hub
}

func NewAuthHandler(userService service.UserService, tokenManager auth.TokenManager, hub *websockets.Hub) *AuthHandler {
	return &AuthHandler{
		userService:  userService,
		tokenManager: tokenManager,
		hub:          hub,
	}
}

// Register godoc
// @Summary      Register a new user
// @Description  Creates a new user account with a name, email and password.
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Param        user body request.RegisterRequest true "User Registration Info"
// @Success      201  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req request.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.userService.Register(c.Request.Context(), req.Email, req.Password, req.FirstName, req.LastName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "user registered successfully"})
}

// Login godoc
// @Summary      Log in a user
// @Description  Authenticates a user and returns a JWT token.
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Param        credentials body request.LoginRequest true "User Login Credentials"
// @Success      200  {object}  response.LoginResponse
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req request.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	token, err := h.tokenManager.Generate(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	// maxAge is in seconds. 24 hours = 24 * 60 * 60 seconds.
	maxAge := int(24 * time.Hour.Seconds())

	c.SetCookie(
		"access_token", // Cookie name
		token,          // Cookie value (the JWT)
		maxAge,         // Max age in seconds
		"/",            // Path: Cookie is only sent for requests to /
		"",             // Domain: "" means the cookie is valid for the current domain
		false,          // Secure: Cookie only sent over HTTPS (set to false for local HTTP dev)
		true,           // HttpOnly: Cookie cannot be accessed by client-side JavaScript
	)

	c.JSON(http.StatusOK, gin.H{"message": "login successful"})
}

// Logout godoc
// @Summary      Log out a user
// @Description  Deletes the user's session by clearing the JWT cookie and disconnecting the WebSocket.
// @Tags         Authentication
// @Produce      json
// @Success      200  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	// Get the user ID from the context, which was set by the auth middleware.
	userID := c.MustGet("userID").(uint)

	// Tell the hub to disconnect any active WebSocket for this user.
	h.hub.Disconnect(userID)

	// To "delete" a cookie, we set it again with a maxAge in the past.
	c.SetCookie(
		"access_token",
		"",
		-1,
		"/",
		"",
		false,
		true,
	)
	c.JSON(http.StatusOK, gin.H{"message": "logout successful"})
}

// GetMe godoc
// @Summary      Get current user info
// @Description  Retrieves the authenticated user's details.
// @Tags         Authentication
// @Produce      json
// @Success      200  {object}  entity.User
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /auth/me [get]
// @Security     BearerAuth
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	user, err := h.userService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

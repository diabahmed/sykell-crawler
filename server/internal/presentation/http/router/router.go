package router

import (
	"time"

	"github.com/diabahmed/sykell-crawler/internal/application/service"
	"github.com/diabahmed/sykell-crawler/internal/infrastructure/auth"
	"github.com/diabahmed/sykell-crawler/internal/infrastructure/websockets"
	"github.com/diabahmed/sykell-crawler/internal/presentation/http/handler"
	"github.com/diabahmed/sykell-crawler/internal/presentation/http/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func NewRouter(
	userService service.UserService,
	crawlService service.CrawlService,
	tokenManager auth.TokenManager,
	hub *websockets.Hub,
) *gin.Engine {
	router := gin.Default()

	// --- CONFIGURE AND APPLY CORS MIDDLEWARE ---
	// This configuration is permissive for local development.
	// For production, we should restrict origins to our frontend's domain.
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type", "Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Add the swagger route
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	authHandler := handler.NewAuthHandler(userService, tokenManager, hub)
	crawlHandler := handler.NewCrawlHandler(crawlService)
	wsHandler := handler.NewWSHandler(hub)

	// Group routes under /api/v1
	v1 := router.Group("/api/v1")
	{
		// Auth routes are public except for logout
		authRoutes := v1.Group("/auth")
		{
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/login", authHandler.Login)
			authRoutes.POST("/logout", middleware.AuthMiddleware(tokenManager), authHandler.Logout)
			authRoutes.GET("/me", middleware.AuthMiddleware(tokenManager), authHandler.GetMe)
		}

		// Crawl routes are protected by the auth middleware
		crawlRoutes := v1.Group("/crawls").Use(middleware.AuthMiddleware(tokenManager))
		{
			crawlRoutes.POST("", crawlHandler.StartCrawl)
			crawlRoutes.GET("", crawlHandler.GetCrawlHistory)
			crawlRoutes.GET("/:id", crawlHandler.GetCrawlResult)
			crawlRoutes.POST("/:id/rerun", crawlHandler.RerunCrawl)
			crawlRoutes.DELETE("/:id", crawlHandler.DeleteCrawl)
			crawlRoutes.DELETE("/bulk", crawlHandler.DeleteCrawlsBulk)
		}

		v1.GET("/ws", middleware.AuthMiddleware(tokenManager), wsHandler.ServeWs)
	}

	return router
}

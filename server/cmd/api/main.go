package main

import (
	"log"

	"github.com/diabahmed/sykell-crawler/internal/application/service"
	"github.com/diabahmed/sykell-crawler/internal/infrastructure/auth"
	"github.com/diabahmed/sykell-crawler/internal/infrastructure/config"
	"github.com/diabahmed/sykell-crawler/internal/infrastructure/crawler"
	"github.com/diabahmed/sykell-crawler/internal/infrastructure/database"
	infra_repo "github.com/diabahmed/sykell-crawler/internal/infrastructure/repository"
	"github.com/diabahmed/sykell-crawler/internal/infrastructure/websockets"
	"github.com/diabahmed/sykell-crawler/internal/presentation/http/router"
)

// @title Web Crawler API
// @version 1.0
// @description This is a multi-tenant API for crawling web pages.
// @description Users can register, log in, and submit URLs to be crawled.

// @contact.name Ahmed Diab
// @contact.url https://www.linkedin.com/in/diabahmed/
// @contact.email ahmed.diab.eu@gmail.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and a JWT token.
func main() {
	// 1. Load Configuration from app.env file
	cfg, err := config.LoadConfig(".") // "." means look in the current directory
	if err != nil {
		log.Fatalf("cannot load config: %v", err)
	}

	// 2. Initialize Database Connection
	db := database.ConnectDB(cfg.DBSource)

	// 3. Initialize Infrastructure Dependencies
	userRepo := infra_repo.NewGormUserRepository(db)
	crawlRepo := infra_repo.NewGormCrawlRepository(db)
	tokenManager := auth.NewJWTManager(cfg.TokenSymmetricKey, cfg.AccessTokenDuration)
	crawlerEngine := crawler.NewWebCrawler()
	hub := websockets.NewHub() // CREATE THE HUB
	go hub.Run()               // RUN THE HUB IN A BACKGROUND GOROUTINE

	// 4. Initialize Application Services (injecting dependencies)
	userService := service.NewUserService(userRepo)
	crawlService := service.NewCrawlService(crawlRepo, crawlerEngine, hub)

	// 5. Setup Presentation Layer (Router)
	router := router.NewRouter(userService, crawlService, tokenManager, hub)

	// 6. Start the HTTP Server
	log.Printf("Starting server on %s", cfg.ServerAddress)
	if err := router.Run(cfg.ServerAddress); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

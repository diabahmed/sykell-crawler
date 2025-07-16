package database

import (
	"log"

	"github.com/diabahmed/sykell-crawler/internal/domain/entity"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// ConnectDB initializes the database connection and runs auto-migrations.
func ConnectDB(dsn string) *gorm.DB {
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	log.Println("Database connection successfully established")

	// Auto-migrate the schema to create/update tables.
	err = db.AutoMigrate(&entity.User{}, &entity.Crawl{})
	if err != nil {
		log.Fatalf("failed to auto-migrate database: %v", err)
	}
	log.Println("Database migrated successfully")

	return db
}

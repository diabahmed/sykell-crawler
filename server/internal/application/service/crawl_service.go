package service

import (
	"context"
	"encoding/json"
	"log"

	"github.com/diabahmed/sykell-crawler/internal/domain/entity"
	"github.com/diabahmed/sykell-crawler/internal/domain/repository"
	"github.com/diabahmed/sykell-crawler/internal/infrastructure/crawler"
)

type CrawlService interface {
	StartCrawl(ctx context.Context, userID uint, targetURL string) (*entity.Crawl, error)
	GetCrawlHistory(ctx context.Context, userID uint) ([]entity.Crawl, error)
	GetCrawlResult(ctx context.Context, crawlID, userID uint) (*entity.Crawl, error)
	RerunCrawl(ctx context.Context, crawlID uint, userID uint) (*entity.Crawl, error)
	DeleteCrawl(ctx context.Context, crawlID, userID uint) error
	DeleteCrawlsBulk(ctx context.Context, crawlIDs []uint, userID uint) error
}

type crawlService struct {
	crawlRepo repository.CrawlRepository
	crawler   *crawler.WebCrawler
	notifier  Notifier
}

func NewCrawlService(repo repository.CrawlRepository, crawler *crawler.WebCrawler, notifier Notifier) CrawlService {
	return &crawlService{
		crawlRepo: repo,
		crawler:   crawler,
		notifier:  notifier,
	}
}

func (s *crawlService) GetCrawlHistory(ctx context.Context, userID uint) ([]entity.Crawl, error) {
	return s.crawlRepo.FindByUserID(ctx, userID)
}

func (s *crawlService) GetCrawlResult(ctx context.Context, crawlID, userID uint) (*entity.Crawl, error) {
	return s.crawlRepo.FindByID(ctx, crawlID, userID)
}

func (s *crawlService) StartCrawl(ctx context.Context, userID uint, targetURL string) (*entity.Crawl, error) {
	crawl := &entity.Crawl{
		UserID: userID,
		URL:    targetURL,
		Status: "PENDING",
	}

	if err := s.crawlRepo.Create(ctx, crawl); err != nil {
		log.Printf("Error creating initial crawl record: %v", err)
		return nil, err
	}

	go s.performCrawl(crawl)

	return crawl, nil
}

// performCrawl is the background worker that executes the crawl.
// We make a small change to ensure it notifies clients when it starts processing.
func (s *crawlService) performCrawl(crawlRecord *entity.Crawl) {
	ctx := context.Background()

	// Update status to PROCESSING and save immediately.
	crawlRecord.Status = "PROCESSING"
	// Notify clients about the status change to PROCESSING
	s.notifyStatusUpdate(crawlRecord)
	if err := s.crawlRepo.Update(ctx, crawlRecord); err != nil {
		log.Printf("Error updating crawl status to PROCESSING for ID %d: %v", crawlRecord.ID, err)
	}

	log.Printf("Starting crawl for URL: %s (ID: %d)", crawlRecord.URL, crawlRecord.ID)
	pageInfo, err := s.crawler.CrawlPage(crawlRecord.URL)

	// Now, populate the final results into the crawlRecord struct.
	if err != nil {
		log.Printf("Crawl failed for URL %s: %v", crawlRecord.URL, err)
		crawlRecord.Status = "FAILED"
		crawlRecord.ErrorMessage = err.Error()
	} else {
		log.Printf("Crawl completed for URL: %s", crawlRecord.URL)
		crawlRecord.Status = "COMPLETED"
		crawlRecord.HTMLVersion = pageInfo.HTMLVersion
		crawlRecord.Title = pageInfo.Title
		crawlRecord.InternalLinks = pageInfo.InternalLinks
		crawlRecord.ExternalLinks = pageInfo.ExternalLinks
		crawlRecord.BrokenLinks = pageInfo.BrokenLinks
		crawlRecord.TotalLinks = pageInfo.TotalLinks
		crawlRecord.HasLoginForm = pageInfo.HasLoginForm
		crawlRecord.ProcessingTimeMs = pageInfo.ProcessingTime.Milliseconds()

		headingsJSON, _ := json.Marshal(pageInfo.HeadingCounts)
		crawlRecord.HeadingCounts = headingsJSON
		brokenLinksJSON, _ := json.Marshal(pageInfo.BrokenLinkDetail)
		crawlRecord.BrokenLinkDetail = brokenLinksJSON
	}

	// Notify clients about the final status (COMPLETED or FAILED)
	s.notifyStatusUpdate(crawlRecord)
	// Save the final, updated record to the database.
	if err := s.crawlRepo.Update(ctx, crawlRecord); err != nil {
		log.Printf("Error saving final crawl result for ID %d: %v", crawlRecord.ID, err)
	} else {
		log.Printf("Crawl %d finished and saved with status: %s", crawlRecord.ID, crawlRecord.Status)
	}
}

// Helper function to send notifications
func (s *crawlService) notifyStatusUpdate(crawlRecord *entity.Crawl) {
	updateMsg, err := json.Marshal(crawlRecord)
	if err != nil {
		log.Printf("Error marshalling crawl update for notification: %v", err)
		return
	}
	s.notifier.Notify(crawlRecord.UserID, updateMsg)
}

// RerunCrawl now finds, resets, and updates an existing crawl record.
func (s *crawlService) RerunCrawl(ctx context.Context, crawlID, userID uint) (*entity.Crawl, error) {
	// 1. Verify the user owns the original crawl.
	crawlToRerun, err := s.crawlRepo.FindByID(ctx, crawlID, userID)
	if err != nil {
		return nil, err // Fails if not found or not owned by user
	}

	// 2. Reset the fields of the existing crawl record.
	crawlToRerun.Status = "PENDING"
	crawlToRerun.HTMLVersion = ""
	crawlToRerun.Title = ""
	crawlToRerun.HeadingCounts = nil
	crawlToRerun.InternalLinks = 0
	crawlToRerun.ExternalLinks = 0
	crawlToRerun.BrokenLinks = 0
	crawlToRerun.TotalLinks = 0
	crawlToRerun.BrokenLinkDetail = nil
	crawlToRerun.HasLoginForm = false
	crawlToRerun.ProcessingTimeMs = 0
	crawlToRerun.ErrorMessage = ""

	// 3. Save these reset fields to the database immediately.
	if err := s.crawlRepo.Update(ctx, crawlToRerun); err != nil {
		log.Printf("Error resetting crawl record for re-run (ID %d): %v", crawlToRerun.ID, err)
		return nil, err
	}

	// 4. Notify the client via WebSocket that the status is now PENDING.
	s.notifyStatusUpdate(crawlToRerun)

	// 5. Launch the background crawl job on the updated record.
	go s.performCrawl(crawlToRerun)

	// 6. Return the updated "PENDING" record to the user.
	return crawlToRerun, nil
}

// DeleteCrawl deletes a single crawl record.
func (s *crawlService) DeleteCrawl(ctx context.Context, crawlID, userID uint) error {
	return s.crawlRepo.Delete(ctx, crawlID, userID)
}

// DeleteCrawlsBulk deletes multiple crawl records.
func (s *crawlService) DeleteCrawlsBulk(ctx context.Context, crawlIDs []uint, userID uint) error {
	return s.crawlRepo.DeleteBulk(ctx, crawlIDs, userID)
}

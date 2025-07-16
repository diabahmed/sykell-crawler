package handler

import (
	"net/http"
	"strconv"

	"github.com/diabahmed/sykell-crawler/internal/application/service"
	"github.com/diabahmed/sykell-crawler/internal/presentation/dto/request"
	"github.com/gin-gonic/gin"
)

type CrawlHandler struct {
	crawlService service.CrawlService
}

func NewCrawlHandler(crawlService service.CrawlService) *CrawlHandler {
	return &CrawlHandler{crawlService: crawlService}
}

// StartCrawl godoc
// @Summary      Start a new crawl job
// @Description  Submits a URL to be crawled. The job is processed in the background.
// @Tags         Crawling
// @Accept       json
// @Produce      json
// @Param        url body request.CrawlRequest true "URL to Crawl"
// @Success      202  {object}  entity.Crawl
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /crawls [post]
func (h *CrawlHandler) StartCrawl(c *gin.Context) {
	var req request.CrawlRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Retrieve userID from the context (set by the auth middleware)
	userID := c.MustGet("userID").(uint)

	crawl, err := h.crawlService.StartCrawl(c.Request.Context(), userID, req.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to start crawl"})
		return
	}

	c.JSON(http.StatusAccepted, crawl)
}

// GetCrawlHistory godoc
// @Summary      Get user's crawl history
// @Description  Retrieves a list of all crawl jobs initiated by the logged-in user.
// @Tags         Crawling
// @Produce      json
// @Success      200  {array}  entity.Crawl
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /crawls [get]
func (h *CrawlHandler) GetCrawlHistory(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	history, err := h.crawlService.GetCrawlHistory(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve crawl history"})
		return
	}

	c.JSON(http.StatusOK, history)
}

// GetCrawlResult godoc
// @Summary      Get a specific crawl result
// @Description  Retrieves the detailed result of a single crawl job by its ID.
// @Tags         Crawling
// @Produce      json
// @Param        id   path      int  true  "Crawl ID"
// @Success      200  {object}  entity.Crawl
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Security     BearerAuth
// @Router       /crawls/{id} [get]
func (h *CrawlHandler) GetCrawlResult(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	crawlID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid crawl ID"})
		return
	}

	result, err := h.crawlService.GetCrawlResult(c.Request.Context(), uint(crawlID), userID)
	if err != nil {
		// This could be not found or another error
		c.JSON(http.StatusNotFound, gin.H{"error": "crawl result not found"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// RerunCrawl handles the request to re-run a crawl.
func (h *CrawlHandler) RerunCrawl(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	crawlID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid crawl ID"})
		return
	}

	// The service now handles the update logic.
	updatedCrawl, err := h.crawlService.RerunCrawl(c.Request.Context(), uint(crawlID), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "crawl not found or permission denied"})
		return
	}

	// Return the updated crawl record, which will have a "PENDING" status.
	c.JSON(http.StatusAccepted, updatedCrawl)
}

// DeleteCrawl handles the request to delete a single crawl.
func (h *CrawlHandler) DeleteCrawl(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	crawlID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid crawl ID"})
		return
	}

	if err := h.crawlService.DeleteCrawl(c.Request.Context(), uint(crawlID), userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "crawl not found or permission denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "crawl deleted successfully"})
}

// DeleteCrawlsBulk handles the request to delete multiple crawls.
func (h *CrawlHandler) DeleteCrawlsBulk(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var req request.BulkDeleteRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.crawlService.DeleteCrawlsBulk(c.Request.Context(), req.IDs, userID); err != nil {
		// This could be a partial success, but for simplicity, we treat any error as a failure.
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete one or more crawls"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "selected crawls deleted successfully"})
}

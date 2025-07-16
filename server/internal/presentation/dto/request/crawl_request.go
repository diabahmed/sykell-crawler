package request

// CrawlRequest defines the structure for starting a new crawl.
type CrawlRequest struct {
	URL string `json:"url" binding:"required,url"`
}

// BulkDeleteRequest defines the structure for a bulk delete request.
type BulkDeleteRequest struct {
	IDs []uint `json:"ids" binding:"required,min=1"`
}

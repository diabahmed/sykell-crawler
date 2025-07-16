package crawler

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly/v2"
)

// PageInfo is the result of a crawl.
type PageInfo struct {
	URL              string             `json:"url"`
	HTMLVersion      string             `json:"html_version"`
	Title            string             `json:"title"`
	HeadingCounts    map[string]int     `json:"heading_counts"`
	InternalLinks    int                `json:"internal_links"`
	ExternalLinks    int                `json:"external_links"`
	BrokenLinks      int                `json:"broken_links"`
	BrokenLinkDetail []BrokenLinkStatus `json:"broken_link_detail"`
	TotalLinks       int                `json:"total_links"`
	HasLoginForm     bool               `json:"has_login_form"`
	ProcessingTime   time.Duration      `json:"processing_time"`
}

// BrokenLinkStatus holds details of a broken link.
type BrokenLinkStatus struct {
	URL        string `json:"url"`
	StatusCode int    `json:"status_code"`
}

// WebCrawler is the main crawler struct.
type WebCrawler struct {
	httpClient *http.Client
	linkCache  map[string]BrokenLinkStatus
	cacheMux   sync.RWMutex
	userAgent  string
}

// NewWebCrawler creates a new crawler instance.
func NewWebCrawler() *WebCrawler {
	return &WebCrawler{
		httpClient: &http.Client{Timeout: 10 * time.Second},
		linkCache:  make(map[string]BrokenLinkStatus),
		userAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
	}
}

// CrawlPage performs the crawl on a single target URL.
func (wc *WebCrawler) CrawlPage(targetURL string) (*PageInfo, error) {
	start := time.Now()

	// Check if the target URL is an actual URL with an accessible domain
	req, _ := http.NewRequest("HEAD", targetURL, nil)
	req.Header.Set("User-Agent", wc.userAgent)
	resp, err := wc.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to reach target URL: %w", err)
	}
	defer resp.Body.Close()

	parsedBaseURL, err := url.Parse(targetURL)
	if err != nil {
		return nil, fmt.Errorf("invalid target URL: %w", err)
	}

	info := &PageInfo{
		URL:           targetURL,
		HeadingCounts: make(map[string]int),
	}

	c := colly.NewCollector(colly.Async(true), colly.MaxDepth(1))
	c.UserAgent = wc.userAgent
	c.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 10, Delay: 100 * time.Millisecond})
	c.SetRequestTimeout(30 * time.Second)

	var links []string
	var linksMux, infoMux sync.Mutex

	c.OnHTML("html", func(e *colly.HTMLElement) {
		info.HTMLVersion = extractHTMLVersion(string(e.Response.Body))
		info.HasLoginForm = hasLoginFormHTML(string(e.Response.Body))
	})
	c.OnHTML("title", func(e *colly.HTMLElement) {
		infoMux.Lock()
		defer infoMux.Unlock()
		if info.Title == "" {
			info.Title = strings.TrimSpace(e.Text)
		}
	})
	for i := 1; i <= 6; i++ {
		tag := fmt.Sprintf("h%d", i)
		c.OnHTML(tag, func(e *colly.HTMLElement) {
			infoMux.Lock()
			info.HeadingCounts[strings.ToUpper(e.Name)]++
			infoMux.Unlock()
		})
	}
	c.OnHTML("a[href]", func(e *colly.HTMLElement) {
		href := e.Attr("href")
		if href != "" && !strings.HasPrefix(href, "#") && !strings.HasPrefix(href, "javascript:") && !strings.HasPrefix(href, "mailto:") {
			absURL := resolveURL(parsedBaseURL, href)
			linksMux.Lock()
			links = append(links, absURL)
			linksMux.Unlock()
		}
	})

	if err := c.Visit(targetURL); err != nil {
		return nil, err
	}
	c.Wait()

	uniqueLinks := getUniqueLinks(links)
	info.TotalLinks = len(uniqueLinks)
	var wg sync.WaitGroup

	for _, link := range uniqueLinks {
		if isInternalLink(parsedBaseURL, link) {
			info.InternalLinks++
		} else {
			info.ExternalLinks++
		}
		wg.Add(1)
		go func(l string) {
			defer wg.Done()
			if isBroken, statusCode := wc.checkLinkStatus(l); isBroken {
				infoMux.Lock()
				info.BrokenLinks++
				info.BrokenLinkDetail = append(info.BrokenLinkDetail, BrokenLinkStatus{URL: l, StatusCode: statusCode})
				infoMux.Unlock()
			}
		}(link)
	}

	wg.Wait()
	info.ProcessingTime = time.Since(start)
	return info, nil
}

func (wc *WebCrawler) checkLinkStatus(link string) (bool, int) {
	wc.cacheMux.RLock()
	cached, exists := wc.linkCache[link]
	wc.cacheMux.RUnlock()
	if exists {
		return cached.StatusCode >= 400, cached.StatusCode
	}
	req, _ := http.NewRequest("HEAD", link, nil)
	req.Header.Set("User-Agent", wc.userAgent)
	resp, err := wc.httpClient.Do(req)
	if err != nil {
		return true, 0
	}
	defer resp.Body.Close()
	status := resp.StatusCode
	wc.cacheMux.Lock()
	wc.linkCache[link] = BrokenLinkStatus{URL: link, StatusCode: status}
	wc.cacheMux.Unlock()
	return status >= 400, status
}

func resolveURL(baseURL *url.URL, href string) string {
	if strings.HasPrefix(href, "http://") || strings.HasPrefix(href, "https://") {
		return href
	}
	resolved, err := baseURL.Parse(href)
	if err != nil {
		return href
	}
	return resolved.String()
}

func isInternalLink(baseURL *url.URL, link string) bool {
	parsed, err := url.Parse(link)
	if err != nil {
		return false
	}
	return parsed.Host == "" || parsed.Host == baseURL.Host
}

func getUniqueLinks(links []string) []string {
	seen, unique := make(map[string]struct{}), make([]string, 0)
	for _, link := range links {
		if _, ok := seen[link]; !ok {
			seen[link], unique = struct{}{}, append(unique, link)
		}
	}
	return unique
}

func extractHTMLVersion(html string) string {
	l := strings.ToLower(html)
	versions := map[string]string{
		"<!doctype html>":                  "HTML5",
		"//dtd html 4.01 strict//en":       "HTML 4.01 Strict",
		"//dtd html 4.01 transitional//en": "HTML 4.01 Transitional",
		"//dtd html 4.01 frameset//en":     "HTML 4.01 Frameset",
		"//dtd html 3.2 final//en":         "HTML 3.2",
		"//dtd html 2.0//en":               "HTML 2.0",
		"//dtd xhtml 1.0 strict//en":       "XHTML 1.0 Strict",
		"//dtd xhtml 1.0 transitional//en": "XHTML 1.0 Transitional",
		"//dtd xhtml 1.0 frameset//en":     "XHTML 1.0 Frameset",
		"//dtd xhtml 1.1//en":              "XHTML 1.1",
	}
	for p, v := range versions {
		if strings.Contains(l, p) {
			return v
		}
	}
	return "Unknown"
}

func hasLoginFormHTML(html string) bool {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return false
	}
	return doc.Find("form input[type='password']").Length() > 0
}

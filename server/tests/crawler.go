package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly/v2"
	"github.com/gocolly/colly/v2/debug"
)

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
	ProcessingTime   time.Duration      `json:"-"`
}

type BrokenLinkStatus struct {
	URL        string `json:"url"`
	StatusCode int    `json:"status_code"`
}

type WebCrawler struct {
	baseURL     *url.URL
	collector   *colly.Collector
	httpClient  *http.Client
	brokenLinks sync.Map
	wg          sync.WaitGroup
	mu          sync.Mutex
}

func NewWebCrawler(baseURL string, enableDebug bool) (*WebCrawler, error) {
	parsedURL, err := url.Parse(baseURL)
	if err != nil {
		return nil, err
	}

	opts := []colly.CollectorOption{
		colly.Async(true),
		colly.MaxDepth(1),
	}

	if enableDebug {
		opts = append(opts, colly.Debugger(&debug.LogDebugger{}))
	}

	c := colly.NewCollector(opts...)

	// Set a global User Agent
	c.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"

	// OnError callback
	c.OnError(func(_ *colly.Response, err error) {
		log.Println("Something went wrong:", err)
	})
	c.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 10, Delay: 100 * time.Millisecond})
	c.SetRequestTimeout(30 * time.Second)
	client := &http.Client{Timeout: 10 * time.Second}
	return &WebCrawler{
		baseURL:    parsedURL,
		collector:  c,
		httpClient: client,
	}, nil
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

	for pattern, version := range versions {
		if strings.Contains(l, pattern) {
			return version
		}
	}

	return "Unknown"
}

func hasLoginFormHTML(html string) bool {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return false
	}
	found := false
	doc.Find("form").Each(func(i int, s *goquery.Selection) {
		if s.Find("input[type='password']").Length() > 0 {
			found = true
		}
	})
	return found
}

func (wc *WebCrawler) isInternalLink(link string) bool {
	parsed, err := url.Parse(link)
	if err != nil {
		return false
	}
	if parsed.Host == "" {
		return true
	}
	return parsed.Host == wc.baseURL.Host
}

func (wc *WebCrawler) resolveURL(href string) string {
	if strings.HasPrefix(href, "http://") || strings.HasPrefix(href, "https://") {
		return href
	}
	resolved, err := wc.baseURL.Parse(href)
	if err != nil {
		return href
	}
	return resolved.String()
}

func (wc *WebCrawler) checkLinkStatus(link string) (bool, int) {
	if cached, exists := wc.brokenLinks.Load(link); exists {
		s := cached.(BrokenLinkStatus)
		return s.StatusCode >= 400, s.StatusCode
	}

	resp, err := wc.httpClient.Head(link)
	if err != nil {
		resp, err = wc.httpClient.Get(link)
		if err != nil {
			wc.brokenLinks.Store(link, BrokenLinkStatus{URL: link, StatusCode: 0})
			return true, 0
		}
	}
	defer resp.Body.Close()

	status := resp.StatusCode
	isBroken := status >= 400
	wc.brokenLinks.Store(link, BrokenLinkStatus{URL: link, StatusCode: status})
	return isBroken, status
}

func (wc *WebCrawler) CrawlPage(target string) (*PageInfo, error) {
	start := time.Now()
	info := &PageInfo{
		URL:           target,
		HeadingCounts: make(map[string]int),
	}
	var htmlRaw string
	var links []string
	headingTags := []string{"h1", "h2", "h3", "h4", "h5", "h6"}

	wc.collector.OnHTML("html", func(e *colly.HTMLElement) {
		htmlRaw = string(e.Response.Body)
		info.HTMLVersion = extractHTMLVersion(htmlRaw)
	})

	wc.collector.OnHTML("title", func(e *colly.HTMLElement) {
		wc.mu.Lock()
		defer wc.mu.Unlock()
		if info.Title == "" {
			info.Title = strings.TrimSpace(e.Text)
		}
	})

	for _, tag := range headingTags {
		wc.collector.OnHTML(tag, func(e *colly.HTMLElement) {
			wc.mu.Lock()
			info.HeadingCounts[strings.ToUpper(e.Name)]++
			wc.mu.Unlock()
		})
	}

	wc.collector.OnHTML("a[href]", func(e *colly.HTMLElement) {
		href := e.Attr("href")
		if href != "" && !strings.HasPrefix(href, "#") &&
			!strings.HasPrefix(href, "javascript:") &&
			!strings.HasPrefix(href, "mailto:") {
			abs := wc.resolveURL(href)
			wc.mu.Lock()
			links = append(links, abs)
			wc.mu.Unlock()
		}
	})

	wc.collector.OnResponse(func(r *colly.Response) {
		info.HasLoginForm = hasLoginFormHTML(string(r.Body))
	})

	err := wc.collector.Visit(target)
	if err != nil {
		return nil, err
	}
	wc.collector.Wait()

	// Deduplicate links
	seenLinks := make(map[string]struct{})
	for _, link := range links {
		if _, ok := seenLinks[link]; ok {
			continue
		}
		seenLinks[link] = struct{}{}
	}

	info.TotalLinks = len(seenLinks)

	for link := range seenLinks {
		isInternal := wc.isInternalLink(link)
		if isInternal {
			info.InternalLinks++
		} else {
			info.ExternalLinks++
		}

		fmt.Printf("[LINK] %s [%s]\n", link, ternary(isInternal, "internal", "external"))

		wc.wg.Add(1)
		go func(l string, internal bool) {
			defer wc.wg.Done()
			isBroken, statusCode := wc.checkLinkStatus(l)
			if isBroken {
				wc.mu.Lock()
				info.BrokenLinks++
				info.BrokenLinkDetail = append(info.BrokenLinkDetail, BrokenLinkStatus{
					URL:        l,
					StatusCode: statusCode,
				})
				wc.mu.Unlock()
			}
		}(link, isInternal)
	}

	wc.wg.Wait()
	info.ProcessingTime = time.Since(start)
	return info, nil
}

func DisplayPageInfo(info *PageInfo) {
	fmt.Println(strings.Repeat("=", 50))
	fmt.Printf("Crawl results for: %s\n", info.URL)
	fmt.Println(strings.Repeat("=", 50))
	fmt.Printf("HTML Version: %s\n", info.HTMLVersion)
	fmt.Printf("Title: %s\n", info.Title)
	fmt.Println("Headings:")
	for i := 1; i <= 6; i++ {
		tag := fmt.Sprintf("H%d", i)
		fmt.Printf("  %s: %d\n", tag, info.HeadingCounts[tag])
	}
	fmt.Printf("Internal Links: %d\n", info.InternalLinks)
	fmt.Printf("External Links: %d\n", info.ExternalLinks)
	fmt.Printf("Broken Links:    %d\n", info.BrokenLinks)
	fmt.Printf("Total Links:     %d\n", info.TotalLinks)
	if info.BrokenLinks > 0 {
		fmt.Printf("Broken Links List:\n")
		for _, bl := range info.BrokenLinkDetail {
			fmt.Printf("   - %s [status: %d]\n", bl.URL, bl.StatusCode)
		}
	}
	fmt.Printf("Login Form Present: %t\n", info.HasLoginForm)
	fmt.Printf("Processing Time: %v\n", info.ProcessingTime)
	fmt.Println(strings.Repeat("=", 50))
}

func ExportAsJSON(info *PageInfo, file string) {
	data, _ := json.MarshalIndent(info, "", "  ")
	_ = os.WriteFile(file, data, 0o644)
}

func contains(args []string, s string) bool {
	for _, a := range args {
		if a == s {
			return true
		}
	}
	return false
}

func ternary(condition bool, a, b string) string {
	if condition {
		return a
	}
	return b
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run main.go <URL> [--debug] [--json]")
		os.Exit(1)
	}
	target := os.Args[1]
	debugMode := contains(os.Args, "--debug")
	jsonOut := contains(os.Args, "--json")

	if !strings.HasPrefix(target, "http://") && !strings.HasPrefix(target, "https://") {
		target = "https://" + target
	}

	crawler, err := NewWebCrawler(target, debugMode)
	if err != nil {
		log.Fatalf("Failed to initialize: %v", err)
	}

	info, err := crawler.CrawlPage(target)
	if err != nil {
		log.Fatalf("Failed to crawl: %v", err)
	}

	DisplayPageInfo(info)

	if jsonOut {
		ExportAsJSON(info, "output.json")
		fmt.Println("JSON output saved to output.json")
	}
}

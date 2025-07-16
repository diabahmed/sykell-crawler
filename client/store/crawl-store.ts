import apiClient from "@/api/api";
import { Crawl, CrawlStats } from "@/types";
import { create } from "zustand";

// Helper function to normalize crawl data from backend (snake_case) to frontend (PascalCase)
const normalizeCrawlData = (rawCrawl: any): Crawl => {
  // Handle processing time conversion from Go's time.Duration
  let processingTimeMs = 0;
  if (rawCrawl.processing_time || rawCrawl.ProcessingTimeMs) {
    const processingTime =
      rawCrawl.processing_time || rawCrawl.ProcessingTimeMs;
    if (typeof processingTime === "string") {
      // If it's a string like "1.5s" or "150ms", parse it
      const match = processingTime.match(/^(\d+(?:\.\d+)?)(ns|µs|ms|s)$/);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2];
        switch (unit) {
          case "ns":
            processingTimeMs = value / 1000000;
            break;
          case "µs":
            processingTimeMs = value / 1000;
            break;
          case "ms":
            processingTimeMs = value;
            break;
          case "s":
            processingTimeMs = value * 1000;
            break;
        }
      }
    } else if (typeof processingTime === "number") {
      // If it's a number, assume it's already in milliseconds or nanoseconds
      processingTimeMs =
        processingTime > 1000000 ? processingTime / 1000000 : processingTime;
    }
  }

  return {
    ID: rawCrawl.ID || rawCrawl.id,
    CreatedAt: rawCrawl.CreatedAt || rawCrawl.created_at,
    UpdatedAt: rawCrawl.UpdatedAt || rawCrawl.updated_at,
    UserID: rawCrawl.UserID || rawCrawl.user_id,
    URL: rawCrawl.URL || rawCrawl.url,
    Status: rawCrawl.Status || rawCrawl.status,
    HTMLVersion: rawCrawl.HTMLVersion || rawCrawl.html_version,
    Title: rawCrawl.Title || rawCrawl.title,
    HeadingCounts: rawCrawl.HeadingCounts || rawCrawl.heading_counts || {},
    InternalLinks: rawCrawl.InternalLinks || rawCrawl.internal_links || 0,
    ExternalLinks: rawCrawl.ExternalLinks || rawCrawl.external_links || 0,
    BrokenLinks: rawCrawl.BrokenLinks || rawCrawl.broken_links || 0,
    BrokenLinkDetail: (
      rawCrawl.BrokenLinkDetail ||
      rawCrawl.broken_link_detail ||
      []
    ).map((brokenLink: any) => ({
      URL: brokenLink.URL || brokenLink.url,
      StatusCode: brokenLink.StatusCode || brokenLink.status_code,
      ErrorMessage: brokenLink.ErrorMessage || brokenLink.error_message || "",
    })),
    TotalLinks: rawCrawl.TotalLinks || rawCrawl.total_links || 0,
    HasLoginForm: rawCrawl.HasLoginForm || rawCrawl.has_login_form || false,
    ProcessingTime: processingTimeMs,
    ErrorMessage: rawCrawl.ErrorMessage || rawCrawl.error_message || "",
  };
};

interface CrawlState {
  crawls: Crawl[];
  stats: CrawlStats;
  isLoading: boolean;
  error: string | null;
  setCrawls: (rawCrawls: any[]) => void;
  fetchCrawls: () => Promise<void>;
  addCrawl: (crawl: any) => void;
  updateCrawl: (updatedCrawl: any) => void;
  removeCrawls: (crawlIds: number[]) => void;
}

// Helper function to calculate stats from a list of crawls
const calculateStats = (crawls: Crawl[]): CrawlStats => {
  console.log(
    "Store: calculateStats called with crawls:",
    crawls.map((c) => ({
      ID: c.ID,
      Status: c.Status,
      status: (c as any).status,
    }))
  );

  const stats = crawls.reduce(
    (acc, crawl) => {
      acc.total++;
      // Check both uppercase 'Status' and lowercase 'status' to handle different data sources
      const status = crawl.Status || (crawl as any).status;
      console.log(
        `Store: Crawl ${crawl.ID} has status:`,
        status,
        `- pending: ${acc.pending}, completed: ${acc.completed}, failed: ${acc.failed}`
      );

      if (status === "PENDING" || status === "PROCESSING") {
        acc.pending++;
        console.log(
          `Store: Incremented pending to ${acc.pending} for crawl ${crawl.ID}`
        );
      } else if (status === "COMPLETED") {
        acc.completed++;
        console.log(
          `Store: Incremented completed to ${acc.completed} for crawl ${crawl.ID}`
        );
      } else if (status === "FAILED") {
        acc.failed++;
        console.log(
          `Store: Incremented failed to ${acc.failed} for crawl ${crawl.ID}`
        );
      }
      return acc;
    },
    { total: 0, pending: 0, completed: 0, failed: 0 }
  );

  // Ensure no negative values (just in case)
  const finalStats = {
    total: Math.max(0, stats.total),
    pending: Math.max(0, stats.pending),
    completed: Math.max(0, stats.completed),
    failed: Math.max(0, stats.failed),
  };

  console.log("Store: Final calculated stats:", finalStats);
  return finalStats;
};

export const useCrawlStore = create<CrawlState>((set, get) => ({
  crawls: [],
  stats: { total: 0, pending: 0, completed: 0, failed: 0 },
  isLoading: true,
  error: null,

  // Action to set crawls and update stats (with normalization)
  setCrawls: (rawCrawls) => {
    console.log(
      "Store: setCrawls called with raw data:",
      rawCrawls.slice(0, 2)
    ); // Log first 2 items
    const crawls = rawCrawls.map(normalizeCrawlData);
    console.log("Store: setCrawls normalized data:", crawls.slice(0, 2)); // Log first 2 normalized items

    set({
      crawls,
      stats: calculateStats(crawls),
      isLoading: false,
      error: null,
    });
  },

  // Action to fetch all crawls from the API
  fetchCrawls: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get<Crawl[]>("/crawls");
      console.log("API fetchCrawls response:", response.data);
      console.log(
        "Sample crawl data keys:",
        response.data[0] ? Object.keys(response.data[0]) : "No data"
      );
      // Normalize crawl data from backend (lowercase) to frontend (uppercase)
      const normalizedCrawls = response.data.map(normalizeCrawlData);
      get().setCrawls(normalizedCrawls);
    } catch (error) {
      console.error("Failed to fetch crawls:", error);
      set({ error: "Failed to load crawl history.", isLoading: false });
    }
  },

  // Action to add a new crawl (from the form submission)
  addCrawl: (rawCrawl) => {
    const crawl = normalizeCrawlData(rawCrawl);
    const newCrawls = [crawl, ...get().crawls];
    set({
      crawls: newCrawls,
      stats: calculateStats(newCrawls),
    });
  },

  // Action to update a crawl (from a WebSocket message)
  updateCrawl: (rawUpdatedCrawl) => {
    console.log("Store: updateCrawl called with raw data:", rawUpdatedCrawl);
    const updatedCrawl = normalizeCrawlData(rawUpdatedCrawl);
    console.log("Store: updateCrawl normalized data:", updatedCrawl);

    const currentCrawls = get().crawls;
    console.log("Store: Current crawls count:", currentCrawls.length);

    // Check if the crawl already exists
    const existingCrawlIndex = currentCrawls.findIndex(
      (crawl) => crawl.ID === updatedCrawl.ID
    );

    let newCrawls: Crawl[];
    if (existingCrawlIndex !== -1) {
      // Update existing crawl
      console.log(
        "Store: Updating existing crawl at index:",
        existingCrawlIndex
      );
      newCrawls = currentCrawls.map((crawl) =>
        crawl.ID === updatedCrawl.ID ? updatedCrawl : crawl
      );
    } else {
      // Add new crawl to the beginning of the array
      console.log("Store: Adding new crawl with ID:", updatedCrawl.ID);
      newCrawls = [updatedCrawl, ...currentCrawls];
    }

    const newStats = calculateStats(newCrawls);
    console.log("Store: New stats calculated:", newStats);

    set({
      crawls: newCrawls,
      stats: newStats,
    });

    console.log("Store: State updated successfully");
  },

  // Action to remove crawls (after deletion)
  removeCrawls: (crawlIds) => {
    console.log("Store: removeCrawls called with IDs:", crawlIds);
    const currentCrawls = get().crawls;
    const newCrawls = currentCrawls.filter(
      (crawl) => !crawlIds.includes(crawl.ID)
    );
    console.log(
      "Store: Filtered crawls, removed:",
      currentCrawls.length - newCrawls.length
    );

    const newStats = calculateStats(newCrawls);
    console.log("Store: New stats calculated:", newStats);

    set({
      crawls: newCrawls,
      stats: newStats,
    });

    console.log("Store: Crawls removed successfully");
  },
}));

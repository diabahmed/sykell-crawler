export interface BrokenLink {
  URL: string;
  StatusCode: number;
  ErrorMessage?: string;
}

export interface Crawl {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  UserID: number;
  URL: string;
  Status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  HTMLVersion: string;
  Title: string;
  HeadingCounts: Record<string, number>;
  InternalLinks: number;
  ExternalLinks: number;
  BrokenLinks: number;
  BrokenLinkDetail?: BrokenLink[];
  TotalLinks: number;
  HasLoginForm: boolean;
  ProcessingTime: number;
  ErrorMessage: string;
}

export interface CrawlStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
}

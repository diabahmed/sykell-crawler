"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/breadcrumb";
import { CrawlDetailSkeleton } from "@/components/crawl-detail-skeleton";
import { Separator } from "@/components/separator";
import { SidebarInset, SidebarTrigger } from "@/components/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import UserDropdown from "@/components/user-dropdown";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCrawlStore } from "@/store/crawl-store";
import { Crawl } from "@/types";
import {
  RiCheckLine,
  RiErrorWarningLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiLink,
  RiRefreshLine,
  RiTimeLine,
} from "@remixicon/react";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Label, Pie, PieChart } from "recharts";
import { toast } from "sonner";

// Helper function to get status text for HTTP status codes
function getStatusText(statusCode: number): string {
  const statusTexts: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    408: "Request Timeout",
    410: "Gone",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
  };
  return statusTexts[statusCode] || "Error";
}

// Helper function to copy text to clipboard
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("URL copied to clipboard");
  } catch (err) {
    console.error("Failed to copy URL:", err);
    toast.error("Failed to copy URL");
  }
}

export default function CrawlDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const { crawls, isLoading, fetchCrawls } = useCrawlStore();
  const [crawl, setCrawl] = useState<Crawl | null>(null);
  const [, setCurrentTime] = useState(new Date());
  const [chartKey, setChartKey] = useState(0);
  const [visibleBrokenLinks, setVisibleBrokenLinks] = useState(10);

  // Update current time every minute to refresh relative timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate total links for the chart center text
  const totalLinks = useMemo(() => {
    if (!crawl) return 0;
    return (crawl.InternalLinks || 0) + (crawl.ExternalLinks || 0);
  }, [crawl]);

  // Fetch initial data when the component mounts (same as dashboard)
  useEffect(() => {
    fetchCrawls();
  }, [fetchCrawls]);

  // Find the specific crawl when crawls are loaded
  useEffect(() => {
    if (id && crawls.length > 0) {
      const foundCrawl = crawls.find((c) => c.ID === parseInt(id as string));
      setCrawl(foundCrawl || null);
      console.log("Found crawl:", foundCrawl);
      // Force chart re-animation when crawl changes
      setChartKey((prev) => prev + 1);
      // Reset visible broken links when crawl changes
      setVisibleBrokenLinks(10);
    }
  }, [id, crawls]);

  const loadMoreBrokenLinks = () => {
    if (crawl?.BrokenLinkDetail) {
      setVisibleBrokenLinks((prev) =>
        Math.min(prev + 10, crawl.BrokenLinkDetail!.length)
      );
    }
  };

  const handleBrokenLinksScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Load more when user scrolls to bottom (with 50px threshold)
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (
        crawl?.BrokenLinkDetail &&
        visibleBrokenLinks < crawl.BrokenLinkDetail.length
      ) {
        loadMoreBrokenLinks();
      }
    }
  };

  if (isLoading) {
    return <CrawlDetailSkeleton />;
  }

  if (!isLoading && !crawl) {
    return (
      <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
        <header className="flex flex-wrap gap-3 min-h-20 py-4 shrink-0 items-center transition-all ease-linear border-b">
          {/* Left side */}
          <div className="flex flex-1 items-center gap-2">
            <SidebarTrigger className="-ms-1" />
            <div className="max-lg:hidden lg:contents">
              <Separator
                orientation="vertical"
                className="me-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Not Found</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
          {/* Right side */}
          <div className="flex gap-3 ml-auto">
            {user && <UserDropdown user={user} />}
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
          {/* Not Found Content - Centered */}
          <div className="flex flex-1 items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-6 text-center max-w-md mx-auto">
              {/* Not Found SVG */}
              <svg
                className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground/40 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.239 0-4.236-.908-5.69-2.376L12 6l5.69 6.624A7.96 7.96 0 0112 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              {/* Not Found Text */}
              <div className="space-y-2 w-[900px]">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                  Not Found
                </h2>
                <p className="text-xs md:text-base text-muted-foreground w-full">
                  The crawl you&apos;re looking for doesn&apos;t exist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  // If we&apos;re not loading but also don&apos;t have a crawl yet, keep showing loading
  if (!crawl) {
    return <CrawlDetailSkeleton />;
  }

  return (
    <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
      <header className="flex flex-wrap gap-3 min-h-20 py-4 shrink-0 items-center transition-all ease-linear border-b">
        {/* Left side */}
        <div className="flex flex-1 items-center gap-2">
          <SidebarTrigger className="-ms-1" />
          <div className="max-lg:hidden lg:contents">
            <Separator
              orientation="vertical"
              className="me-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {crawl.Title || "Untitled Page"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        {/* Right side */}
        <div className="flex gap-3 ml-auto">
          {user && <UserDropdown user={user} />}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
        {/* Page intro */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">
              {crawl.Title || "Untitled Page"}
            </h1>
            <p className="text-sm text-muted-foreground break-all">
              {crawl.URL}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href={crawl.URL} target="_blank" rel="noopener noreferrer">
                <RiExternalLinkLine className="size-4" />
                Visit Site
              </a>
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "gap-1 py-0.75 px-2 text-xs w-25 justify-center",
                crawl.Status === "COMPLETED" && "text-emerald-500",
                crawl.Status === "PENDING" && "text-blue-500",
                crawl.Status === "PROCESSING" && "text-amber-500",
                crawl.Status === "FAILED" && "text-red-500"
              )}
            >
              {crawl.Status === "COMPLETED" && (
                <RiCheckLine size={14} className="text-emerald-500" />
              )}
              {crawl.Status === "PROCESSING" && (
                <RiRefreshLine
                  size={14}
                  className="animate-spin text-blue-500"
                />
              )}
              {crawl.Status === "PENDING" && (
                <RiTimeLine size={14} className="text-amber-500" />
              )}
              {crawl.Status === "FAILED" && (
                <RiErrorWarningLine size={14} className="text-red-500" />
              )}
              {crawl.Status.charAt(0).toUpperCase() +
                crawl.Status.slice(1).toLowerCase()}
            </Badge>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-muted-foreground cursor-help">
                    {formatDistanceToNow(new Date(crawl.CreatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {new Date(crawl.CreatedAt)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                      .replace(/\//g, ".")}{" "}
                    {new Date(crawl.CreatedAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Error Message */}
        {crawl.Status === "FAILED" && crawl.ErrorMessage && (
          <div className="rounded-md border px-4 py-3 bg-gradient-to-br from-sidebar/60 to-sidebar">
            <div className="flex gap-3">
              <RiErrorWarningLine
                className="mt-0.5 shrink-0 text-red-500 opacity-60"
                size={16}
                aria-hidden="true"
              />
              <div className="grow space-y-1">
                <p className="text-sm font-medium">Analysis Failed</p>
                <p className="text-muted-foreground text-sm">
                  {crawl.ErrorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chart Visualization */}
        {crawl.Status === "COMPLETED" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Links Distribution Chart */}
            <Card className="bg-gradient-to-br from-sidebar/60 to-sidebar">
              <CardHeader className="pb-0">
                <CardTitle>Links Distribution</CardTitle>
                <CardDescription>
                  Breakdown of internal vs external links found on the page
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ChartContainer
                  config={
                    {
                      internal: {
                        label: "Internal",
                        color: "var(--chart-1)",
                      },
                      external: {
                        label: "External",
                        color: "var(--chart-2)",
                      },
                    } satisfies ChartConfig
                  }
                  className="mx-auto aspect-square max-h-[250px]"
                  key={chartKey}
                >
                  <PieChart accessibilityLayer>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={[
                        {
                          type: "internal",
                          links: crawl.InternalLinks || 0,
                          fill: "var(--color-internal)",
                        },
                        {
                          type: "external",
                          links: crawl.ExternalLinks || 0,
                          fill: "var(--color-external)",
                        },
                      ]}
                      dataKey="links"
                      nameKey="type"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-3xl font-bold"
                                >
                                  {totalLinks.toLocaleString()}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Total Links
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
                {/* Chart Summary */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-[var(--chart-1)]">
                      {crawl.InternalLinks || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {crawl.TotalLinks > 0
                        ? `${Math.round(
                            ((crawl.InternalLinks || 0) / crawl.TotalLinks) *
                              100
                          )}%`
                        : "0%"}{" "}
                      Internal
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-[var(--chart-2)]">
                      {crawl.ExternalLinks || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {crawl.TotalLinks > 0
                        ? `${Math.round(
                            ((crawl.ExternalLinks || 0) / crawl.TotalLinks) *
                              100
                          )}%`
                        : "0%"}{" "}
                      External
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Broken Links List */}
            {crawl.BrokenLinks > 0 && (
              <Card className="bg-gradient-to-br from-sidebar/60 to-sidebar">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RiErrorWarningLine className="size-5 text-red-500" />
                    Broken Links
                  </CardTitle>
                  <CardDescription>
                    {crawl.BrokenLinks} broken link
                    {crawl.BrokenLinks !== 1 ? "s" : ""} detected on this page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="space-y-3 max-h-[300px] overflow-y-auto"
                    onScroll={handleBrokenLinksScroll}
                  >
                    {crawl.BrokenLinkDetail &&
                    crawl.BrokenLinkDetail.length > 0 ? (
                      <>
                        {crawl.BrokenLinkDetail.slice(
                          0,
                          visibleBrokenLinks
                        ).map((brokenLink, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <RiLink className="size-4 text-red-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <p
                                  className="text-sm font-medium text-red-700 dark:text-red-400 truncate flex-1"
                                  title={brokenLink.URL}
                                >
                                  {brokenLink.URL}
                                </p>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    onClick={() =>
                                      copyToClipboard(brokenLink.URL)
                                    }
                                    title="Copy URL"
                                  >
                                    <RiFileCopyLine className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    asChild
                                  >
                                    <a
                                      href={brokenLink.URL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Visit URL"
                                    >
                                      <RiExternalLinkLine className="size-3" />
                                    </a>
                                  </Button>
                                </div>
                              </div>{" "}
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="destructive"
                                  className="text-xs px-1.5 py-0.5"
                                >
                                  {brokenLink.StatusCode || "—"}
                                </Badge>
                                <p className="text-xs text-red-600 dark:text-red-500">
                                  {brokenLink.ErrorMessage ||
                                    (brokenLink.StatusCode
                                      ? getStatusText(brokenLink.StatusCode)
                                      : "Connection failed")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {visibleBrokenLinks < crawl.BrokenLinkDetail.length && (
                          <div className="text-xs text-muted-foreground text-center py-2 border-t">
                            <span className="text-muted-foreground">
                              Showing {visibleBrokenLinks} of{" "}
                              {crawl.BrokenLinkDetail.length} broken links
                            </span>
                            <div className="text-xs text-muted-foreground/70 mt-1">
                              Scroll down to load more
                            </div>
                          </div>
                        )}
                        {visibleBrokenLinks >= crawl.BrokenLinkDetail.length &&
                          crawl.BrokenLinkDetail.length > 10 && (
                            <div className="text-xs text-muted-foreground text-center py-2 border-t">
                              All {crawl.BrokenLinkDetail.length} broken links
                              loaded
                            </div>
                          )}
                      </>
                    ) : (
                      // Fallback message when BrokenLinksDetails is not available
                      <div className="flex items-center justify-center py-8 min-h-[300px]">
                        <div className="text-center space-y-3">
                          <RiErrorWarningLine className="size-8 text-amber-500 mx-auto" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Broken Links Detected
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {crawl.BrokenLinks} broken link
                              {crawl.BrokenLinks !== 1 ? "s" : ""} found, but
                              detailed information is not available.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Broken Links Card */}
            {crawl.BrokenLinks === 0 && (
              <Card className="bg-gradient-to-br from-sidebar/60 to-sidebar">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RiCheckLine className="size-5 text-emerald-500" />
                    Link Health
                  </CardTitle>
                  <CardDescription>
                    All links on this page are working correctly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-2">
                      <RiCheckLine className="size-12 text-emerald-500 mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        No broken links found
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </SidebarInset>
  );
}

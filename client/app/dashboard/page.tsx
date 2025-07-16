"use client";

import AddURLSheet from "@/components/add-url-sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/breadcrumb";
import CrawlsTable from "@/components/crawls-table";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { Separator } from "@/components/separator";
import { SidebarInset, SidebarTrigger } from "@/components/sidebar";
import { StatsGrid } from "@/components/stats-grid";
import UserDropdown from "@/components/user-dropdown";
import { useAuthStore } from "@/store/auth-store";
import { useCrawlStore } from "@/store/crawl-store";
import { useEffect, useMemo } from "react";

// --- WebSocket Connection Logic ---
// This could be moved to a custom hook (useWebSocket) for even cleaner code
const useWebSocketConnection = () => {
  const { updateCrawl } = useCrawlStore();

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(
          process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8088/api/v1/ws"
        );

        ws.onopen = () => {
          console.log("WebSocket connection established");
        };

        ws.onmessage = (event) => {
          try {
            const rawData = JSON.parse(event.data);
            console.log("WebSocket received raw data:", rawData);
            console.log("WebSocket data keys:", Object.keys(rawData));
            updateCrawl(rawData); // Pass raw data, let store normalize it
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        ws.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason);
          // Attempt to reconnect if the connection wasn't closed intentionally
          if (!event.wasClean && event.code !== 1000) {
            console.log("Attempting to reconnect in 3 seconds...");
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        // Retry connection after 3 seconds
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    // Initial connection
    connect();

    // Cleanup on component unmount
    return () => {
      console.log("Cleaning up WebSocket connection");
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close(1000, "Component unmounting");
      }
    };
  }, [updateCrawl]);
};

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const { stats, isLoading, fetchCrawls } = useCrawlStore();

  // Memoize the stats array to ensure proper re-rendering
  const statsArray = useMemo(
    () => [
      {
        title: "Total",
        value: stats.total,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            fill="currentColor"
          >
            <path d="M5 18L12.6796 12L5 6V4H19V6H8.26348L16 12L8.26348 18H19V20H5V18Z"></path>
          </svg>
        ),
      },
      {
        title: "Pending",
        value: stats.pending,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            fill="currentColor"
          >
            <path d="M12 2C12.5523 2 13 2.44772 13 3V6C13 6.55228 12.5523 7 12 7C11.4477 7 11 6.55228 11 6V3C11 2.44772 11.4477 2 12 2ZM12 17C12.5523 17 13 17.4477 13 18V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V18C11 17.4477 11.4477 17 12 17ZM22 12C22 12.5523 21.5523 13 21 13H18C17.4477 13 17 12.5523 17 12C17 11.4477 17.4477 11 18 11H21C21.5523 11 22 11.4477 22 12ZM7 12C7 12.5523 6.55228 13 6 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H6C6.55228 11 7 11.4477 7 12ZM19.0711 19.0711C18.6805 19.4616 18.0474 19.4616 17.6569 19.0711L15.5355 16.9497C15.145 16.5592 15.145 15.9261 15.5355 15.5355C15.9261 15.145 16.5592 15.145 16.9497 15.5355L19.0711 17.6569C19.4616 18.0474 19.4616 18.6805 19.0711 19.0711ZM8.46447 8.46447C8.07394 8.85499 7.44078 8.85499 7.05025 8.46447L4.92893 6.34315C4.53841 5.95262 4.53841 5.31946 4.92893 4.92893C5.31946 4.53841 5.95262 4.53841 6.34315 4.92893L8.46447 7.05025C8.85499 7.44078 8.85499 8.07394 8.46447 8.46447ZM4.92893 19.0711C4.53841 18.6805 4.53841 18.0474 4.92893 17.6569L7.05025 15.5355C7.44078 15.145 8.07394 15.145 8.46447 15.5355C8.85499 15.9261 8.85499 16.5592 8.46447 16.9497L6.34315 19.0711C5.95262 19.4616 5.31946 19.4616 4.92893 19.0711ZM15.5355 8.46447C15.145 8.07394 15.145 7.44078 15.5355 7.05025L17.6569 4.92893C18.0474 4.53841 18.6805 4.53841 19.0711 4.92893C19.4616 5.31946 19.4616 5.95262 19.0711 6.34315L16.9497 8.46447C16.5592 8.85499 15.9261 8.85499 15.5355 8.46447Z"></path>
          </svg>
        ),
      },
      {
        title: "Completed",
        value: stats.completed,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="M21.801 10A10 10 0 1 1 17 3.335" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        ),
      },
      {
        title: "Failed",
        value: stats.failed,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m14.5 9.5-5 5" />
            <path d="m9.5 9.5 5 5" />
          </svg>
        ),
      },
    ],
    [stats.total, stats.pending, stats.completed, stats.failed]
  );

  // Fetch initial data when the component mounts
  useEffect(() => {
    fetchCrawls();
  }, [fetchCrawls]);

  // Establish and manage the WebSocket connection
  useWebSocketConnection();

  if (isLoading || !user) {
    return <DashboardSkeleton />;
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
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        {/* Right side */}
        <div className="flex gap-3 ml-auto">
          <UserDropdown user={user} />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
        {/* Page intro */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Hallo, {user.firstName}!</h1>
            <p className="text-sm text-muted-foreground">
              Here&rsquo;s an overview of your crawls. Manage or crawl new URLs
              with ease!
            </p>
          </div>
          <AddURLSheet />
        </div>
        {/* Numbers */}
        <StatsGrid stats={statsArray} />
        {/* Table */}
        <div className="min-h-[100vh] flex-1 md:min-h-min">
          <CrawlsTable />
        </div>
      </div>
    </SidebarInset>
  );
}

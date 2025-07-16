import { Separator } from "@/components/separator";
import { SidebarInset, SidebarTrigger } from "@/components/sidebar";
import { Skeleton } from "@/components/skeleton";

export function DashboardSkeleton() {
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
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <span className="text-muted-foreground">/</span>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
        {/* Right side */}
        <div className="flex gap-3 ml-auto">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
        {/* Page intro skeleton */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 border border-input rounded-lg overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="relative p-4 lg:p-5 group before:absolute before:inset-y-8 before:right-0 before:w-px before:bg-gradient-to-b before:from-input/30 before:via-input before:to-input/30 last:before:hidden"
            >
              <div className="relative flex items-center gap-4">
                {/* Icon skeleton */}
                <div className="shrink-0 flex items-center justify-center size-11 rounded-lg">
                  <Skeleton className="h-6 w-6" />
                </div>
                {/* Content skeleton */}
                <div className="space-y-1 min-w-0">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="min-h-[100vh] flex-1 md:min-h-min">
          <div className="space-y-4">
            {/* Table header skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>

            {/* Table content skeleton */}
            <div className="border rounded-md">
              {/* Table header row */}
              <div className="border-b px-4 py-3 flex items-center gap-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Table rows skeleton */}
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="border-b last:border-b-0 px-4 py-4 flex items-center gap-4"
                >
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}

import { Separator } from "@/components/separator";
import { SidebarInset, SidebarTrigger } from "@/components/sidebar";
import { Skeleton } from "@/components/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CrawlDetailSkeleton() {
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
              <span className="text-muted-foreground">/</span>
              <Skeleton className="h-4 w-32" />
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
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Status and timestamp skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Chart and broken links skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Links Distribution Chart skeleton */}
          <Card className="bg-gradient-to-br from-sidebar/60 to-sidebar">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              {/* Chart skeleton */}
              <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </div>
              {/* Chart summary skeleton */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-8 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-6 w-8 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Broken Links skeleton */}
          <Card className="bg-gradient-to-br from-sidebar/60 to-sidebar">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px]">
                {/* Broken link items skeleton */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-red-50 dark:bg-red-950/20"
                  >
                    <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 flex-1" />
                        <div className="flex gap-1">
                          <Skeleton className="h-6 w-6" />
                          <Skeleton className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </div>
                ))}
                {/* Load more indicator skeleton */}
                <div className="text-center py-2 border-t">
                  <Skeleton className="h-3 w-48 mx-auto" />
                  <Skeleton className="h-3 w-32 mx-auto mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}

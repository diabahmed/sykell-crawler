"use client";

import { crawlApi } from "@/api/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/alert-dialog";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { cn } from "@/lib/utils";
import { useCrawlStore } from "@/store/crawl-store";
import { Crawl } from "@/types";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCheckDoubleLine,
  RiCheckLine,
  RiCloseCircleLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiExternalLinkLine,
  RiFilter3Line,
  RiMoreLine,
  RiPlayFill,
  RiRefreshLine,
  RiSearch2Line,
  RiTimeLine,
} from "@remixicon/react";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

const statusFilterFn: FilterFn<Crawl> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

const loginFormFilterFn: FilterFn<Crawl> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue?.length) return true;
  const hasLoginForm = row.getValue(columnId) as boolean;
  const stringValue = hasLoginForm ? "Yes" : "No";
  return filterValue.includes(stringValue);
};

const globalFilterFn: FilterFn<Crawl> = (
  row,
  columnId,
  filterValue: string
) => {
  if (!filterValue) return true;
  const searchValue = filterValue.toLowerCase();

  // Search in title, URL (from original data), and HTML version
  const title = (row.getValue("Title") as string)?.toLowerCase() || "";
  const url = row.original.URL?.toLowerCase() || "";
  const htmlVersion =
    (row.getValue("HTMLVersion") as string)?.toLowerCase() || "";

  // Handle "Untitled" search - if title is empty/null and user searches for "untitled"
  const displayTitle = title || "untitled";

  return (
    displayTitle.includes(searchValue) ||
    url.includes(searchValue) ||
    htmlVersion.includes(searchValue)
  );
};

interface GetColumnsProps {
  onRowClick: (crawl: Crawl) => void;
  onRerun: (crawls: Crawl[]) => void;
  onDelete: (crawls: Crawl[]) => void;
}

const getColumns = ({
  onRowClick,
  onRerun,
  onDelete,
}: GetColumnsProps): ColumnDef<Crawl>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Title",
    accessorKey: "Title",
    cell: ({ row }) => {
      const title = row.getValue("Title") as string;
      const url = row.original.URL;

      return (
        <div
          className="space-y-1 cursor-pointer group"
          onClick={() => onRowClick(row.original)}
        >
          <TooltipProvider delayDuration={500}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "text-sm truncate max-w-[300px] group-hover:text-primary transition-colors",
                    title
                      ? "font-medium text-foreground"
                      : "font-medium text-muted-foreground/50"
                  )}
                >
                  {title || "Untitled"}
                </div>
              </TooltipTrigger>
              {title && title.length > 40 && (
                <TooltipContent>
                  <p className="max-w-xs">{title}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <div className="text-xs text-muted-foreground truncate max-w-[300px]">
            {url}
          </div>
        </div>
      );
    },
    size: 220,
    enableHiding: false,
  },
  {
    header: "HTML Version",
    accessorKey: "HTMLVersion",
    cell: ({ row }) => {
      const version = row.getValue("HTMLVersion") as string;
      return (
        <span
          className={cn(
            "text-sm",
            version ? "text-foreground" : "text-muted-foreground/50"
          )}
        >
          {version || "—"}
        </span>
      );
    },
    size: 100,
  },
  {
    header: "Status",
    accessorKey: "Status",
    cell: ({ row }) => {
      const status = row.getValue("Status") as string;
      const errorMessage = row.original.ErrorMessage;

      return (
        <div className="flex items-center h-full">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center h-full">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 py-0.75 px-2 text-xs cursor-help w-25 justify-center",
                      status === "COMPLETED" && "text-emerald-500",
                      status === "PENDING" && "text-blue-500",
                      status === "PROCESSING" && "text-amber-500",
                      status === "FAILED" && "text-red-500"
                    )}
                  >
                    {status === "COMPLETED" && (
                      <RiCheckLine
                        size={14}
                        className="text-emerald-500"
                        aria-hidden="true"
                      />
                    )}
                    {status === "PROCESSING" && (
                      <RiRefreshLine
                        size={14}
                        className="animate-spin text-white-500"
                        aria-hidden="true"
                      />
                    )}
                    {status === "PENDING" && (
                      <RiTimeLine
                        size={14}
                        className="text-amber-500"
                        aria-hidden="true"
                      />
                    )}
                    {status === "FAILED" && (
                      <RiErrorWarningLine
                        size={14}
                        className="text-red-500"
                        aria-hidden="true"
                      />
                    )}
                    {status.charAt(0).toUpperCase() +
                      status.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </TooltipTrigger>
              {errorMessage && (
                <TooltipContent>
                  <p className="max-w-xs">{errorMessage}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    size: 100,
    filterFn: statusFilterFn,
  },
  {
    header: "Internal Links",
    accessorKey: "InternalLinks",
    cell: ({ row }) => {
      const count = row.getValue("InternalLinks") as number;
      return (
        <span
          className={cn(
            "text-sm font-mono",
            count > 0 ? "text-foreground" : "text-muted-foreground/50"
          )}
        >
          {count?.toLocaleString() || 0}
        </span>
      );
    },
    size: 100,
  },
  {
    header: "External Links",
    accessorKey: "ExternalLinks",
    cell: ({ row }) => {
      const count = row.getValue("ExternalLinks") as number;
      return (
        <span
          className={cn(
            "text-sm font-mono",
            count > 0 ? "text-foreground" : "text-muted-foreground/50"
          )}
        >
          {count?.toLocaleString() || 0}
        </span>
      );
    },
    size: 100,
  },
  {
    header: "Broken Links",
    accessorKey: "BrokenLinks",
    cell: ({ row }) => {
      const count = row.getValue("BrokenLinks") as number;
      return (
        <span
          className={cn(
            "text-sm font-mono",
            count > 0 ? "text-foreground" : "text-muted-foreground/50"
          )}
        >
          {count?.toLocaleString() || 0}
        </span>
      );
    },
    size: 100,
  },
  {
    header: "Heading Tags",
    accessorKey: "HeadingCounts",
    cell: ({ row }) => {
      const headingCounts = row.getValue("HeadingCounts") as Record<
        string,
        number
      >;

      const totalTags = headingCounts
        ? Object.values(headingCounts).reduce((sum, count) => sum + count, 0)
        : 0;

      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "text-sm font-mono cursor-help",
                  totalTags > 0 ? "text-foreground" : "text-muted-foreground/50"
                )}
              >
                {totalTags?.toLocaleString() || 0}
              </span>
            </TooltipTrigger>
            <TooltipContent className="py-3">
              <div className="text-xs">
                <div className="text-muted-foreground mb-3">
                  Tag Distribution
                </div>
                <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                  {/* First row: H1, H2, H3 */}
                  {["H1", "H2", "H3"].map((tag) => (
                    <div key={tag} className="text-center">
                      <div className="text-muted-foreground">{tag}</div>
                      <div className="font-medium">
                        {headingCounts?.[tag]?.toLocaleString() || "0"}
                      </div>
                    </div>
                  ))}
                  {/* Second row: H4, H5, H6 */}
                  {["H4", "H5", "H6"].map((tag) => (
                    <div key={tag} className="text-center">
                      <div className="text-muted-foreground">{tag}</div>
                      <div className="font-medium">
                        {headingCounts?.[tag]?.toLocaleString() || "0"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const headingCountsA = rowA.getValue(columnId) as Record<string, number>;
      const headingCountsB = rowB.getValue(columnId) as Record<string, number>;

      const totalA = headingCountsA
        ? Object.values(headingCountsA).reduce((sum, count) => sum + count, 0)
        : 0;
      const totalB = headingCountsB
        ? Object.values(headingCountsB).reduce((sum, count) => sum + count, 0)
        : 0;

      return totalA - totalB;
    },
    size: 100,
  },
  {
    header: "Has Login",
    accessorKey: "HasLoginForm",
    cell: ({ row }) => {
      return (
        <div>
          <span className="sr-only">
            {row.original.HasLoginForm ? "Has Login Form" : "No Login Form"}
          </span>
          <RiCheckDoubleLine
            size={20}
            className={cn(
              row.original.HasLoginForm
                ? "fill-emerald-600"
                : "fill-muted-foreground/20"
            )}
            aria-hidden="true"
          />
        </div>
      );
    },
    size: 100,
    filterFn: loginFormFilterFn,
  },
  {
    header: "Created",
    accessorKey: "CreatedAt",
    cell: ({ row }) => {
      const date = new Date(row.getValue("CreatedAt"));
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground cursor-help">
                {formatDistanceToNow(date, { addSuffix: true })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {date
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                  .replace(/\//g, ".")}{" "}
                {date.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 120,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <RowActions crawl={row.original} onRerun={onRerun} onDelete={onDelete} />
    ),
    size: 40,
    enableHiding: false,
  },
];

export default function CrawlsTable() {
  const router = useRouter();
  const id = useId();
  const { crawls, isLoading, removeCrawls } = useCrawlStore();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  // Update current time every minute to refresh relative timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "CreatedAt",
      desc: true, // Show newest first
    },
  ]);

  const handleRowClick = (crawl: Crawl) => {
    router.push(`/dashboard/crawl/${crawl.ID}`);
  };

  const handleRerun = async (crawls: Crawl[]) => {
    try {
      const rerunPromises = crawls.map((crawl) => crawlApi.rerun(crawl.ID));
      await Promise.all(rerunPromises);
      toast.success(`Re-running analysis for ${crawls.length} URL(s)`);
    } catch (error) {
      console.error("Error re-running crawls:", error);
      toast.error("Failed to re-run analysis");
    }
  };

  const handleDelete = async (crawls: Crawl[]) => {
    try {
      if (crawls.length === 1) {
        await crawlApi.delete(crawls[0].ID);
      } else {
        const crawlIds = crawls.map((crawl) => crawl.ID);
        await crawlApi.deleteBulk(crawlIds);
      }

      // Remove crawls from store after successful deletion
      const crawlIds = crawls.map((crawl) => crawl.ID);
      removeCrawls(crawlIds);

      toast.success(`Deleted ${crawls.length} crawl(s)`);
    } catch (error) {
      console.error("Error deleting crawls:", error);
      toast.error("Failed to delete crawls");
    }
  };

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedCrawls = selectedRows.map((row) => row.original);
    handleDelete(selectedCrawls);
    table.resetRowSelection();
  };

  const handleRerunSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedCrawls = selectedRows.map((row) => row.original);
    handleRerun(selectedCrawls);
    table.resetRowSelection();
  };

  const columns = useMemo(
    () =>
      getColumns({
        onRowClick: handleRowClick,
        onRerun: handleRerun,
        onDelete: handleDelete,
      }),
    [currentTime] // Include currentTime to refresh relative timestamps
  );

  const table = useReactTable({
    data: crawls,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  // Extract complex expressions into separate variables
  const statusColumn = table.getColumn("Status");
  const statusFacetedValues = statusColumn?.getFacetedUniqueValues();
  const statusFilterValue = statusColumn?.getFilterValue();

  const loginColumn = table.getColumn("HasLoginForm");
  const loginFacetedValues = loginColumn?.getFacetedUniqueValues();
  const loginFilterValue = loginColumn?.getFilterValue();

  // Update useMemo hooks with simplified dependencies
  const uniqueStatusValues = useMemo(() => {
    if (!statusColumn) return [];
    const values = Array.from(statusFacetedValues?.keys() ?? []);
    return values.sort();
  }, [statusColumn, statusFacetedValues]);

  const statusCounts = useMemo(() => {
    if (!statusColumn) return new Map();
    return statusFacetedValues ?? new Map();
  }, [statusColumn, statusFacetedValues]);

  const selectedStatuses = useMemo(() => {
    return (statusFilterValue as string[]) ?? [];
  }, [statusFilterValue]);

  const uniqueLoginValues = useMemo(() => {
    if (!loginColumn) return [];
    const values = Array.from(loginFacetedValues?.keys() ?? []);
    // Convert boolean values to string display values
    return values.map((v) => (v ? "Yes" : "No")).sort();
  }, [loginColumn, loginFacetedValues]);

  const loginCounts = useMemo(() => {
    if (!loginColumn) return new Map();
    const counts = new Map();
    loginFacetedValues?.forEach((count, value) => {
      const stringValue = value ? "Yes" : "No";
      counts.set(stringValue, (counts.get(stringValue) || 0) + count);
    });
    return counts;
  }, [loginColumn, loginFacetedValues]);

  const selectedLoginValues = useMemo(() => {
    return (loginFilterValue as string[]) ?? [];
  }, [loginFilterValue]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("Status")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("Status")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  const handleLoginChange = (checked: boolean, value: string) => {
    const filterValue = table
      .getColumn("HasLoginForm")
      ?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("HasLoginForm")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Filter by name */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                "peer min-w-75 ps-9 bg-background bg-gradient-to-br from-accent/60 to-accent",
                Boolean(globalFilter) && "pe-9"
              )}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by title, URL, or HTML version"
              type="text"
              aria-label="Search by title, URL, or HTML version"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/60 peer-disabled:opacity-50">
              <RiSearch2Line size={20} aria-hidden="true" />
            </div>
            {Boolean(globalFilter) && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/60 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  setGlobalFilter("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <RiCloseCircleLine size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Re-run button */}
          {table.getSelectedRowModel().rows.length > 0 && (
            <Button
              className="ml-auto"
              variant="outline"
              onClick={handleRerunSelected}
            >
              <RiPlayFill
                className="-ms-1 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Re-run
              <span className="-me-1 ms-1 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                {table.getSelectedRowModel().rows.length}
              </span>
            </Button>
          )}

          {/* Delete button */}
          {table.getSelectedRowModel().rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="ml-auto" variant="outline">
                  <RiDeleteBinLine
                    className="-ms-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  Delete
                  <span className="-me-1 ms-1 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                    aria-hidden="true"
                  >
                    <RiErrorWarningLine className="opacity-80" size={16} />
                  </div>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete{" "}
                      {table.getSelectedRowModel().rows.length} selected{" "}
                      {table.getSelectedRowModel().rows.length === 1
                        ? "crawl"
                        : "crawls"}
                      .
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSelected}
                    className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {/* Filter by status and login form */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <RiFilter3Line
                  className="size-5 -ms-1.5 text-muted-foreground/60"
                  size={20}
                  aria-hidden="true"
                />
                Filter
                {(selectedStatuses.length > 0 ||
                  selectedLoginValues.length > 0) && (
                  <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                    {selectedStatuses.length + selectedLoginValues.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-48 p-3" align="end">
              <div className="space-y-4">
                {/* Status Filter */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground/60">
                    Status
                  </div>
                  <div className="space-y-2">
                    {uniqueStatusValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-status-${i}`}
                          checked={selectedStatuses.includes(value)}
                          onCheckedChange={(checked: boolean) =>
                            handleStatusChange(checked, value)
                          }
                        />
                        <Label
                          htmlFor={`${id}-status-${i}`}
                          className="flex grow justify-between gap-2 font-normal text-sm"
                        >
                          {value.charAt(0).toUpperCase() +
                            value.slice(1).toLowerCase()}{" "}
                          <span className="text-xs text-muted-foreground">
                            {statusCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Login Form Filter */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground/60">
                    Has Login Form
                  </div>
                  <div className="space-y-2">
                    {uniqueLoginValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-login-${i}`}
                          checked={selectedLoginValues.includes(value)}
                          onCheckedChange={(checked: boolean) =>
                            handleLoginChange(checked, value)
                          }
                        />
                        <Label
                          htmlFor={`${id}-login-${i}`}
                          className="flex grow justify-between gap-2 font-normal text-sm"
                        >
                          {value}{" "}
                          <span className="text-xs text-muted-foreground">
                            {loginCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table */}
      <Table className="table-fixed border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="relative h-9 select-none bg-sidebar border-y border-border first:border-l first:rounded-l-lg last:border-r last:rounded-r-lg"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            "flex h-full cursor-pointer select-none items-center gap-2"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          // Enhanced keyboard handling for sorting
                          if (
                            header.column.getCanSort() &&
                            (e.key === "Enter" || e.key === " ")
                          ) {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <RiArrowUpSLine
                              className="shrink-0 opacity-60"
                              size={16}
                              aria-hidden="true"
                            />
                          ),
                          desc: (
                            <RiArrowDownSLine
                              className="shrink-0 opacity-60"
                              size={16}
                              aria-hidden="true"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
        <TableBody>
          {isLoading ? (
            <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-0 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg h-px hover:bg-accent/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="last:py-0 h-[inherit]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
      </Table>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p
            className="flex-1 whitespace-nowrap text-sm text-muted-foreground"
            aria-live="polite"
          >
            Page{" "}
            <span className="text-foreground">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of <span className="text-foreground">{table.getPageCount()}</span>
          </p>
          <Pagination className="w-auto">
            <PaginationContent className="gap-3">
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  Previous
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  Next
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function RowActions({
  crawl,
  onRerun,
  onDelete,
}: {
  crawl: Crawl;
  onRerun: (crawls: Crawl[]) => void;
  onDelete: (crawls: Crawl[]) => void;
}) {
  const router = useRouter();
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRerun = () => {
    startUpdateTransition(() => {
      onRerun([crawl]);
    });
  };

  const handleDelete = () => {
    startUpdateTransition(() => {
      onDelete([crawl]);
      setShowDeleteDialog(false);
    });
  };

  const handleViewDetails = () => {
    router.push(`/dashboard/crawl/${crawl.ID}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button
              size="icon"
              variant="ghost"
              className="shadow-none text-muted-foreground/60"
              aria-label="Edit item"
            >
              <RiMoreLine className="size-5" size={20} aria-hidden="true" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleViewDetails}>
              <RiExternalLinkLine className="mr-2 size-4" />
              View Details
            </DropdownMenuItem>
            {(crawl.Status === "COMPLETED" || crawl.Status === "FAILED") && (
              <DropdownMenuItem
                onClick={handleRerun}
                disabled={isUpdatePending}
              >
                <RiRefreshLine className="mr-2 size-4" />
                Re-run Analysis
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            className="dark:data-[variant=destructive]:focus:bg-destructive/10"
          >
            <RiDeleteBinLine className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              crawl for &quot;
              {crawl.URL.length > 40
                ? crawl.URL.substring(0, 40) + "..."
                : crawl.URL}
              &quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isUpdatePending}
              className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

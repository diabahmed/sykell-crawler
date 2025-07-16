"use client";

import apiClient from "@/api/api";
import { Button } from "@/components/ui/button";
import { Crawl } from "@/types";
import { RiBugLine } from "@remixicon/react";
import { Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import URLUploader, { UrlItem } from "./new-url";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url.split("/")[0] || "";
  }
};

export default function AddURLSheet() {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAddUrl = (urlInput: string): string | null => {
    const protocol = "https://";
    const fullUrl = protocol + urlInput.trim();

    if (!urlInput.trim()) return "URL cannot be empty";
    if (urls.some((item) => item.url === fullUrl))
      return "This URL has already been added";

    try {
      new URL(fullUrl); // Validate the full URL
    } catch {
      return "Please enter a valid URL";
    }

    const newUrl: UrlItem = {
      id: `url-${Date.now()}`,
      url: fullUrl,
      protocol,
      domain: extractDomain(fullUrl),
    };

    setUrls((prev) => [...prev, newUrl]);
    return null; // Success
  };

  const handleRemoveUrl = (id: string) => {
    setUrls((prev) => prev.filter((url) => url.id !== id));
  };

  const handleClearAll = () => {
    setUrls([]);
  };

  const handleSubmit = async () => {
    if (urls.length === 0) {
      toast.warning("Please add at least one URL to crawl.");
      return;
    }

    setIsSubmitting(true);
    toast.info(`Starting to crawl ${urls.length} URL(s)...`);

    const crawlPromises = urls.map((urlItem) =>
      apiClient.post<Crawl>("/crawls", { url: urlItem.url })
    );

    try {
      const results = await Promise.allSettled(crawlPromises);
      let successCount = 0;

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          // Don't add to store here - let WebSocket handle all crawl updates
          // This prevents duplicate entries
          console.log("Successfully submitted crawl:", result.value.data);
          successCount++;
        } else {
          console.error(
            `Failed to submit URL: ${urls[index].url}`,
            result.reason
          );
          toast.error(`Failed to submit: ${urls[index].url}`);
        }
      });

      if (successCount > 0) {
        toast.success(`${successCount} URL(s) successfully crawled.`);
        setIsOpen(false); // Close the sheet on successful submission
      }

      setUrls([]); // Clear the list on successful submission
    } catch (error) {
      console.error(
        "An unexpected error occurred during bulk submission:",
        error
      );
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setUrls([]); // Clear URLs when sheet is closed
      }}
    >
      <SheetTrigger asChild>
        <Button className="px-3 hover:cursor-pointer">
          <RiBugLine />
          Crawl URL(s)
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Crawl New URLs</SheetTitle>
          <SheetDescription>
            Add one or more URLs to the list, then start crawling.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-3 px-4 py-4 overflow-y-auto">
          <URLUploader
            urls={urls}
            onAddUrl={handleAddUrl}
            onRemoveUrl={handleRemoveUrl}
            onClearAll={handleClearAll}
          />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button
            type="button"
            className="hover:cursor-pointer"
            onClick={handleSubmit}
            disabled={isSubmitting || urls.length === 0}
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Globe />
                Start Crawling ({urls.length})
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiGlobalLine, RiLinksLine } from "@remixicon/react";
import { AlertCircleIcon, XIcon } from "lucide-react";
import { useId, useState } from "react";

// Define the shape of a URL item
export interface UrlItem {
  id: string;
  url: string;
  protocol: string;
  domain: string;
}

// Props for the controlled component
interface URLUploaderProps {
  urls: UrlItem[];
  onAddUrl: (url: string) => string | null; // Returns an error message or null
  onRemoveUrl: (id: string) => void;
  onClearAll: () => void;
}

export default function URLUploader({
  urls,
  onAddUrl,
  onRemoveUrl,
  onClearAll,
}: URLUploaderProps) {
  const id = useId();
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Function to truncate URL text
  const truncateUrl = (url: string, maxLength: number = 35) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  const handleAddClick = () => {
    const validationError = onAddUrl(urlInput);
    if (validationError) {
      setError(validationError);
    } else {
      setUrlInput(""); // Clear input on successful add
      setError(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleAddClick();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* URL Input Section */}
      <div className="space-y-2">
        <Label htmlFor={id}>Add URL</Label>
        <div className="flex rounded-md shadow-xs">
          <span className="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-s-md border px-3 text-sm">
            https://
          </span>
          <Input
            id={id}
            className="-ms-px rounded-s-none rounded-e-none shadow-none focus-visible:ring-offset-0"
            placeholder="example.com"
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyPress}
          />
          <Button
            type="button"
            onClick={handleAddClick}
            className="border-input bg-background text-foreground hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center rounded-e-md rounded-l-none border px-3 text-sm font-medium transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
          >
            Add
          </Button>
        </div>
        <p className="text-muted-foreground/70 text-xs">
          Enter a URL to add to the list.
        </p>
      </div>

      {error && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* URL List */}
      {urls.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Added URLs ({urls.length})</h3>
            {urls.length > 1 && (
              <Button size="sm" variant="outline" onClick={onClearAll}>
                Clear all
              </Button>
            )}
          </div>

          {urls.map((urlItem) => (
            <div
              key={urlItem.id}
              className="bg-background flex items-center justify-between gap-2 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                  <RiGlobalLine className="size-4 opacity-60" />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 flex-1">
                  <TooltipProvider delayDuration={500}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-[13px] font-medium cursor-default">
                          {truncateUrl(urlItem.url)}
                        </p>
                      </TooltipTrigger>
                      {urlItem.url.length > 35 && (
                        <TooltipContent>
                          <p className="max-w-xs break-all">{urlItem.url}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex items-center gap-1">
                    <RiLinksLine className="size-3 opacity-60" />
                    <p className="text-muted-foreground text-xs">
                      {urlItem.domain}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                onClick={() => onRemoveUrl(urlItem.id)}
                aria-label="Remove URL"
              >
                <XIcon className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

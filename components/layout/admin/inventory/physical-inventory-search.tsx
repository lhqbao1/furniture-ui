"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

const parseSearchTerms = (value: string) =>
  value
    .split(/[,\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);

export default function PhysicalInventorySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = React.useState("");
  const [searchTerms, setSearchTerms] = React.useState<string[]>([]);

  React.useEffect(() => {
    const value = searchParams.get("multi_search") ?? "";
    setSearchTerms(parseSearchTerms(value));
  }, [searchParams]);

  const pushTerms = React.useCallback(
    (terms: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      const normalized = Array.from(
        new Set(terms.map((term) => term.trim()).filter(Boolean)),
      );

      if (normalized.length > 0) {
        params.set("multi_search", normalized.join(","));
      } else {
        params.delete("multi_search");
      }

      params.set("page", "1");

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const commitSearchInput = React.useCallback(() => {
    const nextTerms = parseSearchTerms(searchInput);
    if (nextTerms.length === 0) return;

    const merged = Array.from(new Set([...searchTerms, ...nextTerms]));
    setSearchTerms(merged);
    setSearchInput("");
    pushTerms(merged);
  }, [pushTerms, searchInput, searchTerms]);

  const removeSearchTerm = React.useCallback(
    (targetTerm: string) => {
      const nextTerms = searchTerms.filter((term) => term !== targetTerm);
      setSearchTerms(nextTerms);
      pushTerms(nextTerms);
    },
    [pushTerms, searchTerms],
  );

  const clearAllTerms = React.useCallback(() => {
    setSearchInput("");
    setSearchTerms([]);
    pushTerms([]);
  }, [pushTerms]);

  return (
    <div className="w-full md:max-w-2xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitSearchInput();
              return;
            }

            if (
              event.key === "Backspace" &&
              !searchInput.trim() &&
              searchTerms.length > 0
            ) {
              event.preventDefault();
              removeSearchTerm(searchTerms[searchTerms.length - 1]);
            }
          }}
          placeholder="Type keyword and press Enter (multiple search)"
          className="h-10 border-secondary/20 bg-white pl-9 pr-9"
        />
        {searchInput ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={() => setSearchInput("")}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        ) : null}
      </div>

      {searchTerms.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {searchTerms.map((term) => (
            <Badge
              key={term}
              className="flex items-center gap-1.5 bg-secondary/90 text-white hover:bg-secondary/60"
            >
              <span>{term}</span>
              <button
                type="button"
                className="inline-flex text-white/80 hover:text-white"
                onClick={() => removeSearchTerm(term)}
                aria-label={`Remove ${term}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={clearAllTerms}
          >
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddProductVideoUrls } from "@/features/products/hook";
import { ProductVideoUrl } from "@/types/products";
import { ExternalLink, Loader2, Plus, Trash2, Youtube } from "lucide-react";
import { toast } from "sonner";

type ProductVideoUrlsProps = {
  productId?: string | null;
  videoUrls?: ProductVideoUrl[];
};

const YOUTUBE_BASE_URL = "https://www.youtube.com/watch?v=";

const getYoutubeVideoId = (rawUrl: string): string | null => {
  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const shortId = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
      return shortId || null;
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      const videoParam = parsed.searchParams.get("v");
      if (videoParam) return videoParam;

      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      const shortsIndex = pathSegments.indexOf("shorts");
      if (shortsIndex !== -1 && pathSegments[shortsIndex + 1]) {
        return pathSegments[shortsIndex + 1];
      }

      const embedIndex = pathSegments.indexOf("embed");
      if (embedIndex !== -1 && pathSegments[embedIndex + 1]) {
        return pathSegments[embedIndex + 1];
      }
    }

    return null;
  } catch {
    return null;
  }
};

const toCanonicalYoutubeUrl = (rawUrl: string): string | null => {
  const videoId = getYoutubeVideoId(rawUrl);
  if (!videoId) return null;
  return `${YOUTUBE_BASE_URL}${videoId}`;
};

const normalizeVideoUrls = (videoUrls?: ProductVideoUrl[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of videoUrls ?? []) {
    const urls = Array.isArray(item?.url)
      ? item.url
      : typeof item?.url === "string"
        ? [item.url]
        : [];

    for (const rawUrl of urls) {
      const trimmed = rawUrl?.trim();
      if (!trimmed) continue;

      const canonical = toCanonicalYoutubeUrl(trimmed);
      if (!canonical || seen.has(canonical)) continue;

      seen.add(canonical);
      result.push(canonical);
    }
  }

  return result;
};

const parseInputUrls = (rawInput: string): string[] =>
  rawInput
    .split(/[\n,]/)
    .map((url) => url.trim())
    .filter(Boolean);

const isSameList = (left: string[], right: string[]) => {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
};

const ProductVideoUrls = ({ productId, videoUrls }: ProductVideoUrlsProps) => {
  const addVideoUrlsMutation = useAddProductVideoUrls();
  const initialUrls = useMemo(() => normalizeVideoUrls(videoUrls), [videoUrls]);

  const [inputValue, setInputValue] = useState("");
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [savedUrls, setSavedUrls] = useState<string[]>(initialUrls);
  const hasUnsavedVideoDraft = useMemo(
    () => inputValue.trim().length > 0 || !isSameList(urls, savedUrls),
    [inputValue, urls, savedUrls],
  );

  useEffect(() => {
    if (hasUnsavedVideoDraft) return;
    setUrls(initialUrls);
    setSavedUrls(initialUrls);
  }, [hasUnsavedVideoDraft, initialUrls]);

  const previewItems = useMemo(
    () =>
      urls
        .map((url) => {
          const videoId = getYoutubeVideoId(url);
          if (!videoId) return null;
          return {
            url,
            videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
          };
        })
        .filter(Boolean) as Array<{
        url: string;
        videoId: string;
        embedUrl: string;
      }>,
    [urls],
  );

  const hasChanges = useMemo(
    () => !isSameList(urls, savedUrls),
    [urls, savedUrls],
  );

  const addUrlsFromInput = () => {
    const rawUrls = parseInputUrls(inputValue);

    if (!rawUrls.length) {
      toast.warning("Please paste at least one YouTube URL.");
      return;
    }

    const canonicalUrls: string[] = [];
    const invalidUrls: string[] = [];

    for (const rawUrl of rawUrls) {
      const canonical = toCanonicalYoutubeUrl(rawUrl);
      if (!canonical) {
        invalidUrls.push(rawUrl);
        continue;
      }
      canonicalUrls.push(canonical);
    }

    if (invalidUrls.length) {
      toast.error("Only valid YouTube URLs are allowed.");
      return;
    }

    setUrls((currentUrls) => {
      const merged = [...currentUrls];
      const seen = new Set(currentUrls);

      for (const url of canonicalUrls) {
        if (seen.has(url)) continue;
        seen.add(url);
        merged.push(url);
      }

      return merged;
    });

    setInputValue("");
  };

  const removeUrl = (removedUrl: string) => {
    setUrls((currentUrls) => currentUrls.filter((url) => url !== removedUrl));
  };

  const handleSaveUrls = () => {
    if (!productId) {
      toast.error("Please save product first before adding videos.");
      return;
    }

    if (!hasChanges) {
      toast.info("No video URL changes to save.");
      return;
    }

    addVideoUrlsMutation.mutate(
      { productId, input: { url: urls } },
      {
        onSuccess: (_, variables) => {
          setSavedUrls(variables.input.url);
          setUrls(variables.input.url);
          toast.success("Video URLs updated successfully.");
        },
        onError: () => {
          toast.error("Failed to update video URLs.");
        },
      },
    );
  };

  const handleReset = () => {
    setUrls(savedUrls);
    setInputValue("");
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-black">Video URLs</p>
          <p className="text-xs text-gray-500">
            Paste YouTube links and click save to update this product.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!hasChanges || addVideoUrlsMutation.isPending}
          >
            Reset
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveUrls}
            disabled={
              !productId || !hasChanges || addVideoUrlsMutation.isPending
            }
          >
            {addVideoUrlsMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save video links"
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          disabled={addVideoUrlsMutation.isPending}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={addUrlsFromInput}
          className="sm:w-auto"
          disabled={addVideoUrlsMutation.isPending}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {!productId ? (
        <p className="text-xs text-amber-600">
          Save this product first to enable video upload.
        </p>
      ) : null}

      {urls.length > 0 ? (
        <div className="space-y-2">
          {urls.map((url) => (
            <div
              key={url}
              className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-700">{url}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" size="icon" variant="ghost" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeUrl(url)}
                  disabled={addVideoUrlsMutation.isPending}
                >
                  <Trash2 className="size-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-gray-300 bg-white/80 px-4 py-5 text-sm text-gray-500">
          No YouTube links yet.
        </div>
      )}

      {previewItems.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-black">
            <Youtube className="size-4 text-red-500" />
            Preview
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {previewItems.map((item) => (
              <div
                key={item.url}
                className="overflow-hidden rounded-lg border border-gray-200 bg-black/5"
              >
                <div className="aspect-video">
                  <iframe
                    className="h-full w-full"
                    src={`${item.embedUrl}?rel=0`}
                    title={`YouTube video ${item.videoId}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductVideoUrls;

import { ProductItem } from "@/types/products";

export type ProductMediaItem =
  | {
      type: "video";
      key: string;
      sourceUrl: string;
      videoId: string;
      embedUrl: string;
    }
  | {
      type: "image";
      key: string;
      sourceUrl: string;
    };

const getYoutubeVideoId = (rawUrl: string): string | null => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const normalizedUrl = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(normalizedUrl);
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
  } catch {
    return null;
  }

  return null;
};

export const buildProductMediaItems = (
  productDetails: ProductItem,
): ProductMediaItem[] => {
  const videoItems: ProductMediaItem[] = [];
  const imageItems: ProductMediaItem[] = [];
  const seenVideoIds = new Set<string>();

  for (const item of productDetails.video_urls ?? []) {
    const urls = Array.isArray(item?.url)
      ? item.url
      : typeof item?.url === "string"
        ? [item.url]
        : [];

    for (const url of urls) {
      const videoId = getYoutubeVideoId(url);
      if (!videoId || seenVideoIds.has(videoId)) continue;

      seenVideoIds.add(videoId);
      videoItems.push({
        type: "video",
        key: `video-${videoId}`,
        sourceUrl: url,
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      });
    }
  }

  for (let index = 0; index < (productDetails.static_files?.length ?? 0); index += 1) {
    const file = productDetails.static_files[index];
    const url = file?.url?.trim();
    if (!url) continue;

    imageItems.push({
      type: "image",
      key: `image-${index}-${url}`,
      sourceUrl: url,
    });
  }

  return [...videoItems, ...imageItems];
};


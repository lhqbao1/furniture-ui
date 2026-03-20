import {
  getAllKeywords,
  getProductsAlgoliaSearch,
} from "@/features/products/api";
import type { Metadata } from "next";
import { KeywordResponse } from "@/types/keyword";
import { ProductResponse } from "@/types/products";
import ShopKeywordClient from "./page-client";

const BASE_URL = "https://www.prestige-home.de";
const LOCALE = "de";

const EMPTY_PRODUCTS: ProductResponse = {
  pagination: {
    page: 1,
    page_size: 12,
    total_items: 0,
    total_pages: 1,
  },
  items: [],
};

type PageParams = {
  keyword: string;
};

function safeTrim(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function safeDecodeKeyword(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeKeyword(value: string): string {
  return safeDecodeKeyword(value)
    .replace(/\+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKeywordForCompare(value: string): string {
  return normalizeKeyword(value).toLocaleLowerCase("de-DE");
}

function parsePositivePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
}

function sanitizeKeywords(input: unknown): KeywordResponse[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const record = item as Partial<KeywordResponse> | null | undefined;
      const keywork = safeTrim(record?.keywork);
      if (!keywork) return null;

      return {
        keywork,
        description: safeTrim(record?.description),
        body_description: safeTrim(record?.body_description),
      } satisfies KeywordResponse;
    })
    .filter((item): item is KeywordResponse => item !== null);
}

function sanitizeProductsResponse(input: unknown): ProductResponse {
  const record = input as Partial<ProductResponse> | null | undefined;
  const items = Array.isArray(record?.items)
    ? record.items.filter(Boolean)
    : [];
  const paginationSource = record?.pagination as
    | Partial<ProductResponse["pagination"]>
    | undefined;

  return {
    items,
    pagination: {
      page: Math.max(1, Number(paginationSource?.page) || 1),
      page_size: Math.max(1, Number(paginationSource?.page_size) || 12),
      total_items: Math.max(0, Number(paginationSource?.total_items) || 0),
      total_pages: Math.max(1, Number(paginationSource?.total_pages) || 1),
    },
  };
}

function buildCanonicalUrl(keyword: string): string {
  return `${BASE_URL}/${LOCALE}/shop/${encodeURIComponent(keyword)}`;
}

export async function generateStaticParams() {
  try {
    const keywords = sanitizeKeywords(await getAllKeywords());

    return keywords.map((keyword) => ({
      keyword: keyword.keywork,
    }));
  } catch (error) {
    console.error("❌ generateStaticParams /shop/[keyword] failed:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { keyword } = await params;
  const normalizedKeyword = normalizeKeyword(keyword);
  const fallbackKeyword = normalizedKeyword || "Shop";

  let keywords: KeywordResponse[] = [];
  try {
    keywords = sanitizeKeywords(await getAllKeywords());
  } catch (error) {
    console.error("❌ generateMetadata /shop/[keyword] failed:", error);
  }

  const matchedKeyword = keywords.find(
    (item) =>
      normalizeKeywordForCompare(item.keywork) ===
      normalizeKeywordForCompare(fallbackKeyword),
  );

  const readableKeyword = safeTrim(matchedKeyword?.keywork) || fallbackKeyword;
  const canonicalUrl = buildCanonicalUrl(readableKeyword);

  // Priority: keyword.description -> keyword.body_description -> fallback text
  const description =
    safeTrim(matchedKeyword?.description) ||
    safeTrim(matchedKeyword?.body_description) ||
    `${readableKeyword} online kaufen bei Prestige Home. Entdecken Sie hochwertige Möbel und Wohnaccessoires mit schneller Lieferung in Deutschland.`;

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: `${readableKeyword} kaufen`,
    description,
    url: canonicalUrl,
    inLanguage: "de-DE",
    isPartOf: {
      "@type": "WebSite",
      name: "Prestige Home",
      url: BASE_URL,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Startseite",
        item: `${BASE_URL}/${LOCALE}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: readableKeyword,
        item: canonicalUrl,
      },
    ],
  };

  return {
    title: `${readableKeyword} kaufen | Prestige Home`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: "de_DE",
      url: canonicalUrl,
      title: `${readableKeyword} kaufen | Prestige Home`,
      description,
      siteName: "Prestige Home",
    },
    twitter: {
      card: "summary_large_image",
      title: `${readableKeyword} kaufen | Prestige Home`,
      description,
    },
    other: {
      "application/ld+json": JSON.stringify([pageSchema, breadcrumbSchema]),
    },
  };
}

export const revalidate = 300;

export default async function ShopKeywordPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { keyword } = await params;
  const { page } = await searchParams;

  const normalizedKeyword = normalizeKeyword(keyword);
  const searchText = normalizedKeyword || "Shop";
  const currentPage = parsePositivePage(page);

  const [productsResult, keywordsResult] = await Promise.allSettled([
    getProductsAlgoliaSearch({
      query: searchText,
      page: currentPage,
      page_size: 12,
      is_active: true,
    }),
    getAllKeywords(),
  ]);

  const productsRaw =
    productsResult.status === "fulfilled"
      ? productsResult.value
      : EMPTY_PRODUCTS;
  const products = sanitizeProductsResponse(productsRaw);

  const keywords: KeywordResponse[] =
    keywordsResult.status === "fulfilled"
      ? sanitizeKeywords(keywordsResult.value)
      : [];

  const matchedKeyword = keywords.find(
    (item) =>
      normalizeKeywordForCompare(item.keywork) ===
      normalizeKeywordForCompare(searchText),
  );

  const bodyDescription = safeTrim(matchedKeyword?.body_description);

  return (
    <div className="pt-3 xl:pt-6 xl:pb-16 pb-6">
      <h1 className="text-center text-secondary capitalize">{searchText}</h1>

      <div className="mt-4 max-w-4xl mx-auto text-gray-700 leading-relaxed text-center">
        {bodyDescription}
      </div>

      <ShopKeywordClient
        initialData={products}
        searchText={searchText}
        initialPage={currentPage}
      />
    </div>
  );
}

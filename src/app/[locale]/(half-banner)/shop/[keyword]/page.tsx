import {
  getAllKeywords,
  getProductsAlgoliaSearch,
} from "@/features/products/api";
import type { Metadata } from "next";
import { KeywordResponse } from "@/types/keyword";
import { ProductResponse } from "@/types/products";
import ShopKeywordClient from "./page-client";

const EMPTY_PRODUCTS: ProductResponse = {
  pagination: {
    page: 1,
    page_size: 20,
    total_items: 0,
    total_pages: 1,
  },
  items: [],
};

export async function generateStaticParams() {
  try {
    const keywords = await getAllKeywords();

    return keywords.map((keyword) => ({
      keyword: keyword.keywork,
    }));
  } catch (error) {
    console.error("❌ generateStaticParams /shop/[keyword] failed:", error);
    return [];
  }
}

type PageParams = {
  keyword: string;
};

function safeDecodeKeyword(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { keyword } = await params; // ✅ BẮT BUỘC

  let keywords: KeywordResponse[] = [];
  try {
    keywords = await getAllKeywords();
  } catch (error) {
    console.error("❌ generateMetadata /shop/[keyword] failed:", error);
  }

  const rawKeyword = safeDecodeKeyword(keyword);
  const readable = rawKeyword;

  // 🔍 tìm keyword tương ứng
  const matchedKeyword = keywords.find(
    (k) => k.keywork.toLowerCase() === rawKeyword.toLowerCase(),
  );

  const description =
    matchedKeyword?.description?.trim() ||
    `Buy ${readable} online at Prestige Home. Discover high-quality furniture and home accessories with fast delivery.`;

  return {
    title: `${readable} kaufen online`,
    description,
    alternates: {
      canonical: `https://www.prestige-home.de/de/shop/${encodeURIComponent(rawKeyword)}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const revalidate = 300; // ISR

function parsePositivePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
}

export default async function ShopKeywordPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { keyword } = await params; // ✅ BẮT BUỘC
  const { page } = await searchParams;

  const decodedKeyword = safeDecodeKeyword(keyword);
  const searchText = decodedKeyword;
  const currentPage = parsePositivePage(page);

  // 🔹 fetch song song (tối ưu)
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
  const keywords: KeywordResponse[] =
    keywordsResult.status === "fulfilled" ? keywordsResult.value : [];

  const products = productsRaw;

  // 🔍 tìm keyword tương ứng
  const matchedKeyword = keywords.find(
    (k) => k.keywork.toLowerCase() === decodedKeyword.toLowerCase(),
  );

  return (
    <div className="pt-3 xl:pt-6 xl:pb-16 pb-6">
      <h1 className="text-center text-secondary capitalize">{searchText}</h1>

      <div className="mt-4 max-w-4xl mx-auto text-gray-700 leading-relaxed text-center">
        {matchedKeyword?.body_description}
      </div>

      {/* Client handles pagination */}
      <ShopKeywordClient
        initialData={products}
        searchText={searchText}
        initialPage={currentPage}
      />
    </div>
  );
}

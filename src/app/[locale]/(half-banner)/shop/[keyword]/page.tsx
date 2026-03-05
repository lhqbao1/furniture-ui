import { getAllKeywords, getAllProducts } from "@/features/products/api";
import { slugify } from "@/lib/slugify";
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
      keyword: slugify(keyword.keywork),
    }));
  } catch (error) {
    console.error("❌ generateStaticParams /shop/[keyword] failed:", error);
    return [];
  }
}

type PageParams = {
  keyword: string;
};

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

  const rawKeyword = decodeURIComponent(keyword);
  const readable = rawKeyword.replaceAll("-", " ");

  // 🔍 tìm keyword tương ứng
  const matchedKeyword = keywords.find(
    (k) => k.keywork.toLowerCase() === rawKeyword.toLowerCase(),
  );

  const description =
    matchedKeyword?.description ??
    `Buy ${readable} online at Prestige Home. Discover high-quality furniture and home accessories with fast delivery.`;

  return {
    title: `${readable} kaufen online`,
    description,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const revalidate = 300; // ISR

export default async function ShopKeywordPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { keyword } = await params; // ✅ BẮT BUỘC

  const keywordSlug = decodeURIComponent(keyword);
  const searchText = keywordSlug.replaceAll("-", " ");

  // 🔹 fetch song song (tối ưu)
  const [productsResult, keywordsResult] = await Promise.allSettled([
    getAllProducts({
      search: searchText,
      page: 1,
    }),
    getAllKeywords(),
  ]);

  const productsRaw =
    productsResult.status === "fulfilled"
      ? productsResult.value
      : EMPTY_PRODUCTS;
  const keywords: KeywordResponse[] =
    keywordsResult.status === "fulfilled" ? keywordsResult.value : [];

  const products = {
    ...productsRaw,
    items: productsRaw.items.filter((p) => p.is_active),
  };

  // 🔍 tìm keyword tương ứng
  const matchedKeyword = keywords.find(
    (k) => k.keywork.toLowerCase() === keywordSlug.toLowerCase(),
  );

  return (
    <div className="pt-3 xl:pt-6 xl:pb-16 pb-6">
      <h1 className="text-center text-secondary capitalize">{searchText}</h1>

      <div className="mt-4 max-w-4xl mx-auto text-gray-700 leading-relaxed text-center">
        {matchedKeyword?.body_description}
      </div>

      {/* Client handles pagination */}
      <ShopKeywordClient initialData={products} searchText={searchText} />
    </div>
  );
}

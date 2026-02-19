import { getAllKeywords, getAllProducts } from "@/features/products/api";
import { slugify } from "@/lib/slugify";
import type { Metadata } from "next";
import ShopKeywordClient from "./page-client";

export async function generateStaticParams() {
  const keywords = await getAllKeywords();

  return keywords.map((keyword) => ({
    keyword: slugify(keyword.keywork),
  }));
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

  const keywords = await getAllKeywords();

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
    title: `${readable} kaufen online | Prestige Home`,
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
  const [productsRaw, keywords] = await Promise.all([
  getAllProducts({
    search: searchText,
    page: 1,
  }),
  getAllKeywords(),
]);

const products = {
  ...productsRaw,
  items: productsRaw.items.filter(p => p.is_active),
};

  // 🔍 tìm keyword tương ứng
  const matchedKeyword = keywords.find(
    (k) => k.keywork.toLowerCase() === keywordSlug.toLowerCase(),
  );

  return (
    <div className="pt-3 xl:pt-6 xl:pb-16 pb-6">
      <h1 className="text-center text-secondary capitalize">{searchText}</h1>

      <div className="mt-4 max-w-4xl mx-auto text-gray-700 leading-relaxed text-center">
        {" "}
        {matchedKeyword?.body_description}
      </div>

      {/* Client handles pagination */}
      <ShopKeywordClient initialData={products} searchText={searchText} />
    </div>
  );
}

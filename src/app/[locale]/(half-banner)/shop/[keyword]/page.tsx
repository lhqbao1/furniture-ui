import { getAllKeywords, getAllProducts } from "@/features/products/api";
import { slugify } from "@/lib/slugify";
import type { Metadata } from "next";
import ShopKeywordClient from "./page-client";

export async function generateStaticParams() {
  const keywords = await getAllKeywords();

  return keywords.map((keyword) => ({
    keyword: slugify(keyword),
  }));
}

type PageParams = {
  keyword: string;
};

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const keyword = decodeURIComponent(params.keyword);
  const readable = keyword.replaceAll("-", " ");

  return {
    title: `${readable} kaufen online | Prestige Home`,
    description: `Entdecken Sie ${readable} zu besten Preisen bei Prestige Home`,
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
  params: PageParams;
}) {
  const keyword = decodeURIComponent(params.keyword);
  const searchText = keyword.replaceAll("-", " ");

  // 👉 fetch FIRST PAGE on server (SEO)
  const data = await getAllProducts({
    search: searchText,
    page: 1,
  });

  return (
    <div className="pt-3 xl:pt-6 xl:pb-16 pb-6">
      <h1 className="text-center text-secondary capitalize">{searchText}</h1>

      {/* Client handles pagination */}
      <ShopKeywordClient
        initialData={data}
        searchText={searchText}
      />
    </div>
  );
}

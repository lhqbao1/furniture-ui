import { CategoryBySlugResponse } from "@/types/categories";
import { cache } from "react";

export async function getCategoryBySlugServer(
  category_slug: string,
  params?: {
    product_name?: string;
    page?: number;
    page_size?: number;
  },
): Promise<CategoryBySlugResponse> {
  const query = new URLSearchParams({
    product_name: params?.product_name ?? "",
    page: String(params?.page ?? 1),
    page_size: String(params?.page_size ?? 8),
  });

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_BASE_URL
    }categories/slug/${category_slug}?${query.toString()}`,
    {
      next: {
        revalidate: 3600, // ✅ cache 1 giờ
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch category");
  }

  return res.json();
}

export const getCategoryCached = cache(getCategoryBySlugServer);

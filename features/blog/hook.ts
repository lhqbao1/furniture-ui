import { useQuery } from "@tanstack/react-query";
import {
  getBlogsByProduct,
  getBlogs,
  GetAllBlogsParams,
  GetBlogsByProductParams,
  getBlogsByProductSlug,
} from "@/features/blog/api";

export function useGetBlogsByProduct(params?: GetBlogsByProductParams) {
  return useQuery({
    queryKey: [
      "blogs-by-product",
      params?.page_size_product,
      params?.page_size_blog,
      false,
    ],
    queryFn: () =>
      getBlogsByProduct({
        ...params,
        is_econelo: undefined,
      }),
    retry: false,
  });
}

export function useGetBlogs(params?: GetAllBlogsParams) {
  return useQuery({
    queryKey: ["blogs", params?.page, params?.pageSize, false],
    queryFn: () =>
      getBlogs({
        ...params,
        is_econelo: undefined,
      }),
    retry: false,
    placeholderData: (prev) => prev, // giữ lại data trước khi trang thay đổi (optional)
  });
}

export function useGetBlogsByProductSlug(productSlug: string) {
  return useQuery({
    queryKey: ["blogs-product-slug", productSlug], // 👈 KEY CHUẨN
    queryFn: () =>
      getBlogsByProductSlug({
        product_slug: productSlug,
        page: 1,
        page_size: 16,
      }),
    enabled: !!productSlug,
    retry: false,
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBlogsByProduct,
  getBlogs,
  GetAllBlogsParams,
  getBlogsByProductSlug,
} from "@/features/blog/api";

export function useGetBlogsByProduct() {
  return useQuery({
    queryKey: ["blogs-by-product"],
    queryFn: getBlogsByProduct,
    retry: false,
  });
}

export function useGetBlogs(params?: GetAllBlogsParams) {
  return useQuery({
    queryKey: ["blogs", params?.page, params?.pageSize],
    queryFn: () => getBlogs(params),
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

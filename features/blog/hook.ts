import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBlogsByProduct,
  getBlogs,
  getBlogDetails,
  GetAllBlogsParams,
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

export function useUpdateBlog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ title, input }: { title: string; input: string }) =>
      getBlogDetails(input, title), // tạm dùng PUT như update
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["blog-details", variables.title],
      });
      qc.invalidateQueries({
        queryKey: ["blogs"],
      });
    },
  });
}

import { parse } from "url";
import { apiPublic } from "@/lib/axios";
import { BlogByProductResponse, BlogItem, BlogsResponse } from "@/types/blog";

export interface GetAllBlogsParams {
  page?: number;
  pageSize?: number;
}

export interface GetBlogsByProductSlugParams {
  product_slug: string; // bắt buộc
  page?: number; // optional
  page_size?: number; // optional
}

export async function getBlogsByProduct() {
  const { data } = await apiPublic.get("/blog/all-blog-products");
  return data as BlogByProductResponse[];
}

export async function getBlogsByProductSlug({
  product_slug,
  page,
  page_size,
}: GetBlogsByProductSlugParams) {
  if (!product_slug) {
    throw new Error("product_slug is required");
  }

  const { data } = await apiPublic.get(`/blog/product/${product_slug}`, {
    params: {
      product_slug,
      ...(page !== undefined && { page }),
      ...(page_size !== undefined && { page_size }),
    },
  });

  return data as BlogsResponse;
}

export async function getBlogs(params?: GetAllBlogsParams) {
  const { data } = await apiPublic.get("/blog/all", {
    params: {
      ...(params?.page !== undefined && { page: params.page }),
      ...(params?.pageSize !== undefined && { page_size: params.pageSize }),
    },
  });
  return data as BlogsResponse;
}

export async function getBlogDetailsBySlug(blog_slug: string) {
  try {
    const { data } = await apiPublic.get(`/blog/details/${blog_slug}`, {
      params: { blog_slug },
    });
    return data as BlogItem;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // ⭐ Trả null khi slug không tồn tại
    }
    throw error; // lỗi khác thì throw để debug
  }
}

export async function getAllBlogSlug() {
  try {
    const { data } = await apiPublic.get("/blog/all-slug");
    return data;
  } catch (err) {
    throw err;
  }
}

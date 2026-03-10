import { Pagination } from "./pagination";

export interface BlogItem {
  id: string;
  title: string;
  content: string; // HTML/Markdown Content
  slug: string;
  created_at: string;
  blog_id: string;
}

export interface BlogByProductBlogItem {
  id: string;
  title: string;
  slug: string;
  created_at?: string;
}

export interface BlogByProductProductItem {
  id: string;
  url_key: string;
  id_provider: string;
  name: string;
  image: string;
  blogs: BlogByProductBlogItem[];
  pagination_blog: Pagination;
}

export interface BlogByProductResponse {
  products: BlogByProductProductItem[];
  pagination_product: Pagination;
}

export interface BlogsResponse {
  pagination: Pagination;
  items: BlogItem[];
}

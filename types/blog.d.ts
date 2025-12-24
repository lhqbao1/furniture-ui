import { Pagination } from "./pagination";
import { ProductItem } from "./products";

export interface BlogItem {
  id: string;
  title: string;
  content: string; // HTML/Markdown Content
  slug: string;
  created_at: string;
  blog_id: string;
}

export interface BlogByProductResponse {
  product: ProductItem;
  blogs: BlogItem[];
  created_at: string;
}

export interface BlogsResponse {
  pagination: Pagination;
  items: BlogItem[];
}

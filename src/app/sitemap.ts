import { apiPublic } from "@/lib/axios";
import { BlogItem } from "@/types/blog";
import { CategoryResponse } from "@/types/categories";
import { ProductItem } from "@/types/products";
import { MetadataRoute } from "next";

function collectCategoryUrls(
  categories: CategoryResponse[],
): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  const traverse = (cats: CategoryResponse[]) => {
    cats.forEach((cat) => {
      urls.push({
        url: `https://www.prestige-home.de/category/${cat.slug}`,
        lastModified: new Date(cat.updated_at || new Date()),
        changeFrequency: "weekly",
        priority: 0.7,
      });

      if (cat.children && cat.children.length > 0) {
        traverse(cat.children);
      }
    });
  };

  traverse(categories);
  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // URL tĩnh
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: "https://www.prestige-home.de/de",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://www.prestige-home.de/de/about-us",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.prestige-home.de/de/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.prestige-home.de/de/faq",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.prestige-home.de/de/impressum",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.prestige-home.de/de/agb",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.prestige-home.de/de/cancellation",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.prestige-home.de/de/privacy-policy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // {
    //   url: "https://www.prestige-home.de/de/privacy-policy",
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
  ];

  // URL động cho category
  let categories: CategoryResponse[] = [];
  try {
    const res = await apiPublic.get("/categories/");
    categories = res.data;
  } catch (e) {
    categories = [];
  }

  const categoryUrls = collectCategoryUrls(categories);

  // URL động cho product
  let products: ProductItem[] = [];
  try {
    const res = await apiPublic.get("/products/all", {
      params: {
        all_products: false,
        is_econelo: false,
      },
    });

    products = res.data;
  } catch (e) {
    products = [];
  }

  const productUrls: MetadataRoute.Sitemap = products.map((p: ProductItem) => ({
    url: `https://www.prestige-home.de/de/product/${p.url_key}`,
    lastModified: new Date(p.updated_at || new Date()),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  // URL động cho blogs
  let blogs: BlogItem[] = [];
  try {
    const res = await apiPublic.get("/blog/all", {
      params: {
        page_size: 100,
      },
    });
    blogs = res.data.items;
  } catch (e) {
    blogs = [];
  }

  const blogUrls: MetadataRoute.Sitemap = blogs.map((p: BlogItem) => ({
    url: `https://www.prestige-home.de/de/blog/${p.slug}`,
    lastModified: new Date(p.created_at || new Date()),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  // URL động cho landing page
  let keywords: string[] = [];
  try {
    const res = await apiPublic.get("/products/get-all-key-work");
    keywords = res.data;
  } catch (e) {
    blogs = [];
  }

  const keywordUrls: MetadataRoute.Sitemap = keywords.map((p: string) => ({
    url: `https://www.prestige-home.de/de/shop/${p}`,
    lastModified: new Date(new Date()),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [
    ...staticUrls,
    ...categoryUrls,
    ...productUrls,
    ...blogUrls,
    ...keywordUrls,
  ];
}

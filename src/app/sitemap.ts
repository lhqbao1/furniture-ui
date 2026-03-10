import { apiPublic } from "@/lib/axios";
import { slugify } from "@/lib/slugify";
import { BlogItem } from "@/types/blog";
import { CategoryResponse } from "@/types/categories";
import { ProductItem } from "@/types/products";
import { MetadataRoute } from "next";

function toKeywordSlug(value: unknown): string {
  if (typeof value === "string") {
    return slugify(value);
  }

  if (typeof value === "number") {
    return slugify(String(value));
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidate =
      record.keywork ?? record.keyword ?? record.name ?? record.value;

    if (typeof candidate === "string") {
      return slugify(candidate);
    }

    if (typeof candidate === "number") {
      return slugify(String(candidate));
    }
  }

  return "";
}

function isPublishableProduct(product?: Partial<ProductItem> | null) {
  if (!product) return false;

  const hasSku =
    typeof product.sku === "string" && product.sku.trim().length > 0;
  const hasEan =
    typeof product.ean === "string" && product.ean.trim().length > 0;
  const hasCarrier =
    typeof product.carrier === "string" && product.carrier.trim().length > 0;
  const hasImages =
    Array.isArray(product.static_files) && product.static_files.length > 0;
  const hasDescription =
    typeof product.description === "string" &&
    product.description.trim().length > 0;
  const hasCategory =
    Array.isArray(product.categories) && product.categories.length > 0;
  const hasBrand =
    typeof product.brand?.name === "string" &&
    product.brand.name.trim().length > 0;
  const hasFinalPrice =
    product.final_price !== null &&
    product.final_price !== undefined &&
    Number.isFinite(Number(product.final_price));
  const hasStock = product.stock !== null && product.stock !== undefined;

  return (
    product.is_active === true &&
    hasSku &&
    hasEan &&
    hasCarrier &&
    hasImages &&
    hasDescription &&
    hasCategory &&
    hasBrand &&
    hasFinalPrice &&
    hasStock
  );
}

function collectCategoryUrls(
  categories: CategoryResponse[],
): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  const traverse = (cats: CategoryResponse[]) => {
    cats.forEach((cat) => {
      urls.push({
        url: `https://www.prestige-home.de/de/category/${cat.slug}`,
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
      url: "https://www.prestige-home.de/de/widerrufsbelehrung",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.prestige-home.de/de/datenschutzerklaerung",
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

  const withTimeout = {
    timeout: 20000,
  };

  // Fetch song song để tránh timeout sitemap khi build
  const [categoriesRes, productsRes, blogsRes, keywordsRes] =
    await Promise.allSettled([
      apiPublic.get("/categories/", withTimeout),
      apiPublic.get("/products/all", {
        ...withTimeout,
        params: {
          all_products: false,
          is_econelo: undefined,
        },
      }),
      apiPublic.get("/blog/all", {
        ...withTimeout,
        params: {
          page_size: 100,
        },
      }),
      apiPublic.get("/products/get-all-key-work", withTimeout),
    ]);

  const categories: CategoryResponse[] =
    categoriesRes.status === "fulfilled" &&
    Array.isArray(categoriesRes.value.data)
      ? categoriesRes.value.data
      : [];

  const categoryUrls = collectCategoryUrls(categories);

  const products: ProductItem[] =
    productsRes.status === "fulfilled" && Array.isArray(productsRes.value.data)
      ? productsRes.value.data
      : [];

  const productUrls: MetadataRoute.Sitemap = products
    .filter(
      (p) =>
        p?.url_key &&
        typeof p.url_key === "string" &&
        p.url_key.length > 0 &&
        isPublishableProduct(p),
    )
    .map((p: ProductItem) => ({
      url: `https://www.prestige-home.de/de/product/${p.url_key}`,
      lastModified: new Date(p.updated_at || new Date()),
      changeFrequency: "daily",
      priority: 0.6,
    }));

  const blogs: BlogItem[] =
    blogsRes.status === "fulfilled" &&
    Array.isArray(blogsRes.value.data?.items)
      ? blogsRes.value.data.items
      : [];

  const blogUrls: MetadataRoute.Sitemap = blogs.map((p: BlogItem) => ({
    url: `https://www.prestige-home.de/de/blog/${p.slug}`,
    lastModified: new Date(p.created_at || new Date()),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const keywords: unknown[] =
    keywordsRes.status === "fulfilled" &&
    Array.isArray(keywordsRes.value.data)
      ? keywordsRes.value.data
      : [];

  const keywordUrls: MetadataRoute.Sitemap = keywords
    .map((keyword) => toKeywordSlug(keyword))
    .filter((slug) => slug.length > 0)
    .map((slug) => ({
      url: `https://www.prestige-home.de/de/shop/${slug}`,
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

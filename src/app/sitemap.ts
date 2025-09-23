import { apiPublic } from "@/lib/axios"
import { CategoryResponse } from "@/types/categories"
import { ProductItem } from "@/types/products"
import { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // URL tĩnh
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: "https://www.prestige-home.de",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://www.prestige-home.de/uber-uns",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.prestige-home.de/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
        url: "https://www.prestige-home.de/faq",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: "https://www.prestige-home.de/impressum",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: "https://www.prestige-home.de/agb",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: "https://www.prestige-home.de/widderuf",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: "https://www.prestige-home.de/datenschutzerklarung",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
  ]

  // URL động cho category
  let categories: CategoryResponse[] = []
  try {
    const res = await apiPublic.get("/categories/")
    categories = res.data
  } catch (e) {
    categories = []
  }

  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat: CategoryResponse) => ({
    url: `https://www.prestige-home.de/product/${cat.slug}`,
    lastModified: new Date(cat.updated_at || new Date()),
    changeFrequency: "weekly",
    priority: 0.7,
  }))


  // URL động cho product
  let products: ProductItem[] = []
  try {
    const res = await apiPublic.get("/products/")
    products = res.data.items
  } catch (e) {
    products = []
  }

  const productUrls: MetadataRoute.Sitemap = products.map((p: ProductItem) => ({
    url: `https://www.prestige-home.de/product/${p.url_key}`,
    lastModified: new Date(p.updated_at || new Date()),
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [...staticUrls, ...categoryUrls, ...productUrls]
}

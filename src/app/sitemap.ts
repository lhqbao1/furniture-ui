import { apiPublic } from "@/lib/axios"
import { CategoryResponse } from "@/types/categories"
import { ProductItem } from "@/types/products"
import { MetadataRoute } from "next"

function collectCategoryUrls(categories: CategoryResponse[]): MetadataRoute.Sitemap {
    const urls: MetadataRoute.Sitemap = []
  
    const traverse = (cats: CategoryResponse[]) => {
      cats.forEach((cat) => {
        urls.push({
          url: `https://www.prestige-home.de/category/${cat.slug}`,
          lastModified: new Date(cat.updated_at || new Date()),
          changeFrequency: "weekly",
          priority: 0.7,
        })
  
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children)
        }
      })
    }
  
    traverse(categories)
    return urls
  }

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
      url: "https://www.prestige-home.de/about-us",
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
        url: "https://www.prestige-home.de/cancellation",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: "https://www.prestige-home.de/privacy-policy",
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

  const categoryUrls = collectCategoryUrls(categories)

  // URL động cho product
  let products: ProductItem[] = []
  try {
    const res = await apiPublic.get("/products/all-product")
    products = res.data
  } catch (e) {
    products = []
  }

  const productUrls: MetadataRoute.Sitemap = products.map((p: ProductItem) => ({
    url: `https://www.prestige-home.de/product/${p.id}`,
    lastModified: new Date(p.updated_at || new Date()),
    changeFrequency: "daily",
    priority: 0.6,
  }))

  return [...staticUrls, ...categoryUrls, ...productUrls]
}

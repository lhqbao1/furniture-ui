// pages/api/google-feed.ts
import type { NextApiRequest, NextApiResponse } from "next"
import fs from "fs"
import path from "path"
import { getAllProducts } from "@/features/products/api"

// Giả sử bạn có hàm getProducts từ database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const products = await getAllProducts() // [{id, name, description, price, stock, slug, image, brand}, ...]

    const formatName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-')

    const feed = products.items.map(p => {
        const categories = p.categories || []
        const level1 = categories.find(c => c.level === 1)
        const level2 = categories.filter(c => c.level === 2)[0]
      
        const categoryHref = level1 && level2
          ? `/${formatName(level1.name)}/${formatName(level2.name)}/${p.id}`
          : level1
            ? `/${formatName(level1.name)}/${p.id}`
            : level2
              ? `/${formatName(level2.name)}/${p.id}`
              : `/${p.id}`
      
        return {
          id: p.id,
          title: p.name,
          description: p.description,
          link: `https://example.com${categoryHref}`, // sử dụng categoryHref
          image_link: p.static_files[0].url,
          availability: p.stock > 0 ? "in stock" : "out of stock",
          price: `${p.price.toFixed(2)} USD`,
          brand: p.brand,
          condition: "new",
        }
      })

    // Lưu JSON feed vào public folder để Google có thể fetch
    const filePath = path.join(process.cwd(), "public/google-feed.json")
    fs.writeFileSync(filePath, JSON.stringify(feed, null, 2))

    res.status(200).json({ success: true, total: feed.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: "Failed to generate feed" })
  }
}

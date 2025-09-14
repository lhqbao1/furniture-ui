import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAllProducts } from "@/features/products/api";
import { getAllProductsSelect } from "@/features/product-group/api";

export async function GET() {
  try {
    const products = await getAllProducts({all_products: true});

    const formatName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-');

    const feed = products.items.map(p => {
      const categories = p.categories || [];
      const level1 = categories.find(c => c.level === 1);
      const level2 = categories.find(c => c.level === 2);

      const categoryHref = level1 && level2
        ? `/${formatName(level1.name)}/${formatName(level2.name)}/${p.id}`
        : level1
          ? `/${formatName(level1.name)}/${p.id}`
          : level2
            ? `/${formatName(level2.name)}/${p.id}`
            : `/${p.id}`;

      return {
        id: p.id,
        title: p.name,
        description: p.description,
        link: `https://prestige-home.de${categoryHref}`,
        image_link: p.static_files[0]?.url,
        availability: p.stock > 0 ? "in stock" : "out of stock",
        price: `€${p.final_price.toFixed(2)}`,
        brand: p.brand,
        condition: "new",
      };
    });

    const filePath = path.join(process.cwd(), "public/google-feed.json");
    fs.writeFileSync(filePath, JSON.stringify(feed, null, 2));

    return NextResponse.json({ success: true, total: feed.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to generate feed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getAllProducts } from "@/features/products/api";

export async function GET() {
  try {
    const products = await getAllProducts({ all_products: true });

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

            const colors = p.options
  .filter(opt => opt.variant_name?.toLowerCase() === "color")
  .map(opt => opt.label);

      return {
        id: p.id,
        title: p.name,
        description: p.description,
        link: `https://prestige-home.de/product${categoryHref}`,
        image_link: p.static_files[0]?.url,
        availability: p.stock > 0 ? "in_stock" : "out_of_stock",
        price: `${p.final_price.toFixed(2)} EUR`,
        identifier_exists: 'no',
        gtin: p.ean,
        mpn: p.sku,
        brand: p.brand.name,
        condition: "new",
        adult: 'no',
        age_group: 'adult',
        item_group_id: p.parent_id,
        is_bundle: 'no',
        color: colors.length ? colors.join(", ") : undefined,
        shipping : { "country": "DE", "service": "Standard", "price": "5.95 EUR" }        
      };
    });

    // Trả trực tiếp JSON, không lưu file
    return NextResponse.json(feed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to generate feed" }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import { getAllProducts } from "@/features/products/api";
// import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";

// export async function GET() {
//   try {
//     const products = await getAllProducts({ all_products: true });

//     const formatName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-');

//     const feed = products.items.map(p => {
//       const categories = p.categories || [];
//       const level1 = categories.find(c => c.level === 1);
//       const level2 = categories.find(c => c.level === 2);

//       const categoryHref = level1 && level2
//         ? `/${formatName(level1.name)}/${formatName(level2.name)}/${p.id}`
//         : level1
//           ? `/${formatName(level1.name)}/${p.id}`
//           : level2
//             ? `/${formatName(level2.name)}/${p.id}`
//             : `/${p.id}`;

//             const colors = p.options
//                 .filter(opt => opt.variant_name?.toLowerCase() === "color")
//                 .map(opt => opt.label);

//       return {
//         id: p.id,
//         title: p.name.trim(),
//         description: cleanDescription(p.description),
//         // description: p.description,
//         link: `https://prestige-home.de/product${categoryHref}`,
//         image_link: cleanImageLink(p.static_files[0]?.url),
//         availability: p.stock > 0 ? "in_stock" : "out_of_stock",
//         price: `${p.final_price.toFixed(2)} EUR`,
//         identifier_exists: 'yes',
//         gtin: p.ean,
//         mpn: p.sku,
//         brand: p.brand ? p.brand.name : 'ECONELO',
//         condition: "new",
//         adult: 'no',
//         age_group: 'adult',
//         item_group_id: p.parent_id,
//         is_bundle: 'no',
//         color: colors.length ? colors.join(", ") : undefined,
//         shipping : { "country": "DE", "service": "Standard", "price": "5.95 EUR" }        
//       };
//     });

//     // Trả trực tiếp JSON, không lưu file
//     return NextResponse.json(feed);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ success: false, error: "Failed to generate feed" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { getAllProducts } from "@/features/products/api";
import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";

export async function GET() {
  try {
    const products = await getAllProducts({ all_products: true });

    const formatName = (name: string) =>
      name.trim().toLowerCase().replace(/\s+/g, "-");

    const itemsXml = products.items
      .map((p) => {
        const categories = p.categories || [];
        const level1 = categories.find((c) => c.level === 1);
        const level2 = categories.find((c) => c.level === 2);

        const categoryHref =
          level1 && level2
            ? `/${formatName(level1.name)}/${formatName(level2.name)}/${p.id}`
            : level1
            ? `/${formatName(level1.name)}/${p.id}`
            : level2
            ? `/${formatName(level2.name)}/${p.id}`
            : `/${p.id}`;

        const colors = p.options
          .filter((opt) => opt.variant_name?.toLowerCase() === "color")
          .map((opt) => opt.label)
          .join(", ");

        return `
        <item>
          <g:id>${p.id}</g:id>
          <g:title><![CDATA[${p.name.trim()}]]></g:title>
          <g:description><![CDATA[${cleanDescription(p.description)}]]></g:description>
          <g:link>https://prestige-home.de/product${categoryHref}</g:link>
          <g:image_link>${cleanImageLink(p.static_files[0]?.url)}</g:image_link>
          <g:availability>${p.stock > 0 ? "in stock" : "out of stock"}</g:availability>
          <g:price>${p.final_price.toFixed(2)}EUR</g:price>
          <g:identifier_exists>yes</g:identifier_exists>
          <g:gtin>${p.ean}</g:gtin>
          <g:mpn>${p.sku}</g:mpn>
          <g:brand>${p.brand?.name || "ECONELO"}</g:brand>
          <g:condition>new</g:condition>
          <g:adult>no</g:adult>
          <g:age_group>adult</g:age_group>
          <g:is_bundle>no</g:is_bundle>
          ${colors ? `<g:color>${colors}</g:color>` : ""}
          <g:shipping>
            <g:country>DE</g:country>
            <g:service>Standard</g:service>
            <g:price>5.95 EUR</g:price>
          </g:shipping>
        </item>
        `;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Prestige Home Feed</title>
    <link>https://prestige-home.de</link>
    <description>Product feed</description>
    ${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to generate XML feed" },
      { status: 500 }
    );
  }
}

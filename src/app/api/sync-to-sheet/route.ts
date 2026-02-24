import { getAllProductsSelect } from "@/features/product-group/api";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { ProductItem } from "@/types/products";
import { google } from "googleapis";
import { NextResponse } from "next/server";

// Bạn nên lưu nội dung JSON credentials trong biến môi trường
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  try {
    // 1️⃣ Xác thực với Google
    // 1️⃣ Tạo GoogleAuth
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // 2️⃣ Truyền GoogleAuth vào Google Sheets API
    const sheets = google.sheets({
      version: "v4",
      auth, // ⭐ FIX CHÍNH Ở ĐÂY
    });

    // 2️⃣ Xoá toàn bộ dữ liệu trừ hàng 1
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2:Z9999", // xoá từ dòng 2 trở xuống
    });

    const products = await getAllProductsSelect({
      is_econelo: false,
      all_products: true,
      supplier_id: "prestige_home",
    }); // bạn sẽ viết hàm này

    // 3️⃣ Lọc sản phẩm đang active và có tồn kho
    const activeProducts = products.filter(
      (p: ProductItem) =>
        p.is_active === true && calculateAvailableStock(p) > 0,
    );

    const values = activeProducts.map((p) => {
      const productUrl = p.brand
        ? p.brand.name.toLowerCase() === "econelo"
          ? `https://econelo.de/produkt/${p.url_key}`
          : `https://prestige-home.de/de/product/${p.url_key}`
        : `https://prestige-home.de/de/product/${p.url_key}`;

      const imageUrl =
        Array.isArray(p.static_files) && p.static_files.length > 0
          ? p.static_files[0].url
          : "";

      // 1️⃣ Clean HTML
      const cleanDescription = p.description
        ?.replace(/<[^>]*>?/gm, "")
        ?.replace(/\s+/g, " ")
        ?.trim();

      const price = p.final_price
        ? `${Number(p.final_price).toFixed(2)} EUR`
        : "";

      // 4️⃣ Shipping cost
      const shippingPrice =
        p.carrier?.toLowerCase() === "amm" || "spedition"
          ? "35.95 EUR"
          : "5.95 EUR";
      const shipping = `DE:::${shippingPrice}`;

      const additionalImages = Array.isArray(p.static_files)
        ? p.static_files
            .slice(1, 4)
            .map((f) => f.url)
            .join(",")
        : "";

      const shippingLabel =
        p.carrier === "amm" || p.carrier === "spedition"
          ? "Spedition"
          : "Paket";

      return [
        p.id_provider ?? "",
        p.name ?? "",
        cleanDescription ?? "",
        calculateAvailableStock(p) > 0 ? "in_stock" : "out_of_stock",
        productUrl,
        price,
        // p.ean ? "yes" : "no",
        p.ean ?? "",
        p.sku,
        imageUrl,
        "new",
        shippingLabel,
        shipping,
        additionalImages,
      ];
    });
    // 4️⃣ Ghi vào Google Sheet (ví dụ từ A2)
    https: await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    return NextResponse.json({
      success: true,
      count: values.length,
      data: values,
    });
  } catch (error) {
    console.error("Sync error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

import { google } from "googleapis";
import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { ProductItem } from "@/types/products";

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    console.log(
      "HAS SERVICE ACCOUNT:",
      !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    );
    console.log("HAS FOLDER ID:", !!process.env.GOOGLE_DRIVE_FOLDER_ID);

    const sheets = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });

    // 📅 File name theo ngày
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `product-feed-${date}`;

    // 1️⃣ Create Spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: fileName,
        },
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId!;

    const file = await drive.files.get({
      fileId: spreadsheetId,
      fields: "parents",
    });

    await drive.files.update({
      fileId: spreadsheetId,
      addParents: FOLDER_ID,
      removeParents: file.data.parents?.join(","),
    });

    // 3️⃣ Get products
    const products = await getProductsFeed();

    const activeProducts = products.filter(
      (p: ProductItem) => p.is_active && p.stock > 0,
    );

    const rows = activeProducts.map((p) => {
      const productUrl = p.url_key
        ? `https://www.prestige-home.de/de/product/${p.url_key}`
        : "";

      const imageUrl = p.static_files?.[0]?.url ?? "";

      const cleanDescription = p.description
        ?.replace(/<[^>]*>?/gm, "")
        ?.replace(/\s+/g, " ")
        ?.trim();

      const price = p.final_price
        ? `${Number(p.final_price).toFixed(2)} EUR`
        : "";

      const shipping =
        p.carrier?.toLowerCase() === "dpd" ? "DE:::5.95 EUR" : "DE:::35.95 EUR";

      return [
        p.is_active,
        p.id_provider ?? "",
        p.name ?? "",
        cleanDescription ?? "",
        "in_stock",
        productUrl,
        imageUrl,
        price,
        p.ean ? "yes" : "no",
        p.ean ?? "",
        p.sku ?? "",
        p.brand?.name ?? "",
        shipping,
      ];
    });

    // 4️⃣ Header
    const header = [
      [
        "status",
        "id",
        "title",
        "description",
        "availability",
        "link",
        "image_link",
        "price",
        "identifier_exists",
        "gtin",
        "mpn",
        "brand",
        "shipping",
      ],
    ];

    // 5️⃣ Write data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: [...header, ...rows],
      },
    });

    return NextResponse.json({
      success: true,
      spreadsheetId,
      fileName,
      count: rows.length,
    });
  } catch (err: any) {
    console.error("🔥 EXPORT ERROR:", err?.message || err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

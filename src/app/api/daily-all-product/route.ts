import { google } from "googleapis";
import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { ProductItem } from "@/types/products";

function parseGoogleServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET() {
  const serviceAccount = parseGoogleServiceAccount();
  if (!serviceAccount) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing or invalid GOOGLE_SERVICE_ACCOUNT_JSON",
      },
      { status: 500 },
    );
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    return NextResponse.json(
      { success: false, error: "Missing GOOGLE_DRIVE_FOLDER_ID" },
      { status: 500 },
    );
  }

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
      supportsAllDrives: true,
    });

    await drive.files.update({
      fileId: spreadsheetId,
      addParents: folderId,
      removeParents: file.data.parents?.join(","),
      supportsAllDrives: true,
    });

    // 3️⃣ Get products
    const products = await getProductsFeed();

    const activeProducts = products.filter(
      (p: ProductItem) => p.is_active && p.stock > 0,
    );

    const rows = activeProducts.map((p) => {
      const productUrl = p.brand
        ? p.brand.name.toLowerCase() === "econelo"
          ? `https://econelo.de/produkt/${p.url_key}`
          : `https://prestige-home.de/de/product/${p.url_key}`
        : `https://prestige-home.de/de/product/${p.url_key}`;

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("🔥 EXPORT ERROR:", message);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}

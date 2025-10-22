import { getProductsFeed } from "@/features/products/api"
import { ProductItem } from "@/types/products"
import { google } from "googleapis"
import { NextResponse } from "next/server"

// Bạn nên lưu nội dung JSON credentials trong biến môi trường
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!)

const SHEET_ID = process.env.GOOGLE_SHEET_ID!

export async function GET() {
  try {
    // 1️⃣ Xác thực với Google
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const products = await getProductsFeed() // bạn sẽ viết hàm này

    // 3️⃣ Lọc sản phẩm đang active và có tồn kho
    const activeProducts = products.filter(
      (p: ProductItem) => p.is_active === true && p.stock > 0
    )

   const values = activeProducts.map(p => {
    const productUrl = p.url_key
      ? `https://www.prestige-home.de/de/product/${p.url_key}`
      : ""

    const imageUrl = Array.isArray(p.static_files) && p.static_files.length > 0
      ? p.static_files[0].url
      : ""

      // Tính toán shipping dựa vào carrier
  let shipping = "DE:::35.95 EUR" // default
  if (p.carrier?.toLowerCase() === "dpd") {
    shipping = "DE:::5.95 EUR"
  }

    return [
      p.id_provider ?? "",
      p.name ?? "",
      p.description ?? "",
      p.stock > 0 ? "in_stock" : "out_of_stock",
      productUrl,
      imageUrl,
      p.final_price ?? 0,
      p.ean ? "yes" : "no",
      p.ean ?? "",
      p.brand?.name ?? "",
      shipping
    ]
  })


    // 4️⃣ Ghi vào Google Sheet (ví dụ từ A2)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2",
      valueInputOption: "RAW",
      requestBody: { values },
    })

    return NextResponse.json({ success: true, count: values.length, data: values  })
  } catch (error) {
    console.error("Sync error:", error)
    const message =
      error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// /pages/api/internal/export-images.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getProductsFeed } from "@/features/products/api"; // adjust path nếu khác
import { ProductItem } from "@/types/products";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // OPTIONAL: protect internal API bằng key
    const apiKey = process.env.API_TRIGGER_KEY;
    const provided = req.headers["x-api-key"] || req.query.key;

    if (!apiKey || provided !== apiKey) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    // Fetch danh sách sản phẩm (hàm bạn đã có)
    const products: ProductItem[] = await getProductsFeed();

    if (!products || !Array.isArray(products)) {
      return res
        .status(500)
        .json({ ok: false, message: "Invalid product data" });
    }

    // Map dữ liệu theo format cronjob cần
    const exportData = products.map((p) => ({
      id_provider: p.id_provider || "",
      name: p.name || "No Name",
      static_files: (p.static_files || []).map((f) => ({
        url: f.url,
      })),
    }));

    return res.status(200).json(exportData);
  } catch (err) {
    console.error("Error in /api/internal/export-images:", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}

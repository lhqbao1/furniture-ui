import { NextResponse } from "next/server";

export async function GET() {
  // Header CSV bạn gửi
  const headers = [
    "email",
    "reference",
    "firstName",
    "lastName",
    "transactionDate",
    "productName",
    "productSku",
    "productUrl",
    "productImageUrl",
    "productBrand",
    "productGtin",
    "productMpn",
  ];

  // Dummy data - bạn thay thế bằng dữ liệu thật
  const rows = [
    {
      email: "silviadach35@gmail.com",
      reference: "#120126-0043",
      firstName: "Uwe",
      lastName: "Dach",
      transactionDate: "12.01.2026, 18:39",
      productName:
        "GreenYard WPC Sichtschutzzaun CORTEZA 8x Zaunelement + 9x Pfosten - 14,2m",
      productSku: "1000401",
      productUrl:
        "https://www.prestige-home.de/de/product/greenyard-wpc-sichtschutzzaun-corteza-8x-zaunelement-9x-pfosten-14-2m-1000401",
      productImageUrl:
        "https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/image_1_1.jpg?",
      productBrand: "Green Yard",
      productGtin: "4262557811058",
    },

    {
      email: "silviadach35@gmail.com",
      reference: "#120126-0043",
      firstName: "Uwe",
      lastName: "Dach",
      transactionDate: "12.01.2026, 18:39",
      productName:
        "GreenYard WPC Sichtschutzzaun CORTEZA 5x Zaunelement + 6x Pfosten - 8,9m",
      productSku: "1000327",
      productUrl:
        "https://www.prestige-home.de/de/product/greenyard-wpc-sichtschutzzaun-corteza-5x-zaunelement-6x-pfosten-8-9m-1000327",
      productImageUrl:
        "https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/image_1_3.jpg?",
      productBrand: "Green Yard",
      productGtin: "4262557810334",
    },
  ];

  // Build CSV content
  const csvRows = [
    headers.join(";"),
    ...rows.map((r) =>
      headers.map((h) => r[h as keyof typeof r] ?? "").join(";"),
    ),
  ];

  const csvContent = csvRows.join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="trustedshop-export.csv"',
    },
  });
}

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
      email: "pmo.duylinh.nguyen@gmail.com",
      reference: "#100126-0005",
      firstName: "Nguyen",
      lastName: "Linh",
      transactionDate: "10.01.2026, 18:39",
      productName:
        "Klappbarer Liegestuhl Adirondack aus Akazie, ca. 84 x 69 x 93 cm - Braun",
      productSku: "1000041",
      productUrl:
        "https://www.prestige-home.de/de/product/klappbarer-liegestuhl-adirondack-aus-akazie-ca-84-x-69-x-93-cm-braun-1000041",
      productImageUrl:
        "https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/Gemini_Generated_Image_nybg1tnybg1tnybg_1.jpg?",
      productBrand: "Prestige Home Living Outdoor",
      productGtin: "4059306119301",
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

import { NextResponse } from "next/server";

export async function GET() {
  const headers = [
    "email",
    "reference",
    "firstName",
    "lastName",
    "transactionDate",
  ];

  // Dummy data (replace bằng data thật sau)
  const rows = [
    {
      email: "silviadach35@gmail.com",
      reference: "#120126-0043",
      firstName: "Uwe",
      lastName: "Dach",
      transactionDate: "12.01.2026, 18:39",
    },
  ];

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
      "Content-Disposition": 'attachment; filename="trustedshop-invite.csv"',
    },
  });
}

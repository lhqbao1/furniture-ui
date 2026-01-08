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
      email: "p.ohlmeier@gmx.de",
      reference: "#070126-0012",
      firstName: "Paul",
      lastName: "Ohlmeier",
      transactionDate: "07.01.2026, 20:01",
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

// app/api/invoice/[id]/pdf/route.tsx
export const runtime = "nodejs";

import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/layout/pdf/file";
import { getInvoiceByCheckOut } from "@/features/invoice/api";
import {
  getCheckOutByCheckOutId,
  getMainCheckOutByMainCheckOutId,
} from "@/features/checkout/api";
import { RouteInvoicePDF } from "@/components/layout/pdf/route-invoice";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // ✅ BẮT BUỘC
    const invoice = await getInvoiceByCheckOut(id);
    console.log(id);
    console.log(invoice);
    if (!invoice) {
      return new Response("Invoice not found", { status: 404 });
    }

    const stream = await pdf(<RouteInvoicePDF invoice={invoice} />).toBuffer(); // ← trả ReadableStream

    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        // 👇 CÁI NÀY QUYẾT ĐỊNH DOWNLOAD
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoice_code}.pdf"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}

export const runtime = "nodejs";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pdf } from "@react-pdf/renderer";
import { AGBStaticPDF } from "@/components/layout/pdf/agb-static-pdf";
import React from "react";

export async function GET() {
  try {
    const htmlPath = join(process.cwd(), "src/app/api/agb/agb-content.html");
    const html = await readFile(htmlPath, "utf-8");

    const stream = await pdf(
      React.createElement(AGBStaticPDF, { html }),
    ).toBuffer();

    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const datePart = `${mm}-${dd}-${yy}`;
    const fileName = `PresitgeHomeAGB-${datePart}.pdf`;

    return new Response(stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to generate AGB PDF", error);
    return new Response("Failed to generate AGB PDF", { status: 500 });
  }
}

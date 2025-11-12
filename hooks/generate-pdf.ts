import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateAgbPdf(parsedChildren: any[], policyName: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;

  let y = height - 50;
  page.drawText(policyName, {
    x: 50,
    y,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 40;

  for (const section of parsedChildren) {
    // Label (tiêu đề nhỏ)
    page.drawText(section.label || "", {
      x: 50,
      y,
      size: 14,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 20;

    // Nội dung
    const text = section.content || "";
    const wrapped = wrapText(text, 80);
    for (const line of wrapped) {
      page.drawText(line, { x: 60, y, size: fontSize, font });
      y -= 16;
      if (y < 50) {
        // tạo trang mới nếu hết trang
        const newPage = pdfDoc.addPage([595, 842]);
        y = 800;
      }
    }

    y -= 20;
  }

const pdfBytes = await pdfDoc.save();

const arrayBuffer = pdfBytes.buffer.slice(
  pdfBytes.byteOffset,
  pdfBytes.byteOffset + pdfBytes.byteLength
) as ArrayBuffer;

const blob = new Blob([arrayBuffer], { type: "application/pdf" });

const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = `${policyName.replace(/\s+/g, "_")}.pdf`;
a.click();
URL.revokeObjectURL(url);

}

function wrapText(text: string, maxLength: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

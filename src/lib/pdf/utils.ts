import jsPDF from "jspdf";
import { COMPANY, COLORS } from "./constants";

export function createDoc(): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFont("helvetica");
  return doc;
}

/**
 * Dark header band with brand + tagline + contact block.
 * Returns the Y position to start content.
 */
export function addHeader(doc: jsPDF, title: string): number {
  const W = doc.internal.pageSize.getWidth();

  // Dark header band
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, W, 32, "F");

  // Bright green accent line at very top
  doc.setFillColor(...COLORS.green);
  doc.rect(0, 0, W, 3, "F");

  // Brand name — white
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("NORTHPEAK DIGITAL", 20, 19);

  // Tagline — brand green
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.green);
  doc.text("Marketing Digital  ·  Inteligencia Artificial  ·  Automatización", 20, 26);

  // Contact block — right-aligned, muted
  doc.setFontSize(7);
  doc.setTextColor(160, 165, 175);
  doc.text(COMPANY.email, W - 18, 17, { align: "right" });
  doc.text(COMPANY.whatsapp, W - 18, 23, { align: "right" });
  doc.text(COMPANY.web, W - 18, 29, { align: "right" });

  // Document title
  const titleY = 44;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(title.toUpperCase(), 20, titleY);

  // Green underline accent
  doc.setFillColor(...COLORS.tableHeader);
  doc.rect(20, titleY + 3, 55, 1.5, "F");

  return titleY + 14; // Y for first content element
}

/**
 * Footer with contact info + page counter + green bottom strip.
 */
export function addFooter(doc: jsPDF): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).getNumberOfPages() as number;
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFillColor(248, 249, 250);
    doc.rect(0, H - 14, W, 14, "F");

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(20, H - 14, W - 20, H - 14);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textMuted);
    doc.text(
      `${COMPANY.brand}  ·  ${COMPANY.email}  ·  ${COMPANY.whatsapp}  ·  ${COMPANY.web}`,
      20,
      H - 7
    );
    doc.text(`Página ${i} / ${pageCount}`, W - 18, H - 7, { align: "right" });

    // Brand green strip at very bottom
    doc.setFillColor(...COLORS.tableHeader);
    doc.rect(0, H - 1.5, W, 1.5, "F");
  }
}

/**
 * Section heading with green left accent bar.
 * Returns Y for the first line of content below.
 */
export function addSection(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...COLORS.tableHeader);
  doc.rect(20, y - 3.5, 3, 9, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text(title, 26, y + 1.5);

  return y + 10;
}

/**
 * Body paragraph. Returns Y after the block.
 */
export function addParagraph(doc: jsPDF, text: string, y: number, maxWidth = 170): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, 20, y);
  return y + lines.length * 5;
}

/**
 * Horizontal divider. Returns Y after divider.
 */
export function addDivider(doc: jsPDF, y: number): number {
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(20, y, doc.internal.pageSize.getWidth() - 20, y);
  return y + 5;
}

/**
 * Colored info box with title + content lines.
 * color: "green" | "amber" | "gray"
 */
export function addInfoBox(
  doc: jsPDF,
  title: string,
  lines: string[],
  y: number,
  color: "green" | "amber" | "gray" = "gray"
): number {
  const W = doc.internal.pageSize.getWidth();
  const boxW = W - 40;
  const boxH = 10 + lines.length * 5.5;

  const fillRGB: [number, number, number] =
    color === "green" ? [240, 253, 244] :
    color === "amber" ? [255, 251, 235] :
    [245, 247, 250];

  const accentRGB: [number, number, number] =
    color === "green" ? [5, 150, 105] :
    color === "amber" ? [217, 119, 6] :
    [100, 100, 110];

  doc.setFillColor(...fillRGB);
  doc.setDrawColor(...fillRGB);
  doc.roundedRect(20, y, boxW, boxH, 2, 2, "FD");

  doc.setFillColor(...accentRGB);
  doc.rect(20, y, 3, boxH, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentRGB);
  doc.text(title.toUpperCase(), 27, y + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  lines.forEach((line, i) => {
    doc.text(line, 27, y + 12 + i * 5.5);
  });

  return y + boxH + 4;
}

export function checkPageBreak(doc: jsPDF, y: number, needed = 30): number {
  if (y > doc.internal.pageSize.getHeight() - needed) {
    doc.addPage();
    return 22;
  }
  return y;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`;
}

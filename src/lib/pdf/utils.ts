import jsPDF from "jspdf";
import { COMPANY, COLORS } from "./constants";

export function createDoc(): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFont("helvetica");
  return doc;
}

export function addHeader(doc: jsPDF, title: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Green accent line
  doc.setFillColor(...COLORS.tableHeader);
  doc.rect(0, 0, pageWidth, 3, "F");

  // Brand name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text("NORTHPEAK DIGITAL", 20, 18);

  // Subtitle line
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("Marketing Digital · Automatización · Inteligencia Artificial", 20, 24);

  // Document title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text(title.toUpperCase(), 20, 36);

  // Separator
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(20, 39, pageWidth - 20, 39);

  return 45; // Y position after header
}

export function addFooter(doc: jsPDF) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).getNumberOfPages() as number;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Separator line
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(20, pageHeight - 18, pageWidth - 20, pageHeight - 18);

    // Footer text
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textMuted);
    doc.text(
      `${COMPANY.email}  |  ${COMPANY.whatsapp}  |  ${COMPANY.web}`,
      20,
      pageHeight - 12
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - 20,
      pageHeight - 12,
      { align: "right" }
    );
  }
}

export function addSection(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text(title, 20, y);
  return y + 6;
}

export function addParagraph(doc: jsPDF, text: string, y: number, maxWidth = 170): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, 20, y);
  return y + lines.length * 4.5;
}

export function checkPageBreak(doc: jsPDF, y: number, needed = 30): number {
  if (y > doc.internal.pageSize.getHeight() - needed) {
    doc.addPage();
    return 20;
  }
  return y;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`;
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY, COLORS, type ClientFormData } from "./constants";
import {
  createDoc,
  addHeader,
  addFooter,
  checkPageBreak,
  formatDate,
  formatCurrency,
} from "./utils";

export function generateQuotePDF(data: ClientFormData, quoteNumber: string): jsPDF {
  const doc = createDoc();
  let y = addHeader(doc, "Cotización");
  const W = doc.internal.pageSize.getWidth();

  // ── Número, fecha y vigencia ──────────────────────────────────
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + data.config.quoteValidDays);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text(`No. ${quoteNumber}`, W - 20, y - 6, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(8);
  doc.text(`Fecha: ${formatDate(new Date().toISOString().split("T")[0])}`, W - 20, y, { align: "right" });
  doc.text(
    `Vigencia: ${formatDate(validUntil.toISOString().split("T")[0])}`,
    W - 20,
    y + 5.5,
    { align: "right" }
  );

  // ── Emisor / Cliente (dos columnas) ───────────────────────────
  const colW = (W - 45) / 2;
  const boxH = 28;

  // Caja izquierda — Emisor
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, y, colW, boxH, 2, 2, "F");
  doc.setFillColor(...COLORS.tableHeader);
  doc.rect(20, y, 3, boxH, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text("EMISOR", 27, y + 7);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(COMPANY.brand, 27, y + 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text(COMPANY.name, 27, y + 20);
  doc.text(COMPANY.email, 27, y + 25.5);

  // Caja derecha — Cliente
  const rightX = 25 + colW;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(rightX, y, colW, boxH, 2, 2, "F");
  doc.setFillColor(...COLORS.tableHeader);
  doc.rect(rightX, y, 3, boxH, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text("CLIENTE", rightX + 7, y + 7);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(data.name, rightX + 7, y + 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  if (data.businessName) doc.text(data.businessName, rightX + 7, y + 20);
  if (data.email) doc.text(data.email, rightX + 7, y + 25.5);

  y += boxH + 10;

  // ── Tabla de servicios ────────────────────────────────────────
  const setupPrice = data.config.pilotPrice;
  const iva = setupPrice * (data.config.ivaPercent / 100);
  const total = setupPrice + iva;

  autoTable(doc, {
    startY: y,
    head: [["#", "Concepto", "Descripción", "Precio Unit.", "Total"]],
    body: [
      [
        "1",
        "Piloto de Validación",
        `Landing page + Meta Ads + Agente IA WhatsApp + CRM + Reporte de resultados (${data.config.pilotDays} días)`,
        formatCurrency(setupPrice),
        formatCurrency(setupPrice),
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.white,
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 8.5, textColor: COLORS.text, cellPadding: 3 },
    alternateRowStyles: { fillColor: COLORS.tableRowAlt },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 40, fontStyle: "bold" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 32, halign: "right" },
    },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  y = checkPageBreak(doc, y, 45);

  // ── Totales ───────────────────────────────────────────────────
  const totalsX = W - 20;
  const labelX = totalsX - 65;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  doc.text("Subtotal:", labelX, y);
  doc.text(formatCurrency(setupPrice), totalsX, y, { align: "right" });
  y += 6;

  doc.text(`IVA (${data.config.ivaPercent}%):`, labelX, y);
  doc.text(formatCurrency(iva), totalsX, y, { align: "right" });
  y += 6;

  doc.setDrawColor(...COLORS.tableHeader);
  doc.setLineWidth(0.5);
  doc.line(labelX, y - 2, totalsX, y - 2);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text("TOTAL:", labelX, y + 4);
  doc.text(formatCurrency(total), totalsX, y + 4, { align: "right" });

  y += 16;
  y = checkPageBreak(doc, y, 40);

  // ── Datos bancarios ───────────────────────────────────────────
  const bboxW = W - 40;
  const bboxH = 26;
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, y, bboxW, bboxH, 2, 2, "FD");
  doc.setFillColor(...COLORS.tableHeader);
  doc.rect(20, y, 3, bboxH, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text("DATOS BANCARIOS PARA TRANSFERENCIA", 27, y + 7);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text("Banco:       [Por confirmar con tu ejecutivo]", 27, y + 14);
  doc.text("CLABE:       [Por confirmar con tu ejecutivo]", 27, y + 20);
  doc.text(`Beneficiario:  ${COMPANY.name}`, 27, y + 26);

  y += bboxH + 10;
  y = checkPageBreak(doc, y, 30);

  // ── Notas ─────────────────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);

  const notes = [
    `Esta cotización tiene una vigencia de ${data.config.quoteValidDays} días naturales a partir de la fecha de emisión.`,
    `El presupuesto publicitario de Meta Ads (${formatCurrency(data.config.adBudgetMin)} – ${formatCurrency(data.config.adBudgetMax)}) no está incluido y se paga directamente a Meta.`,
    "El pago deberá realizarse previo al inicio de los servicios.",
    "Esta cotización no es una factura fiscal. La factura se emite al confirmar el pago.",
  ];

  notes.forEach((note) => {
    doc.text(`•  ${note}`, 20, y);
    y += 5;
  });

  addFooter(doc);
  return doc;
}

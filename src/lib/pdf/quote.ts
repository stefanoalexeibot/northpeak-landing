import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY, COLORS, type ClientFormData } from "./constants";
import { createDoc, addHeader, addFooter, formatDate, formatCurrency, checkPageBreak } from "./utils";

export function generateQuotePDF(data: ClientFormData, quoteNumber: string): jsPDF {
  const doc = createDoc();
  let y = addHeader(doc, "Cotizacion");

  const pageWidth = doc.internal.pageSize.getWidth();

  // Quote number & date
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text(`No. ${quoteNumber}`, pageWidth - 20, y - 4, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(8);
  doc.text(`Fecha: ${formatDate(new Date().toISOString().split("T")[0])}`, pageWidth - 20, y + 1, { align: "right" });

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + data.config.quoteValidDays);
  doc.text(`Vigencia: ${formatDate(validUntil.toISOString().split("T")[0])}`, pageWidth - 20, y + 6, { align: "right" });

  y += 4;

  // Two-column info boxes
  const colW = 80;

  doc.setFillColor(...COLORS.tableRowAlt);
  doc.roundedRect(20, y, colW, 30, 2, 2, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("EMISOR", 24, y + 5);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(COMPANY.brand, 24, y + 11);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY.name, 24, y + 16);
  doc.text(COMPANY.email, 24, y + 21);
  doc.text(COMPANY.whatsapp, 24, y + 26);

  const rightX = pageWidth - 20 - colW;
  doc.setFillColor(...COLORS.tableRowAlt);
  doc.roundedRect(rightX, y, colW, 30, 2, 2, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("CLIENTE", rightX + 4, y + 5);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(data.name, rightX + 4, y + 11);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  if (data.businessName) doc.text(data.businessName, rightX + 4, y + 16);
  doc.text(data.email, rightX + 4, y + 21);
  doc.text(data.phone, rightX + 4, y + 26);

  y += 38;

  // Items table
  const setupPrice = data.config.pilotPrice;
  const iva = setupPrice * (data.config.ivaPercent / 100);
  const total = setupPrice + iva;

  autoTable(doc, {
    startY: y,
    head: [["#", "Concepto", "Descripcion", "Precio Unit.", "Total"]],
    body: [
      [
        "1",
        "Piloto de Validacion",
        `Landing page + Meta Ads + Agente IA WhatsApp + CRM + Reporte (${data.config.pilotDays} dias)`,
        formatCurrency(setupPrice),
        formatCurrency(setupPrice),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: COLORS.tableHeader, textColor: COLORS.white, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: COLORS.text },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 35 },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // Totals
  const totalsX = pageWidth - 20;
  const labelX = totalsX - 65;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  doc.text("Subtotal:", labelX, y, { align: "left" });
  doc.text(formatCurrency(setupPrice), totalsX, y, { align: "right" });
  y += 6;

  doc.text(`IVA (${data.config.ivaPercent}%):`, labelX, y, { align: "left" });
  doc.text(formatCurrency(iva), totalsX, y, { align: "right" });
  y += 6;

  doc.setDrawColor(...COLORS.tableHeader);
  doc.setLineWidth(0.5);
  doc.line(labelX, y - 2, totalsX, y - 2);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text("TOTAL:", labelX, y + 3, { align: "left" });
  doc.text(formatCurrency(total), totalsX, y + 3, { align: "right" });

  y += 16;
  y = checkPageBreak(doc, y, 40);

  // Bank details
  doc.setFillColor(...COLORS.tableRowAlt);
  doc.roundedRect(20, y, 170, 24, 2, 2, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("DATOS BANCARIOS PARA TRANSFERENCIA", 24, y + 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text("Banco: [Por confirmar]", 24, y + 11);
  doc.text("CLABE: [Por confirmar]", 24, y + 16);
  doc.text(`Beneficiario: ${COMPANY.name}`, 24, y + 21);

  y += 32;

  // Notes
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("Notas:", 20, y);
  y += 4;
  doc.text(`- Esta cotizacion tiene una vigencia de ${data.config.quoteValidDays} dias naturales a partir de la fecha de emision.`, 24, y);
  y += 4;
  doc.text(`- El presupuesto publicitario de Meta Ads (${formatCurrency(data.config.adBudgetMin)} - ${formatCurrency(data.config.adBudgetMax)}) no esta incluido en esta cotizacion.`, 24, y);
  y += 4;
  doc.text("- El pago debera realizarse previo al inicio de los servicios.", 24, y);

  addFooter(doc);
  return doc;
}

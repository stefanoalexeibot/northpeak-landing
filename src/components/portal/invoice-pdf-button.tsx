"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem {
  concept: string;
  amount: number;
}

interface Props {
  title: string;
  clientName: string;
  company?: string;
  items: InvoiceItem[];
  discount: number;
  notes?: string;
}

function formatMXN(n: number) {
  return "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2 });
}

export default function InvoicePdfButton({ title, clientName, company, items, discount, notes }: Props) {
  function generate() {
    const doc = new jsPDF();
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    const total = subtotal - discount;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 229, 160);
    doc.text("NorthPeak Digital", 14, 22);

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 14, 34);

    // Client info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Cliente: ${clientName}`, 14, 46);
    if (company) doc.text(`Empresa: ${company}`, 14, 52);

    const tableStartY = company ? 60 : 54;

    // Items table
    autoTable(doc, {
      startY: tableStartY,
      head: [["Concepto", "Monto"]],
      body: items.map((i) => [i.concept, formatMXN(i.amount)]),
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [0, 229, 160], textColor: [5, 6, 10], fontStyle: "bold" },
      columnStyles: { 1: { halign: "right" } },
      theme: "grid",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable?.finalY ?? tableStartY + 40;

    // Totals
    const totalsY = finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Subtotal:", 130, totalsY);
    doc.text(formatMXN(subtotal), 196, totalsY, { align: "right" });

    if (discount > 0) {
      doc.setTextColor(0, 180, 130);
      doc.text("Descuento:", 130, totalsY + 7);
      doc.text(`-${formatMXN(discount)}`, 196, totalsY + 7, { align: "right" });
    }

    const totalLineY = discount > 0 ? totalsY + 16 : totalsY + 8;
    doc.setDrawColor(0, 229, 160);
    doc.line(130, totalLineY - 2, 196, totalLineY - 2);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Total:", 130, totalLineY + 4);
    doc.setTextColor(0, 180, 130);
    doc.text(formatMXN(total), 196, totalLineY + 4, { align: "right" });

    // Notes
    if (notes) {
      const notesY = totalLineY + 18;
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Notas:", 14, notesY);
      doc.setTextColor(80, 80, 80);
      const splitNotes = doc.splitTextToSize(notes, 170);
      doc.text(splitNotes, 14, notesY + 6);
    }

    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  }

  return (
    <Button
      onClick={generate}
      variant="outline"
      className="border-northpeak-surface text-northpeak-text hover:bg-northpeak-surface"
    >
      <Download className="h-4 w-4 mr-2" />
      Descargar PDF
    </Button>
  );
}

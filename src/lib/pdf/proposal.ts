import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY, COLORS, type ClientFormData } from "./constants";
import { createDoc, addHeader, addFooter, addSection, addParagraph, checkPageBreak, formatCurrency } from "./utils";

export function generateProposalPDF(data: ClientFormData): jsPDF {
  const doc = createDoc();
  let y = addHeader(doc, "Propuesta Comercial - Piloto de Validacion");

  // Client info
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Preparado para: ${data.name} - ${data.businessName}`, 20, y);
  y += 8;

  // The Problem
  y = addSection(doc, "El Problema", y);
  y = addParagraph(
    doc,
    `Hoy en dia, muchos negocios locales como ${data.businessName} dependen del boca a boca o de redes sociales organicas para atraer clientes. Sin un sistema automatizado de atraccion y seguimiento, se pierden oportunidades todos los dias: personas que buscan exactamente lo que tu ofreces en ${data.zone || "tu zona"}, pero nunca te encuentran.`,
    y
  );
  y += 2;
  y = addParagraph(
    doc,
    "Sin una landing page optimizada, sin publicidad segmentada y sin un sistema de seguimiento, es como tener un negocio increible escondido en una calle sin salida.",
    y
  );

  y += 6;

  // The Solution
  y = addSection(doc, "La Solucion: Piloto de Validacion NorthPeak", y);
  y = addParagraph(
    doc,
    `Nuestro Piloto de Validacion es un programa de ${data.config.pilotDays} dias disenado para negocios de tipo "${data.businessType}" donde implementamos un sistema completo de atraccion de clientes usando tecnologia de punta: publicidad digital segmentada, inteligencia artificial y automatizacion.`,
    y
  );
  y += 2;
  y = addParagraph(
    doc,
    "El objetivo es simple: validar que esta estrategia funciona para tu negocio, con una inversion minima y en tiempo record.",
    y
  );

  y += 6;

  // What's included
  y = addSection(doc, "Que Incluye?", y);

  autoTable(doc, {
    startY: y + 1,
    head: [["Componente", "Descripcion", "Valor"]],
    body: [
      ["Landing Page", "Pagina web profesional optimizada para conversion con tu marca", "Incluido"],
      ["Meta Ads", "Campana de Facebook e Instagram con segmentacion local en " + (data.zone || "tu zona"), "Incluido"],
      ["Agente IA WhatsApp", "Bot inteligente que responde, califica y agenda prospectos 24/7", "Incluido"],
      ["CRM Basico", "Panel para ver y dar seguimiento a cada prospecto en tiempo real", "Incluido"],
      ["Reporte Final", "Analisis completo de metricas, resultados y recomendaciones", "Incluido"],
    ],
    theme: "grid",
    headStyles: { fillColor: COLORS.tableHeader, textColor: COLORS.white, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: COLORS.text },
    alternateRowStyles: { fillColor: COLORS.tableRowAlt },
    margin: { left: 20, right: 20 },
    columnStyles: { 2: { cellWidth: 25, halign: "center" } },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  y = checkPageBreak(doc, y);

  // Investment
  y = addSection(doc, "Inversion", y);

  const boxY = y;
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(20, boxY - 2, 170, 28, 3, 3, "F");
  doc.setDrawColor(...COLORS.tableHeader);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, boxY - 2, 170, 28, 3, 3, "S");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text(`Setup del Piloto: ${formatCurrency(data.config.pilotPrice)}`, 30, boxY + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text(`+ Presupuesto publicitario Meta Ads: ${formatCurrency(data.config.adBudgetMin)} - ${formatCurrency(data.config.adBudgetMax)} (se paga directo a Meta)`, 30, boxY + 16);
  doc.text("Pago unico. Sin mensualidades. Sin compromisos a largo plazo.", 30, boxY + 22);

  y = boxY + 34;

  // Why NorthPeak
  y = checkPageBreak(doc, y, 40);
  y = addSection(doc, "Por Que NorthPeak?", y);

  const reasons = [
    `Resultados en ${data.config.pilotDays} dias, no en meses`,
    "Tecnologia de IA aplicada a tu negocio local",
    "Sin contratos largos - prueba primero, decide despues",
    "Atencion personalizada directa con el fundador",
    "Enfocados 100% en negocios locales en Mexico",
  ];

  reasons.forEach((r) => {
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    doc.text(`>  ${r}`, 24, y);
    y += 5.5;
  });

  y += 6;
  y = checkPageBreak(doc, y, 30);

  // CTA
  y = addSection(doc, "Listo para empezar?", y);
  y = addParagraph(doc, "Agenda una llamada o escribenos por WhatsApp:", y);
  y += 2;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text(`WhatsApp: ${COMPANY.whatsapp}`, 24, y);
  y += 5;
  doc.text(`Email: ${COMPANY.email}`, 24, y);

  addFooter(doc);
  return doc;
}

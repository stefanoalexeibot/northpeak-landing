import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY, COLORS, type ClientFormData } from "./constants";
import {
  createDoc,
  addHeader,
  addFooter,
  addSection,
  addParagraph,
  checkPageBreak,
  formatCurrency,
} from "./utils";

export function generateProposalPDF(data: ClientFormData): jsPDF {
  const doc = createDoc();
  let y = addHeader(doc, "Propuesta Comercial");
  const W = doc.internal.pageSize.getWidth();

  // ── "Preparado para" ─────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("Preparado exclusivamente para:", 20, y);
  y += 6;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  const nameLabel = data.businessName
    ? `${data.name}  —  ${data.businessName}`
    : data.name;
  doc.text(nameLabel, 20, y);
  y += 10;

  // ── El reto ───────────────────────────────────────────────────
  y = addSection(doc, "El reto de crecer en digital", y);

  y = addParagraph(
    doc,
    `Hoy en día, muchos negocios como ${data.businessName || "el tuyo"} dependen del boca a boca o de publicaciones orgánicas para atraer nuevos clientes. Sin un sistema automatizado de captación y seguimiento, se escapan oportunidades todos los días: personas que buscan exactamente lo que ofreces en ${data.zone || "tu zona"}, pero que nunca llegan a ti.`,
    y
  );
  y += 3;
  y = addParagraph(
    doc,
    `Sin una página optimizada, sin publicidad segmentada y sin un proceso de calificación automático, cada prospecto que no te responde a tiempo es un cliente que se va a la competencia. La pregunta no es si necesitas un sistema digital — es cuándo arrancar.`,
    y
  );
  y += 7;

  // ── Nuestra propuesta ─────────────────────────────────────────
  y = addSection(doc, `Nuestra propuesta: Piloto de Validación (${data.config.pilotDays} días)`, y);

  y = addParagraph(
    doc,
    `El Piloto de Validación es un programa intensivo diseñado para negocios del sector "${data.businessType}" en el que implementamos un sistema completo de atracción de clientes: landing page profesional, publicidad digital segmentada, inteligencia artificial y automatización.`,
    y
  );
  y += 3;
  y = addParagraph(
    doc,
    `La lógica es simple: antes de comprometerse a una estrategia de largo plazo, valida que funciona para TU negocio específico — con una inversión mínima, en tiempo récord, con datos reales.`,
    y
  );
  y += 7;

  // ── Qué incluye ───────────────────────────────────────────────
  y = addSection(doc, "¿Qué incluye?", y);

  autoTable(doc, {
    startY: y,
    head: [["Componente", "Descripción", ""]],
    body: [
      [
        "Landing Page",
        `Página web profesional optimizada para conversión, con tu identidad de marca y oferta principal. Diseñada para capturar prospectos en ${data.zone || "tu zona"}.`,
        "✓",
      ],
      [
        "Meta Ads",
        `Campaña de publicidad en Facebook e Instagram con segmentación geográfica y demográfica precisa. Gestionada y optimizada durante todo el piloto.`,
        "✓",
      ],
      [
        "Agente IA WhatsApp",
        "Asistente inteligente que responde preguntas frecuentes, califica prospectos según sus necesidades y agenda citas automáticamente — las 24 horas, sin intervención humana.",
        "✓",
      ],
      [
        "CRM de Seguimiento",
        "Panel en tiempo real para ver y gestionar cada prospecto generado. Nunca pierdas de vista una oportunidad de venta.",
        "✓",
      ],
      [
        "Reporte Final",
        "Análisis completo al cierre del piloto: métricas clave, costo por prospecto, tasa de conversión y recomendaciones concretas para escalar.",
        "✓",
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
      0: { cellWidth: 42, fontStyle: "bold" },
      2: { cellWidth: 10, halign: "center", textColor: [5, 150, 105] as [number, number, number] },
    },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  y = checkPageBreak(doc, y, 55);

  // ── Inversión ─────────────────────────────────────────────────
  y = addSection(doc, "Inversión", y);

  // Caja de precio — green border + light fill
  const boxW = W - 40;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(...COLORS.tableHeader);
  doc.setLineWidth(0.8);
  doc.roundedRect(20, y, boxW, 34, 3, 3, "FD");

  // Barra izquierda
  doc.setFillColor(...COLORS.tableHeader);
  doc.rect(20, y, 4, 34, "F");

  // Precio principal
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text(`Setup del Piloto: ${formatCurrency(data.config.pilotPrice)}`, 30, y + 11);

  // Presupuesto ads
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text(
    `+ Presupuesto Meta Ads: ${formatCurrency(data.config.adBudgetMin)} a ${formatCurrency(data.config.adBudgetMax)}`,
    30,
    y + 20
  );
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text("(El presupuesto publicitario se paga directamente a Meta, no a NorthPeak)", 30, y + 26);

  // Badge inferior
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text("Pago único  ·  Sin mensualidades  ·  Sin contratos a largo plazo", 30, y + 32);

  y += 42;
  y = checkPageBreak(doc, y, 55);

  // ── Por qué NorthPeak ─────────────────────────────────────────
  y = addSection(doc, "¿Por qué NorthPeak?", y);

  const reasons: [string, string][] = [
    [`Resultados en ${data.config.pilotDays} días,`, "no en meses ni trimestres de espera"],
    ["IA aplicada a tu negocio local,", "tecnología de punta sin complicaciones técnicas"],
    ["Sin contratos a largo plazo,", "prueba el piloto y decide con información real en la mano"],
    ["Atención directa con el fundador,", "sin intermediarios, sin ejecutivos de cuenta genéricos"],
    ["100% enfocados en negocios locales en México,", "entendemos tu mercado y tu cliente"],
  ];

  reasons.forEach(([bold, rest]) => {
    y = checkPageBreak(doc, y, 10);

    // Bullet circle
    doc.setFillColor(...COLORS.tableHeader);
    doc.circle(24, y - 1.2, 1.5, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.text);
    doc.text(bold, 30, y);

    const boldW = doc.getTextWidth(bold);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textMuted);
    // Si la línea es muy larga, ponemos el resto en la siguiente línea
    if (30 + boldW + doc.getTextWidth(` ${rest}`) < W - 20) {
      doc.text(` ${rest}`, 30 + boldW, y);
    } else {
      const restLines = doc.splitTextToSize(rest, W - 38);
      doc.text(restLines, 30, y + 5);
      y += restLines.length * 5;
    }
    y += 6.5;
  });

  y += 4;
  y = checkPageBreak(doc, y, 35);

  // ── CTA ───────────────────────────────────────────────────────
  y = addSection(doc, "¿Listo para arrancar?", y);

  y = addParagraph(
    doc,
    "Los pilotos se agendan por orden de llegada y los cupos son limitados. Escríbenos hoy para confirmar tu lugar y acordar la fecha de inicio.",
    y
  );
  y += 6;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text(`WhatsApp: ${COMPANY.whatsapp}`, 24, y);
  y += 7;
  doc.text(`Email: ${COMPANY.email}`, 24, y);

  addFooter(doc);
  return doc;
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY, COLORS, type ClientFormData } from "./constants";
import { createDoc, addHeader, addFooter, addSection, addParagraph, checkPageBreak } from "./utils";

export function generateWelcomePDF(data: ClientFormData): jsPDF {
  const doc = createDoc();
  let y = addHeader(doc, "Documento de Bienvenida - Piloto de Validacion");

  // Greeting
  y = addParagraph(doc, `Estimado/a ${data.name},`, y + 2);
  y = addParagraph(
    doc,
    `Bienvenido/a a NorthPeak Digital! Estamos emocionados de comenzar a trabajar contigo y con ${data.businessName}. A continuacion encontraras toda la informacion necesaria para nuestro Piloto de Validacion.`,
    y + 1
  );

  // What's included
  y = addSection(doc, "Que incluye el Piloto de Validacion?", y + 4);

  autoTable(doc, {
    startY: y + 1,
    head: [["#", "Componente", "Descripcion"]],
    body: [
      ["1", "Landing Page", "Pagina web optimizada para conversion con tu marca y oferta"],
      ["2", "Meta Ads", "Campana de publicidad en Facebook e Instagram con segmentacion local"],
      ["3", "Agente IA WhatsApp", "Asistente inteligente que responde y agenda automaticamente"],
      ["4", "CRM Basico", "Sistema para dar seguimiento a cada prospecto generado"],
      ["5", "Reporte Final", "Analisis de resultados con metricas y recomendaciones"],
    ],
    theme: "grid",
    headStyles: { fillColor: COLORS.tableHeader, textColor: COLORS.white, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: COLORS.text },
    alternateRowStyles: { fillColor: COLORS.tableRowAlt },
    margin: { left: 20, right: 20 },
    columnStyles: { 0: { cellWidth: 10, halign: "center" }, 1: { cellWidth: 35 } },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  y = checkPageBreak(doc, y);

  // Timeline
  y = addSection(doc, `Timeline - Dia por Dia (${data.config.pilotDays} dias)`, y);

  const startDate = new Date(data.startDate + "T12:00:00");
  const timeline: string[][] = [];
  const activities = [
    "Kickoff: recibimos materiales, configuramos cuentas",
    "Diseno de landing page + configuracion de CRM",
    "Configuracion del Agente IA en WhatsApp",
    "Creacion de campanas en Meta Ads",
    "Revision conjunta y aprobacion de materiales",
    "Lanzamiento de campana - En vivo!",
    "Monitoreo y optimizacion de resultados",
    "Cierre de piloto + entrega de reporte final",
  ];

  for (let i = 0; i < Math.min(data.config.pilotDays + 1, activities.length); i++) {
    timeline.push([`Dia ${i}`, getDayStr(startDate, i), activities[i]]);
  }

  autoTable(doc, {
    startY: y + 1,
    head: [["Dia", "Fecha", "Actividad"]],
    body: timeline,
    theme: "grid",
    headStyles: { fillColor: COLORS.tableHeader, textColor: COLORS.white, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: COLORS.text },
    alternateRowStyles: { fillColor: COLORS.tableRowAlt },
    margin: { left: 20, right: 20 },
    columnStyles: { 0: { cellWidth: 15, halign: "center" }, 1: { cellWidth: 35 } },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  y = checkPageBreak(doc, y);

  // Checklist
  y = addSection(doc, "Lo que necesitamos de tu parte", y);

  const checklist = [
    "Logo de tu negocio en alta resolucion (PNG o SVG)",
    "5-10 fotos de tu negocio, productos o servicios",
    "Numero de WhatsApp Business para el agente IA",
    "Horarios de atencion al publico",
    "Lista de servicios principales con precios",
    "Acceso como colaborador a tu cuenta de Meta Business (Facebook/Instagram)",
  ];

  checklist.forEach((item) => {
    y = checkPageBreak(doc, y, 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(`[ ]  ${item}`, 24, y);
    y += 5.5;
  });

  y += 4;
  y = checkPageBreak(doc, y);

  // Contact
  y = addSection(doc, "Datos de Contacto", y);
  y = addParagraph(doc, `${COMPANY.name}`, y);
  y = addParagraph(doc, `WhatsApp: ${COMPANY.whatsapp}`, y);
  y = addParagraph(doc, `Email: ${COMPANY.email}`, y);
  y = addParagraph(doc, `Web: ${COMPANY.web}`, y);

  addFooter(doc);
  return doc;
}

function getDayStr(start: Date, daysToAdd: number): string {
  const d = new Date(start);
  d.setDate(d.getDate() + daysToAdd);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

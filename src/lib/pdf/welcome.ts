import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY, COLORS, type ClientFormData } from "./constants";
import {
  createDoc,
  addHeader,
  addFooter,
  addSection,
  addInfoBox,
  checkPageBreak,
} from "./utils";

export function generateWelcomePDF(data: ClientFormData): jsPDF {
  const doc = createDoc();
  let y = addHeader(doc, "Documento de Bienvenida");

  // ── Saludo personal ──────────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(`Hola, ${data.name}!`, 20, y);
  y += 7;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  const greeting = doc.splitTextToSize(
    `Estamos muy emocionados de comenzar a trabajar con ${data.businessName}. Este documento es tu guía de arranque — encontrarás todo lo que necesitas saber para que los próximos ${data.config.pilotDays} días sean un éxito.`,
    170
  );
  doc.text(greeting, 20, y);
  y += greeting.length * 5 + 7;

  // ── Acceso al portal ─────────────────────────────────────────
  y = addInfoBox(
    doc,
    "Tu acceso al Portal de Clientes NorthPeak",
    [
      `Dirección:  ${process.env.NEXT_PUBLIC_APP_URL || "northpeak.mx"}/portal`,
      `Email:      ${data.email}`,
      `Contraseña: La que te enviamos por WhatsApp al registrarte`,
    ],
    y,
    "green"
  );
  y += 2;

  // ── Qué incluye ──────────────────────────────────────────────
  y = checkPageBreak(doc, y, 60);
  y = addSection(doc, "¿Qué incluye tu Piloto de Validación?", y);

  autoTable(doc, {
    startY: y,
    head: [["#", "Componente", "Lo que hace por tu negocio"]],
    body: [
      [
        "1",
        "Landing Page",
        "Página web profesional y optimizada para convertir visitas en prospectos, con tu imagen de marca y oferta principal.",
      ],
      [
        "2",
        "Meta Ads",
        `Campaña de publicidad en Facebook e Instagram con segmentación geográfica en ${data.zone || "tu zona"}, orientada a tu cliente ideal.`,
      ],
      [
        "3",
        "Agente IA WhatsApp",
        "Bot inteligente que responde preguntas frecuentes, califica prospectos y agenda citas automáticamente, las 24 horas.",
      ],
      [
        "4",
        "CRM de Seguimiento",
        "Panel en tiempo real para ver y gestionar cada prospecto generado durante el piloto.",
      ],
      [
        "5",
        "Reporte Final",
        "Análisis detallado con métricas clave, resultados obtenidos y recomendaciones concretas para el siguiente paso.",
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
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 38, fontStyle: "bold" },
    },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  y = checkPageBreak(doc, y, 55);

  // ── Timeline ─────────────────────────────────────────────────
  y = addSection(doc, `Plan de trabajo — ${data.config.pilotDays} días`, y);

  const startDate = new Date(data.startDate + "T12:00:00");
  const activities: string[] = [
    "Kickoff: recibimos materiales, configuramos cuentas y accesos",
    "Diseño y desarrollo de la landing page + estructura del CRM",
    "Configuración del Agente de IA en WhatsApp",
    "Creación y configuración de campañas en Meta Ads",
    "Revisión conjunta, aprobación de materiales y ajustes finales",
    "¡Lanzamiento! — Campaña en vivo, primeros prospectos",
    "Monitoreo, optimización y ajustes basados en datos reales",
    "Cierre del piloto + entrega del reporte final de resultados",
  ];

  const days = Math.min(data.config.pilotDays, activities.length);
  const timelineBody: string[][] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const dayLabel = i === 0 ? "Día 1" : i === days - 1 ? `Día ${days}` : `Día ${i + 1}`;
    timelineBody.push([dayLabel, dateStr, activities[i]]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Día", "Fecha", "Actividad"]],
    body: timelineBody,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.white,
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 8.5, textColor: COLORS.text, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: COLORS.tableRowAlt },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 18, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 32 },
    },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  y = checkPageBreak(doc, y, 65);

  // ── Checklist ────────────────────────────────────────────────
  y = addSection(doc, "Lo que necesitamos de tu parte", y);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text(
    "Para arrancar lo antes posible, envíanos lo siguiente por WhatsApp o email:",
    20,
    y
  );
  y += 8;

  const checklist = [
    "Logo de tu negocio en alta resolución (PNG o SVG con fondo transparente)",
    "5 a 10 fotos de tu negocio, productos o servicios (buena calidad)",
    "Número de WhatsApp Business para configurar el Agente de IA",
    "Horarios de atención al público",
    "Lista de servicios o productos principales con precios (o rangos)",
    "Acceso como colaborador a tu cuenta de Meta Business (Facebook / Instagram)",
  ];

  checklist.forEach((item) => {
    y = checkPageBreak(doc, y, 10);
    // Green checkbox
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(0.5);
    doc.setFillColor(240, 253, 244);
    doc.rect(22, y - 3.2, 4, 4, "FD");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(item, 30, y);
    y += 6.5;
  });

  y += 4;
  y = checkPageBreak(doc, y, 35);

  // ── Contacto ─────────────────────────────────────────────────
  y = addSection(doc, "¿Tienes dudas? Contáctanos directamente", y);

  y = addInfoBox(
    doc,
    "Datos de contacto",
    [
      `${COMPANY.name}  —  Fundador, NorthPeak Digital`,
      `WhatsApp: ${COMPANY.whatsapp}`,
      `Email:    ${COMPANY.email}`,
      `Web:      ${COMPANY.web}`,
    ],
    y,
    "gray"
  );

  addFooter(doc);
  return doc;
}

import jsPDF from "jspdf";
import { COMPANY, COLORS, type ClientFormData } from "./constants";
import {
  createDoc,
  addHeader,
  addFooter,
  addDivider,
  checkPageBreak,
  formatDate,
  formatCurrency,
} from "./utils";

export function generateContractPDF(data: ClientFormData): jsPDF {
  const doc = createDoc();
  let y = addHeader(doc, "Contrato de Servicios");
  const W = doc.internal.pageSize.getWidth();

  const endDate = new Date(data.startDate + "T12:00:00");
  endDate.setDate(endDate.getDate() + data.config.pilotDays);
  const priceText = formatCurrency(data.config.pilotPrice);
  const contractNo = `NP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

  // ── Número y fecha ────────────────────────────────────────────
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Contrato No.: ${contractNo}`, 20, y);
  doc.text(`Fecha de emisión: ${formatDate(data.startDate)}`, W - 20, y, { align: "right" });
  y += 10;

  // ── Partes del contrato (dos columnas) ────────────────────────
  const colW = (W - 45) / 2;
  const boxH = 30;

  // Caja izquierda — Prestador
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, y, colW, boxH, 2, 2, "F");
  doc.setFillColor(...COLORS.tableHeader);
  doc.rect(20, y, 3, boxH, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeader);
  doc.text("EL PRESTADOR", 27, y + 7);

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
  doc.text("EL CLIENTE", rightX + 7, y + 7);

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

  // ── Declaraciones ─────────────────────────────────────────────
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  const introLines = doc.splitTextToSize(
    `Contrato de Prestación de Servicios Profesionales que celebran: por una parte, ${COMPANY.name}, actuando bajo la marca comercial "${COMPANY.brand}" (en adelante "EL PRESTADOR"); y por la otra, ${data.name}${data.businessName ? `, representante de "${data.businessName}"` : ""} (en adelante "EL CLIENTE"); de conformidad con las siguientes cláusulas:`,
    170
  );
  doc.text(introLines, 20, y);
  y += introLines.length * 5 + 8;

  // ── Cláusulas ─────────────────────────────────────────────────
  const clauses: { title: string; text: string }[] = [
    {
      title: "PRIMERA — Objeto del Contrato",
      text: `EL PRESTADOR se compromete a brindar a EL CLIENTE el servicio denominado "Piloto de Validación", que comprende: (a) diseño y publicación de una landing page optimizada para conversión; (b) configuración y gestión de campañas publicitarias en Meta Ads (Facebook e Instagram); (c) implementación de un agente de inteligencia artificial en WhatsApp; (d) configuración de un CRM básico para el seguimiento de prospectos; y (e) entrega de un reporte final de resultados al término del piloto.`,
    },
    {
      title: "SEGUNDA — Vigencia",
      text: `El presente contrato tendrá una vigencia de ${data.config.pilotDays} (${numberToWords(data.config.pilotDays)}) días naturales, con inicio el ${formatDate(data.startDate)} y conclusión el ${formatDate(endDate.toISOString().split("T")[0])}.`,
    },
    {
      title: "TERCERA — Contraprestación",
      text: `EL CLIENTE pagará a EL PRESTADOR la cantidad de ${priceText} (pago único) como contraprestación por los servicios descritos en la Cláusula Primera. Dicho pago deberá efectuarse previo al inicio de los servicios. El presupuesto publicitario de Meta Ads (${formatCurrency(data.config.adBudgetMin)} – ${formatCurrency(data.config.adBudgetMax)}) es adicional y se paga directamente a Meta Platforms.`,
    },
    {
      title: "CUARTA — Obligaciones del Prestador",
      text: `EL PRESTADOR se obliga a: (a) diseñar y publicar la landing page en un plazo no mayor a 3 días hábiles contados desde la recepción de materiales completos; (b) configurar y lanzar las campañas de Meta Ads; (c) implementar el agente de IA en WhatsApp; (d) habilitar el CRM para seguimiento de prospectos; (e) entregar el reporte de resultados al finalizar el piloto; y (f) mantener comunicación constante con EL CLIENTE durante toda la vigencia del contrato.`,
    },
    {
      title: "QUINTA — Obligaciones del Cliente",
      text: `EL CLIENTE se obliga a: (a) entregar oportunamente los materiales requeridos (logotipo en alta resolución, fotografías, información de servicios y acceso a cuentas de Meta Business); (b) efectuar el pago en los términos convenidos; (c) responder las solicitudes de información en un plazo máximo de 24 horas; y (d) no interferir en la configuración técnica de las herramientas implementadas por EL PRESTADOR.`,
    },
    {
      title: "SEXTA — Resultados",
      text: `Las partes reconocen que el Piloto de Validación es un servicio de marketing digital y que EL PRESTADOR no garantiza un número mínimo de prospectos, ventas o conversiones, ya que los resultados dependen de factores externos incluyendo el comportamiento del mercado, la competencia y el comportamiento del consumidor final.`,
    },
    {
      title: "SÉPTIMA — Confidencialidad",
      text: `Ambas partes se obligan a guardar estricta confidencialidad sobre toda la información comercial, técnica y financiera que se intercambie con motivo de este contrato. Esta obligación permanecerá vigente por dos (2) años contados a partir de la fecha de terminación del mismo.`,
    },
    {
      title: "OCTAVA — Propiedad Intelectual",
      text: `Los diseños, contenidos y configuraciones desarrollados por EL PRESTADOR durante el Piloto de Validación serán propiedad de EL CLIENTE una vez realizado el pago total. La metodología, procesos propietarios y herramientas desarrolladas por EL PRESTADOR permanecerán como su propiedad intelectual exclusiva.`,
    },
    {
      title: "NOVENA — Terminación Anticipada",
      text: `Cualquiera de las partes podrá dar por terminado este contrato notificando a la otra parte por escrito con al menos 48 horas de anticipación. En caso de terminación anticipada por parte de EL CLIENTE, no procederá devolución de la contraprestación pagada. Si la terminación es por parte de EL PRESTADOR por causas imputables a él, se reembolsará la parte proporcional correspondiente a los servicios no prestados.`,
    },
    {
      title: "DÉCIMA — Jurisdicción y Ley Aplicable",
      text: `Para la interpretación y cumplimiento del presente contrato, las partes se someten expresamente a la jurisdicción de los tribunales competentes de la ciudad de ${COMPANY.city}, México, renunciando a cualquier otro fuero que pudiera corresponderles en razón de sus domicilios presentes o futuros.`,
    },
  ];

  for (const clause of clauses) {
    y = checkPageBreak(doc, y, 30);

    // Título de cláusula con barra verde izquierda
    doc.setFillColor(...COLORS.tableHeader);
    doc.rect(20, y - 3, 2.5, 8, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.text);
    doc.text(clause.title, 26, y + 1);
    y += 8;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const lines = doc.splitTextToSize(clause.text, 166);
    doc.text(lines, 24, y);
    y += lines.length * 4.8 + 7;
  }

  // ── Firmas ────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 70);
  y += 6;

  y = addDivider(doc, y);
  y += 4;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  const signText = doc.splitTextToSize(
    `Leído el presente contrato y enteradas las partes de su contenido y alcance legal, lo suscriben en la ciudad de ${COMPANY.city}, a ${formatDate(data.startDate)}.`,
    170
  );
  doc.text(signText, 20, y);
  y += signText.length * 5 + 18;

  const halfW = W / 2;

  // Firma izquierda
  doc.setDrawColor(180, 180, 190);
  doc.setLineWidth(0.5);
  doc.line(20, y, halfW - 15, y);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text("EL PRESTADOR", 20, y + 7);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text(COMPANY.name, 20, y + 13);
  doc.text(COMPANY.brand, 20, y + 18.5);

  // Firma derecha
  doc.line(halfW + 15, y, W - 20, y);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text("EL CLIENTE", halfW + 15, y + 7);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text(data.name, halfW + 15, y + 13);
  if (data.businessName) doc.text(data.businessName, halfW + 15, y + 18.5);

  addFooter(doc);
  return doc;
}

function numberToWords(n: number): string {
  const words: Record<number, string> = {
    1: "un", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco",
    6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
    14: "catorce", 15: "quince", 21: "veintiún", 30: "treinta",
  };
  return words[n] || String(n);
}

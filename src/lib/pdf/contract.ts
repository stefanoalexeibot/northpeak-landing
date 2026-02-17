import jsPDF from "jspdf";
import { COMPANY, COLORS, type ClientFormData } from "./constants";
import { createDoc, addHeader, addFooter, addSection, addParagraph, checkPageBreak, formatDate, formatCurrency } from "./utils";

export function generateContractPDF(data: ClientFormData): jsPDF {
  const doc = createDoc();
  let y = addHeader(doc, "Contrato de Prestacion de Servicios");

  const endDate = new Date(data.startDate + "T12:00:00");
  endDate.setDate(endDate.getDate() + data.config.pilotDays);
  const priceText = formatCurrency(data.config.pilotPrice);

  // Intro
  y = addParagraph(
    doc,
    `Contrato de Prestacion de Servicios Profesionales que celebran, por una parte, ${COMPANY.name}, actuando bajo la marca comercial "${COMPANY.brand}" (en adelante "EL PRESTADOR"), y por la otra, ${data.name}${data.businessName ? `, representante de "${data.businessName}"` : ""} (en adelante "EL CLIENTE"), al tenor de las siguientes:`,
    y + 2
  );

  y += 4;

  const clauses = [
    {
      title: "PRIMERA - Objeto del Contrato",
      text: `EL PRESTADOR se compromete a brindar a EL CLIENTE un servicio denominado "Piloto de Validacion", el cual incluye: diseno y desarrollo de una landing page, configuracion y gestion de campanas publicitarias en Meta (Facebook e Instagram), implementacion de un agente de inteligencia artificial en WhatsApp, configuracion de un CRM basico para seguimiento de prospectos, y entrega de un reporte final de resultados.`,
    },
    {
      title: "SEGUNDA - Vigencia",
      text: `El presente contrato tendra una vigencia de ${data.config.pilotDays} (${numberToWords(data.config.pilotDays)}) dias naturales, comenzando el ${formatDate(data.startDate)} y finalizando el ${formatDate(endDate.toISOString().split("T")[0])}.`,
    },
    {
      title: "TERCERA - Contraprestacion",
      text: `EL CLIENTE se compromete a pagar a EL PRESTADOR la cantidad de ${priceText} como pago unico por los servicios descritos en la Clausula Primera. El pago debera realizarse previo al inicio de los servicios.`,
    },
    {
      title: "CUARTA - Presupuesto Publicitario",
      text: `Las partes acuerdan que el presupuesto destinado a la pauta publicitaria en Meta Ads es independiente de la contraprestacion senalada en la Clausula Tercera. EL CLIENTE debera disponer de un presupuesto minimo de ${formatCurrency(data.config.adBudgetMin)} a ${formatCurrency(data.config.adBudgetMax)} para la ejecucion de las campanas publicitarias. Dicho monto sera pagado directamente a Meta por EL CLIENTE.`,
    },
    {
      title: "QUINTA - Obligaciones del Prestador",
      text: `EL PRESTADOR se obliga a: a) Disenar y publicar la landing page en un plazo no mayor a 3 dias habiles; b) Configurar y lanzar la campana de Meta Ads; c) Implementar el agente de IA en WhatsApp; d) Configurar el CRM para seguimiento; e) Entregar un reporte de resultados al finalizar el piloto; f) Mantener comunicacion constante con EL CLIENTE durante la vigencia.`,
    },
    {
      title: "SEXTA - Obligaciones del Cliente",
      text: `EL CLIENTE se obliga a: a) Proporcionar oportunamente los materiales necesarios (logo, fotografias, informacion de servicios, acceso a cuentas de Meta Business); b) Realizar el pago en los terminos acordados; c) Responder a las solicitudes de informacion en un plazo no mayor a 24 horas; d) No interferir con la configuracion tecnica de las herramientas implementadas.`,
    },
    {
      title: "SEPTIMA - Resultados",
      text: `Las partes reconocen que el Piloto de Validacion es un servicio de marketing digital cuyo objetivo es validar la viabilidad de una estrategia de atraccion de clientes. EL PRESTADOR no garantiza un numero minimo de prospectos, ventas o conversiones, ya que los resultados dependen de multiples factores externos incluyendo el mercado, la competencia y el comportamiento del consumidor.`,
    },
    {
      title: "OCTAVA - Confidencialidad",
      text: `Ambas partes se comprometen a mantener estricta confidencialidad sobre la informacion comercial, tecnica y financiera que se intercambie con motivo del presente contrato. Esta obligacion permanecera vigente incluso despues de la terminacion del mismo.`,
    },
    {
      title: "NOVENA - Propiedad Intelectual",
      text: `Los disenos, configuraciones y contenido creativo desarrollados por EL PRESTADOR durante el Piloto de Validacion seran propiedad de EL CLIENTE una vez realizado el pago total. La metodologia, herramientas y procesos utilizados permaneceran como propiedad intelectual de EL PRESTADOR.`,
    },
    {
      title: "DECIMA - Terminacion Anticipada",
      text: `Cualquiera de las partes podra dar por terminado el presente contrato de manera anticipada, notificando a la otra parte por escrito con al menos 48 horas de anticipacion. En caso de terminacion anticipada por parte de EL CLIENTE, no habra devolucion de la contraprestacion pagada. En caso de terminacion por parte de EL PRESTADOR, se reembolsara la parte proporcional correspondiente a los servicios no prestados.`,
    },
    {
      title: "DECIMA PRIMERA - Jurisdiccion",
      text: `Para la interpretacion y cumplimiento del presente contrato, las partes se someten a la jurisdiccion de los tribunales competentes de la ciudad de ${COMPANY.city}, Mexico, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.`,
    },
  ];

  for (const clause of clauses) {
    y = checkPageBreak(doc, y, 25);
    y = addSection(doc, clause.title, y);
    y = addParagraph(doc, clause.text, y);
    y += 3;
  }

  // Signature section
  y = checkPageBreak(doc, y, 60);
  y += 10;

  y = addParagraph(
    doc,
    `Leido que fue el presente contrato y enteradas las partes de su contenido y alcance, lo firman en la ciudad de ${COMPANY.city}, a ${formatDate(data.startDate)}.`,
    y
  );

  y += 15;

  const midX = doc.internal.pageSize.getWidth() / 2;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);

  doc.line(20, y, midX - 15, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text("EL PRESTADOR", 20, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(COMPANY.name, 20, y + 10);
  doc.text(COMPANY.brand, 20, y + 14);

  doc.line(midX + 15, y, doc.internal.pageSize.getWidth() - 20, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("EL CLIENTE", midX + 15, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(data.name, midX + 15, y + 10);
  if (data.businessName) {
    doc.text(data.businessName, midX + 15, y + 14);
  }

  addFooter(doc);
  return doc;
}

function numberToWords(n: number): string {
  const words: Record<number, string> = {
    1: "un", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco",
    6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
    14: "catorce", 15: "quince", 30: "treinta",
  };
  return words[n] || String(n);
}

import type { Oportunidad } from "./scoring";

export interface Pregunta {
  id: string;
  texto: string;
  tipo: "si_no" | "rango" | "opcion" | "numero";
  opciones?: string[];
  rango?: { min: number; max: number; step: number; labels?: Record<number, string> };
  dependeDe?: { preguntaId: string; valor: unknown };
  categoria: "base" | "giro" | "condicional";
}

export interface RespuestasCuestionario {
  facturacion: string;
  inversion_marketing: string;
  objetivo_principal: string;
  plazo_resultados: string;
  tiene_equipo_marketing: boolean;
  [key: string]: unknown;
}

const PREGUNTAS_BASE: Pregunta[] = [
  {
    id: "facturacion",
    texto: "¿Cuánto factura tu negocio al mes aproximadamente?",
    tipo: "opcion",
    opciones: [
      "Menos de $50,000",
      "$50,000 - $150,000",
      "$150,000 - $500,000",
      "$500,000 - $1,000,000",
      "Más de $1,000,000",
    ],
    categoria: "base",
  },
  {
    id: "inversion_marketing",
    texto: "¿Cuánto inviertes actualmente en marketing al mes?",
    tipo: "opcion",
    opciones: ["$0 - No invierto", "Menos de $3,000", "$3,000 - $10,000", "$10,000 - $30,000", "Más de $30,000"],
    categoria: "base",
  },
  {
    id: "objetivo_principal",
    texto: "¿Cuál es tu objetivo principal en este momento?",
    tipo: "opcion",
    opciones: [
      "Conseguir más clientes nuevos",
      "Aumentar ventas por cliente existente",
      "Lanzar nuevo local o sucursal",
      "Posicionamiento de marca",
    ],
    categoria: "base",
  },
  {
    id: "plazo_resultados",
    texto: "¿En cuánto tiempo necesitas ver resultados?",
    tipo: "opcion",
    opciones: ["Urgente (1-2 meses)", "Mediano plazo (3-6 meses)", "Largo plazo (6+ meses)"],
    categoria: "base",
  },
  {
    id: "tiene_equipo_marketing",
    texto: "¿Tienes equipo de marketing o una persona encargada?",
    tipo: "si_no",
    categoria: "base",
  },
];

const PREGUNTAS_POR_GIRO: Record<string, Pregunta[]> = {
  Restaurante: [
    { id: "ticket_promedio", texto: "¿Cuál es tu ticket promedio por comensal?", tipo: "opcion", opciones: ["Menos de $150", "$150 - $300", "$300 - $500", "Más de $500"], categoria: "giro" },
    { id: "tiene_delivery", texto: "¿Ofreces servicio a domicilio?", tipo: "si_no", categoria: "giro" },
    { id: "plataformas_delivery", texto: "¿En qué plataformas de delivery estás?", tipo: "opcion", opciones: ["Ninguna", "Uber Eats", "Rappi", "DiDi Food", "Varias"], categoria: "giro", dependeDe: { preguntaId: "tiene_delivery", valor: true } },
    { id: "capacidad_local", texto: "¿Cuántas personas puede recibir tu local?", tipo: "opcion", opciones: ["Menos de 30", "30 - 60", "60 - 100", "Más de 100"], categoria: "giro" },
  ],
  Cafetería: [
    { id: "ticket_promedio", texto: "¿Cuál es tu ticket promedio por visita?", tipo: "opcion", opciones: ["Menos de $80", "$80 - $150", "$150 - $250", "Más de $250"], categoria: "giro" },
    { id: "tiene_delivery", texto: "¿Ofreces servicio a domicilio?", tipo: "si_no", categoria: "giro" },
    { id: "vende_productos", texto: "¿Vendes productos empacados (granos, merch)?", tipo: "si_no", categoria: "giro" },
  ],
  "Salón de Belleza": [
    { id: "num_sillas", texto: "¿Cuántas estaciones/sillas de trabajo tienen?", tipo: "opcion", opciones: ["1-3", "4-6", "7-10", "Más de 10"], categoria: "giro" },
    { id: "tiene_agenda_digital", texto: "¿Usas agenda digital para citas?", tipo: "si_no", categoria: "giro" },
    { id: "vende_productos", texto: "¿Vendes productos de belleza en tu local?", tipo: "si_no", categoria: "giro" },
    { id: "servicios_premium", texto: "¿Ofreces servicios premium (keratinas, extensiones, etc.)?", tipo: "si_no", categoria: "giro" },
  ],
  "Salón de Uñas": [
    { id: "num_sillas", texto: "¿Cuántas estaciones de trabajo tienen?", tipo: "opcion", opciones: ["1-3", "4-6", "7-10", "Más de 10"], categoria: "giro" },
    { id: "tiene_agenda_digital", texto: "¿Usas agenda digital para citas?", tipo: "si_no", categoria: "giro" },
    { id: "vende_productos", texto: "¿Vendes productos de uñas en tu local?", tipo: "si_no", categoria: "giro" },
  ],
  Barbería: [
    { id: "num_sillas", texto: "¿Cuántas sillas de barbero tienen?", tipo: "opcion", opciones: ["1-2", "3-4", "5-6", "Más de 6"], categoria: "giro" },
    { id: "tiene_agenda_digital", texto: "¿Usas app o agenda digital para citas?", tipo: "si_no", categoria: "giro" },
    { id: "vende_productos", texto: "¿Vendes productos de grooming (cera, aceites)?", tipo: "si_no", categoria: "giro" },
  ],
  "Consultorio Médico": [
    { id: "especialidad", texto: "¿Cuál es tu especialidad médica?", tipo: "opcion", opciones: ["Medicina general", "Dermatología", "Nutrición", "Psicología", "Pediatría", "Otra especialidad"], categoria: "giro" },
    { id: "pacientes_mes", texto: "¿Cuántos pacientes atiendes al mes?", tipo: "opcion", opciones: ["Menos de 50", "50 - 100", "100 - 200", "Más de 200"], categoria: "giro" },
    { id: "acepta_seguros", texto: "¿Aceptas seguros de gastos médicos?", tipo: "si_no", categoria: "giro" },
  ],
  "Consultorio Dental": [
    { id: "pacientes_mes", texto: "¿Cuántos pacientes atiendes al mes?", tipo: "opcion", opciones: ["Menos de 50", "50 - 100", "100 - 200", "Más de 200"], categoria: "giro" },
    { id: "servicios_esteticos", texto: "¿Ofreces servicios estéticos (blanqueamiento, carillas)?", tipo: "si_no", categoria: "giro" },
    { id: "acepta_seguros", texto: "¿Aceptas seguros de gastos médicos?", tipo: "si_no", categoria: "giro" },
  ],
  "Tienda de Ropa": [
    { id: "venta_online", texto: "¿Vendes por internet actualmente?", tipo: "si_no", categoria: "giro" },
    { id: "inventario_aprox", texto: "¿Cuántos productos manejas aproximadamente?", tipo: "opcion", opciones: ["Menos de 50", "50 - 200", "200 - 500", "Más de 500"], categoria: "giro" },
    { id: "temporalidad", texto: "¿Tu negocio tiene temporalidad marcada?", tipo: "si_no", categoria: "giro" },
  ],
  "Tienda en línea": [
    { id: "plataforma_actual", texto: "¿En qué plataforma vendes?", tipo: "opcion", opciones: ["No tengo tienda propia", "Shopify", "WooCommerce", "Mercado Libre", "Otra"], categoria: "giro" },
    { id: "productos_aprox", texto: "¿Cuántos productos manejas?", tipo: "opcion", opciones: ["Menos de 20", "20 - 100", "100 - 500", "Más de 500"], categoria: "giro" },
    { id: "envios_mes", texto: "¿Cuántos envíos haces al mes?", tipo: "opcion", opciones: ["Menos de 20", "20 - 100", "100 - 500", "Más de 500"], categoria: "giro" },
  ],
  "Gimnasio / Fitness": [
    { id: "membresias_activas", texto: "¿Cuántas membresías activas tienes?", tipo: "opcion", opciones: ["Menos de 50", "50 - 150", "150 - 300", "Más de 300"], categoria: "giro" },
    { id: "clases_grupales", texto: "¿Ofreces clases grupales?", tipo: "si_no", categoria: "giro" },
    { id: "tiene_app", texto: "¿Tienes app o sistema de reservas para clases?", tipo: "si_no", categoria: "giro" },
  ],
  "Spa / Wellness": [
    { id: "num_cabinas", texto: "¿Cuántas cabinas o áreas de servicio tienes?", tipo: "opcion", opciones: ["1-2", "3-5", "6-8", "Más de 8"], categoria: "giro" },
    { id: "tiene_agenda_digital", texto: "¿Usas agenda digital para citas?", tipo: "si_no", categoria: "giro" },
    { id: "vende_productos", texto: "¿Vendes productos de cuidado personal?", tipo: "si_no", categoria: "giro" },
  ],
  Veterinaria: [
    { id: "pacientes_mes", texto: "¿Cuántos pacientes atiendes al mes?", tipo: "opcion", opciones: ["Menos de 50", "50 - 100", "100 - 200", "Más de 200"], categoria: "giro" },
    { id: "vende_productos", texto: "¿Vendes productos para mascotas?", tipo: "si_no", categoria: "giro" },
    { id: "tiene_estetica", texto: "¿Ofreces servicio de estética canina?", tipo: "si_no", categoria: "giro" },
  ],
  "Panadería / Repostería": [
    { id: "tiene_delivery", texto: "¿Ofreces servicio a domicilio?", tipo: "si_no", categoria: "giro" },
    { id: "pedidos_personalizados", texto: "¿Aceptas pedidos personalizados (pasteles, eventos)?", tipo: "si_no", categoria: "giro" },
    { id: "vende_mayoreo", texto: "¿Vendes al mayoreo a otros negocios?", tipo: "si_no", categoria: "giro" },
  ],
  "Escuela / Academia": [
    { id: "alumnos_activos", texto: "¿Cuántos alumnos activos tienes?", tipo: "opcion", opciones: ["Menos de 30", "30 - 100", "100 - 300", "Más de 300"], categoria: "giro" },
    { id: "clases_online", texto: "¿Ofreces clases en línea?", tipo: "si_no", categoria: "giro" },
    { id: "tipo_cursos", texto: "¿Qué tipo de cursos ofreces?", tipo: "opcion", opciones: ["Idiomas", "Música / Arte", "Deportes", "Académico", "Otro"], categoria: "giro" },
  ],
};

function generarPreguntasCondicionales(oportunidades: Oportunidad[]): Pregunta[] {
  const preguntas: Pregunta[] = [];
  const canales = new Set(oportunidades.map((o) => o.canal));

  if (canales.has("Sitio Web") || oportunidades.some((o) => o.titulo.toLowerCase().includes("no tienes sitio"))) {
    preguntas.push(
      { id: "necesita_agendar", texto: "¿Necesitas que tus clientes puedan agendar citas en línea?", tipo: "si_no", categoria: "condicional" },
      { id: "necesita_tienda", texto: "¿Vendes productos que te gustaría ofrecer en línea?", tipo: "si_no", categoria: "condicional" }
    );
  }

  if (canales.has("Instagram") || oportunidades.some((o) => o.titulo.toLowerCase().includes("instagram"))) {
    preguntas.push(
      { id: "tiene_fotos_trabajo", texto: "¿Tienes fotos o videos de tu trabajo / productos?", tipo: "si_no", categoria: "condicional" },
      { id: "quien_maneja_redes", texto: "¿Quién manejaría las redes sociales?", tipo: "opcion", opciones: ["Yo mismo(a)", "Un empleado", "Nadie — necesito ayuda completa"], categoria: "condicional" }
    );
  }

  if (canales.has("Publicidad") || oportunidades.some((o) => o.titulo.toLowerCase().includes("publicidad"))) {
    preguntas.push(
      { id: "experiencia_ads", texto: "¿Has invertido en publicidad digital antes?", tipo: "si_no", categoria: "condicional" },
      { id: "presupuesto_ads", texto: "¿Cuánto estarías dispuesto(a) a invertir en publicidad al mes?", tipo: "opcion", opciones: ["$0 - No por ahora", "$1,000 - $3,000", "$3,000 - $8,000", "$8,000 - $15,000", "Más de $15,000"], categoria: "condicional" }
    );
  }

  return preguntas;
}

export function generarPreguntas(giro: string, oportunidades: Oportunidad[]): Pregunta[] {
  const preguntas: Pregunta[] = [...PREGUNTAS_BASE];

  // Add giro-specific questions
  const giroPreguntas = PREGUNTAS_POR_GIRO[giro];
  if (giroPreguntas) {
    preguntas.push(...giroPreguntas);
  }

  // Add conditional questions based on opportunities
  preguntas.push(...generarPreguntasCondicionales(oportunidades));

  return preguntas;
}

export function filtrarPreguntasVisibles(
  preguntas: Pregunta[],
  respuestas: Record<string, unknown>
): Pregunta[] {
  return preguntas.filter((p) => {
    if (!p.dependeDe) return true;
    return respuestas[p.dependeDe.preguntaId] === p.dependeDe.valor;
  });
}

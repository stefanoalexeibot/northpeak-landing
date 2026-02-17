import type { Oportunidad } from "./scoring";

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  tipo: "mensual" | "unico";
  canal: string;
  tags: string[];
}

export interface Paquete {
  id: string;
  nombre: string;
  descripcion: string;
  servicios: string[];
  precioMensual: number;
  descuento: number;
  popular?: boolean;
}

export interface Cotizacion {
  serviciosRecomendados: (Servicio & { precioFinal: number })[];
  paqueteRecomendado: Paquete | null;
  paquetes: Paquete[];
  totalIndividual: number;
  totalMensualIndividual: number;
  totalUnicoIndividual: number;
  ahorroConPaquete: number;
}

export const SERVICIOS: Servicio[] = [
  {
    id: "gm-optimizacion",
    nombre: "Optimización de Google Maps",
    descripcion: "Perfil verificado, fotos profesionales, horarios, categorías y SEO local",
    precioBase: 1500,
    tipo: "mensual",
    canal: "Google Maps",
    tags: ["google_maps", "perfil", "fotos", "horarios"],
  },
  {
    id: "gm-resenas",
    nombre: "Gestión de Reseñas",
    descripcion: "Sistema automático de solicitud de reseñas + respuesta a todas las reseñas",
    precioBase: 1000,
    tipo: "mensual",
    canal: "Google Maps",
    tags: ["google_maps", "resenas"],
  },
  {
    id: "ig-manejo",
    nombre: "Manejo de Instagram",
    descripcion: "Estrategia de contenido, 12 posts/mes, stories, highlights y gestión de comunidad",
    precioBase: 3500,
    tipo: "mensual",
    canal: "Instagram",
    tags: ["instagram", "contenido", "cuenta"],
  },
  {
    id: "ig-reels",
    nombre: "Producción de Reels",
    descripcion: "8 Reels/mes con edición profesional, tendencias y estrategia de alcance",
    precioBase: 2500,
    tipo: "mensual",
    canal: "Instagram",
    tags: ["instagram", "reels"],
  },
  {
    id: "fb-pagina",
    nombre: "Configuración de Facebook",
    descripcion: "Creación/optimización de página, catálogo, info completa y vinculación con Instagram",
    precioBase: 1000,
    tipo: "unico",
    canal: "Facebook",
    tags: ["facebook", "pagina"],
  },
  {
    id: "fb-chatbot",
    nombre: "Chatbot de Messenger",
    descripcion: "Agente de IA para respuesta automática en Messenger 24/7",
    precioBase: 1500,
    tipo: "mensual",
    canal: "Facebook",
    tags: ["facebook", "messenger", "respuesta"],
  },
  {
    id: "web-desarrollo",
    nombre: "Desarrollo de Sitio Web",
    descripcion: "Sitio web profesional, responsive, con WhatsApp, SEO básico y SSL",
    precioBase: 8000,
    tipo: "unico",
    canal: "Sitio Web",
    tags: ["sitio_web", "desarrollo"],
  },
  {
    id: "web-mantenimiento",
    nombre: "Mantenimiento Web",
    descripcion: "Actualizaciones, hosting, SSL, backups y soporte técnico mensual",
    precioBase: 1500,
    tipo: "mensual",
    canal: "Sitio Web",
    tags: ["sitio_web", "mantenimiento"],
  },
  {
    id: "seo-basico",
    nombre: "Posicionamiento SEO",
    descripcion: "SEO on-page, keywords locales, Google Search Console y reportes mensuales",
    precioBase: 2000,
    tipo: "mensual",
    canal: "SEO",
    tags: ["google_search", "seo"],
  },
  {
    id: "ads-meta",
    nombre: "Meta Ads (Facebook + Instagram)",
    descripcion: "Campañas de publicidad en Facebook e Instagram, segmentación local, optimización continua",
    precioBase: 3000,
    tipo: "mensual",
    canal: "Publicidad",
    tags: ["publicidad", "meta_ads"],
  },
  {
    id: "ads-google",
    nombre: "Google Ads",
    descripcion: "Campañas de búsqueda y display en Google, remarketing y reportes",
    precioBase: 3000,
    tipo: "mensual",
    canal: "Publicidad",
    tags: ["publicidad", "google_ads"],
  },
  {
    id: "branding",
    nombre: "Identidad Visual / Branding",
    descripcion: "Logo, paleta de colores, tipografía, guía de marca y templates para redes",
    precioBase: 5000,
    tipo: "unico",
    canal: "Branding",
    tags: ["branding", "identidad"],
  },
];

export const PAQUETES: Paquete[] = [
  {
    id: "starter",
    nombre: "Starter",
    descripcion: "Ideal para empezar: presencia en Google Maps y una red social activa",
    servicios: ["gm-optimizacion", "gm-resenas", "ig-manejo"],
    precioMensual: 3500,
    descuento: 42,
  },
  {
    id: "crecimiento",
    nombre: "Crecimiento",
    descripcion: "Para negocios listos para crecer: Maps, redes sociales y sitio web profesional",
    servicios: ["gm-optimizacion", "gm-resenas", "ig-manejo", "ig-reels", "fb-pagina", "web-desarrollo", "web-mantenimiento"],
    precioMensual: 6500,
    descuento: 40,
    popular: true,
  },
  {
    id: "premium",
    nombre: "Premium",
    descripcion: "Todo incluido: presencia completa + publicidad + estrategia de crecimiento",
    servicios: ["gm-optimizacion", "gm-resenas", "ig-manejo", "ig-reels", "fb-pagina", "fb-chatbot", "web-desarrollo", "web-mantenimiento", "seo-basico", "ads-meta"],
    precioMensual: 12000,
    descuento: 45,
  },
];

// Map opportunity patterns to service IDs
const OPORTUNIDAD_SERVICE_MAP: Record<string, string[]> = {
  "Google Maps": ["gm-optimizacion", "gm-resenas"],
  "Google": ["seo-basico"],
  "Instagram": ["ig-manejo", "ig-reels"],
  "Facebook": ["fb-pagina", "fb-chatbot"],
  "Sitio Web": ["web-desarrollo", "web-mantenimiento"],
  "Publicidad": ["ads-meta", "ads-google"],
};

export function generarCotizacion(
  oportunidades: Oportunidad[],
  _giro?: string,
  _zona?: string
): Cotizacion {
  void _giro;
  void _zona;
  // 1. Map opportunities to services
  const serviceIds = new Set<string>();

  for (const op of oportunidades) {
    const mappedServices = OPORTUNIDAD_SERVICE_MAP[op.canal];
    if (mappedServices) {
      // For channels with multiple services, be smart about which to include
      if (op.canal === "Google Maps") {
        if (op.titulo.toLowerCase().includes("reseñ")) {
          serviceIds.add("gm-resenas");
        } else {
          serviceIds.add("gm-optimizacion");
        }
      } else if (op.canal === "Instagram") {
        serviceIds.add("ig-manejo");
        if (op.titulo.toLowerCase().includes("reel")) {
          serviceIds.add("ig-reels");
        }
      } else if (op.canal === "Facebook") {
        if (op.titulo.toLowerCase().includes("crear") || op.titulo.toLowerCase().includes("configurar") || op.titulo.toLowerCase().includes("reactivar")) {
          serviceIds.add("fb-pagina");
        }
        if (op.titulo.toLowerCase().includes("messenger") || op.titulo.toLowerCase().includes("respuesta") || op.titulo.toLowerCase().includes("responde")) {
          serviceIds.add("fb-chatbot");
        }
      } else if (op.canal === "Sitio Web") {
        if (op.titulo.toLowerCase().includes("no tienes")) {
          serviceIds.add("web-desarrollo");
          serviceIds.add("web-mantenimiento");
        } else {
          serviceIds.add("web-mantenimiento");
        }
      } else {
        for (const sid of mappedServices) {
          serviceIds.add(sid);
        }
      }
    }
  }

  // 2. Build recommended services list
  const serviciosRecomendados = SERVICIOS
    .filter((s) => serviceIds.has(s.id))
    .map((s) => ({ ...s, precioFinal: s.precioBase }));

  // 3. Calculate totals
  const totalMensualIndividual = serviciosRecomendados
    .filter((s) => s.tipo === "mensual")
    .reduce((sum, s) => sum + s.precioFinal, 0);

  const totalUnicoIndividual = serviciosRecomendados
    .filter((s) => s.tipo === "unico")
    .reduce((sum, s) => sum + s.precioFinal, 0);

  const totalIndividual = totalMensualIndividual + totalUnicoIndividual;

  // 4. Determine recommended package
  let paqueteRecomendado: Paquete | null = null;

  if (serviciosRecomendados.length <= 3) {
    paqueteRecomendado = PAQUETES[0]; // Starter
  } else if (serviciosRecomendados.length <= 6) {
    paqueteRecomendado = PAQUETES[1]; // Crecimiento
  } else {
    paqueteRecomendado = PAQUETES[2]; // Premium
  }

  const ahorroConPaquete = paqueteRecomendado
    ? Math.max(0, totalMensualIndividual - paqueteRecomendado.precioMensual)
    : 0;

  return {
    serviciosRecomendados,
    paqueteRecomendado,
    paquetes: PAQUETES,
    totalIndividual,
    totalMensualIndividual,
    totalUnicoIndividual,
    ahorroConPaquete,
  };
}

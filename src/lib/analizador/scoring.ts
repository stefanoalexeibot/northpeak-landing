// Exact port of analizador.py scoring logic

export interface Hallazgos {
  google_maps: {
    tiene_perfil: boolean;
    perfil_reclamado: boolean;
    num_resenas: number;
    rating: number;
    tiene_fotos: boolean;
    num_fotos: number;
    tiene_horarios: boolean;
    tiene_sitio_web: boolean;
    tiene_telefono: boolean;
    responde_resenas: boolean;
  };
  google_search: {
    aparece_busqueda: boolean;
    posicion_aprox: number;
    tiene_seo_basico: boolean;
  };
  instagram: {
    tiene_cuenta: boolean;
    username: string;
    seguidores: number;
    posts_ultimo_mes: number;
    tiene_highlights: boolean;
    tiene_link_bio: boolean;
    tiene_whatsapp_bio: boolean;
    usa_reels: boolean;
    calidad_contenido: "baja" | "media" | "alta";
    tiene_precios: boolean;
  };
  facebook: {
    tiene_pagina: boolean;
    pagina_activa: boolean;
    tiene_resenas_fb: boolean;
    num_likes: number;
    tiene_messenger: boolean;
    responde_rapido: boolean;
    tiene_catalogo: boolean;
  };
  sitio_web: {
    tiene_sitio: boolean;
    url: string;
    es_responsive: boolean;
    tiene_whatsapp: boolean;
    tiene_booking: boolean;
    tiene_precios: boolean;
    tiene_ssl: boolean;
    velocidad: "lenta" | "media" | "rapida" | "n/a";
  };
  publicidad: {
    tiene_meta_ads: boolean;
    tiene_google_ads: boolean;
  };
}

export interface Oportunidad {
  canal: string;
  icono: string;
  titulo: string;
  desc: string;
  impacto: "critico" | "alto" | "medio";
  dificultad: "facil" | "medio";
}

export interface DatosNegocio {
  nombre: string;
  giro: string;
  zona: string;
  contacto: string;
  telefono: string;
  vendedor?: string;
  socio_id?: string;
}

export function calcularScore(h: Hallazgos): number {
  let score = 0;
  const maxScore = 100; // 25 + 10 + 25 + 15 + 15 + 10

  // GOOGLE MAPS (25 pts)
  const gm = h.google_maps;
  if (gm.tiene_perfil) score += 3;
  if (gm.perfil_reclamado) score += 5;
  if (gm.num_resenas >= 50) score += 5;
  else if (gm.num_resenas >= 20) score += 3;
  else if (gm.num_resenas >= 5) score += 1;
  if (gm.rating >= 4.5) score += 3;
  else if (gm.rating >= 4.0) score += 2;
  else if (gm.rating >= 3.5) score += 1;
  if (gm.num_fotos >= 20) score += 3;
  else if (gm.num_fotos >= 10) score += 2;
  else if (gm.num_fotos >= 5) score += 1;
  if (gm.tiene_horarios) score += 2;
  if (gm.tiene_sitio_web) score += 2;
  if (gm.responde_resenas) score += 2;

  // GOOGLE SEARCH (10 pts)
  const gs = h.google_search;
  if (gs.aparece_busqueda) score += 5;
  if (gs.posicion_aprox > 0 && gs.posicion_aprox <= 3) score += 3;
  else if (gs.posicion_aprox > 0 && gs.posicion_aprox <= 10) score += 1;
  if (gs.tiene_seo_basico) score += 2;

  // INSTAGRAM (25 pts)
  const ig = h.instagram;
  if (ig.tiene_cuenta) score += 2;
  if (ig.seguidores >= 5000) score += 5;
  else if (ig.seguidores >= 1000) score += 3;
  else if (ig.seguidores >= 300) score += 1;
  if (ig.posts_ultimo_mes >= 12) score += 5;
  else if (ig.posts_ultimo_mes >= 8) score += 3;
  else if (ig.posts_ultimo_mes >= 4) score += 2;
  else if (ig.posts_ultimo_mes >= 1) score += 1;
  if (ig.tiene_highlights) score += 2;
  if (ig.tiene_link_bio) score += 2;
  if (ig.tiene_whatsapp_bio) score += 2;
  if (ig.usa_reels) score += 3;
  if (ig.calidad_contenido === "alta") score += 3;
  else if (ig.calidad_contenido === "media") score += 1;
  if (ig.tiene_precios) score += 1;

  // FACEBOOK (15 pts)
  const fb = h.facebook;
  if (fb.tiene_pagina) score += 2;
  if (fb.pagina_activa) score += 3;
  if (fb.num_likes >= 1000) score += 3;
  else if (fb.num_likes >= 500) score += 2;
  else if (fb.num_likes >= 100) score += 1;
  if (fb.responde_rapido) score += 3;
  if (fb.tiene_catalogo) score += 2;
  if (fb.tiene_resenas_fb) score += 2;

  // SITIO WEB (15 pts)
  const sw = h.sitio_web;
  if (sw.tiene_sitio) score += 3;
  if (sw.es_responsive) score += 3;
  if (sw.tiene_whatsapp) score += 3;
  if (sw.tiene_booking) score += 3;
  if (sw.tiene_precios) score += 1;
  if (sw.tiene_ssl) score += 1;
  if (sw.velocidad === "rapida") score += 1;

  // PUBLICIDAD (10 pts)
  const pub = h.publicidad;
  if (pub.tiene_meta_ads) score += 6;
  if (pub.tiene_google_ads) score += 4;

  return Math.round((score / maxScore) * 100);
}

export function clasificarPrioridad(score: number): { nivel: string; color: string; desc: string } {
  if (score <= 25) return { nivel: "CRITICO", color: "#EF4444", desc: "Tu presencia digital es casi inexistente. Estás perdiendo clientes todos los días." };
  if (score <= 50) return { nivel: "BAJO", color: "#F59E0B", desc: "Tienes lo básico pero hay muchas áreas sin cubrir. Tu competencia te está superando." };
  if (score <= 75) return { nivel: "MEDIO", color: "#3B82F6", desc: "Buena base pero faltan elementos clave para maximizar resultados." };
  return { nivel: "ALTO", color: "#10B981", desc: "Buena presencia digital. Hay oportunidades para optimizar y escalar." };
}

export function generarOportunidades(h: Hallazgos): Oportunidad[] {
  const ops: Oportunidad[] = [];

  const gm = h.google_maps;
  if (!gm.perfil_reclamado) ops.push({ canal: "Google Maps", icono: "📍", titulo: "Reclamar y verificar el perfil de Google Maps", desc: "Tu perfil de Google no está verificado. Esto significa que cualquier persona puede sugerir cambios a tu información. Reclamarlo te da control total y mejora tu posición en búsquedas locales.", impacto: "alto", dificultad: "facil" });
  if (gm.num_resenas < 20) ops.push({ canal: "Google Maps", icono: "⭐", titulo: `Aumentar reseñas (actualmente ${gm.num_resenas})`, desc: "Los negocios con más de 20 reseñas reciben hasta 3x más clicks. Implementar un sistema automático que pida reseñas después de cada servicio puede transformar tu visibilidad.", impacto: "alto", dificultad: "facil" });
  if (!gm.tiene_horarios) ops.push({ canal: "Google Maps", icono: "🕐", titulo: "Agregar horarios de atención", desc: "Sin horarios visibles, los clientes no saben si estás abierto y buscan otra opción. Google también penaliza perfiles incompletos.", impacto: "medio", dificultad: "facil" });
  if (!gm.responde_resenas) ops.push({ canal: "Google Maps", icono: "💬", titulo: "Responder a todas las reseñas", desc: "Responder reseñas (positivas y negativas) mejora tu posicionamiento y muestra que te importan tus clientes. Google premia perfiles activos.", impacto: "medio", dificultad: "facil" });
  if (gm.num_fotos < 15) ops.push({ canal: "Google Maps", icono: "📸", titulo: `Subir más fotos (${gm.num_fotos} actuales, mínimo 15)`, desc: "Los perfiles con 15+ fotos reciben 2x más interacciones. Sube fotos del local, de tus trabajos, del equipo y del ambiente.", impacto: "medio", dificultad: "facil" });

  const gs = h.google_search;
  if (!gs.aparece_busqueda) ops.push({ canal: "Google", icono: "🔍", titulo: "No apareces en búsquedas de Google", desc: "Cuando alguien busca tu tipo de negocio en tu zona, no te encuentra. Esto es una fuga masiva de clientes potenciales que están activamente buscando tus servicios.", impacto: "critico", dificultad: "medio" });

  const ig = h.instagram;
  if (ig.tiene_cuenta && ig.posts_ultimo_mes < 8) ops.push({ canal: "Instagram", icono: "📱", titulo: `Aumentar frecuencia de publicación (${ig.posts_ultimo_mes} posts/mes)`, desc: "El algoritmo de Instagram favorece cuentas activas. Se recomiendan mínimo 3 posts por semana. Tu competencia está publicando más que tú.", impacto: "alto", dificultad: "medio" });
  if (ig.tiene_cuenta && !ig.usa_reels) ops.push({ canal: "Instagram", icono: "🎬", titulo: "Empezar a usar Reels", desc: "Los Reels tienen hasta 10x más alcance que las publicaciones normales. Son la mejor forma de llegar a audiencia nueva sin pagar publicidad.", impacto: "alto", dificultad: "medio" });
  if (ig.tiene_cuenta && !ig.tiene_link_bio) ops.push({ canal: "Instagram", icono: "🔗", titulo: "Agregar link funcional en la bio", desc: "Sin link en bio, los clientes interesados no tienen a dónde ir. Un link a WhatsApp o a una landing page de reservas convierte visitantes en clientes.", impacto: "alto", dificultad: "facil" });
  if (ig.tiene_cuenta && !ig.tiene_whatsapp_bio) ops.push({ canal: "Instagram", icono: "💚", titulo: "Poner WhatsApp visible en el perfil", desc: "El 70% de los clientes en México prefieren contactar por WhatsApp. Si no está visible en tu perfil, pierdes conversiones.", impacto: "alto", dificultad: "facil" });
  if (ig.tiene_cuenta && !ig.tiene_highlights) ops.push({ canal: "Instagram", icono: "✨", titulo: "Organizar Highlights (historias destacadas)", desc: "Los Highlights funcionan como menú de tu negocio: Servicios, Precios, Ubicación, Antes/Después, Reseñas. Un perfil sin highlights se ve descuidado.", impacto: "medio", dificultad: "facil" });
  if (!ig.tiene_cuenta) ops.push({ canal: "Instagram", icono: "📱", titulo: "Crear cuenta de Instagram", desc: "No tienes presencia en la red social más importante para negocios locales en México. Estás invisible para miles de clientes potenciales en tu zona.", impacto: "critico", dificultad: "medio" });

  const fb = h.facebook;
  if (fb.tiene_pagina && !fb.pagina_activa) ops.push({ canal: "Facebook", icono: "👻", titulo: "Reactivar página de Facebook", desc: "Tu página existe pero está inactiva. Una página abandonada genera desconfianza. Peor que no tener página es tener una muerta.", impacto: "medio", dificultad: "facil" });
  if (fb.tiene_pagina && !fb.responde_rapido) ops.push({ canal: "Facebook", icono: "⚡", titulo: "Mejorar tiempo de respuesta en Messenger", desc: "No tienes el badge de respuesta rápida. Los clientes ven esto y eligen negocios que responden más rápido. Un agente de IA resuelve esto al instante.", impacto: "medio", dificultad: "facil" });
  if (!fb.tiene_pagina) ops.push({ canal: "Facebook", icono: "📘", titulo: "Crear página de Facebook", desc: "Sin página de Facebook no puedes correr anuncios en Meta. Esto te bloquea de la plataforma publicitaria más poderosa para negocios locales.", impacto: "critico", dificultad: "facil" });

  const sw = h.sitio_web;
  if (!sw.tiene_sitio) ops.push({ canal: "Sitio Web", icono: "🌐", titulo: "No tienes sitio web", desc: "El 75% de los consumidores juzgan la credibilidad de un negocio por su sitio web. Sin uno, pierdes confianza y posicionamiento en Google.", impacto: "critico", dificultad: "medio" });
  if (sw.tiene_sitio && !sw.tiene_whatsapp) ops.push({ canal: "Sitio Web", icono: "💚", titulo: "Agregar botón de WhatsApp al sitio", desc: "Tu sitio web no tiene forma fácil de contactarte por WhatsApp. Estás perdiendo conversiones de personas que ya están interesadas.", impacto: "alto", dificultad: "facil" });
  if (sw.tiene_sitio && !sw.es_responsive) ops.push({ canal: "Sitio Web", icono: "📱", titulo: "Tu sitio no se ve bien en celular", desc: "El 80% del tráfico viene de celulares. Si tu sitio no es responsive, la mayoría de tus visitantes se van inmediatamente.", impacto: "critico", dificultad: "medio" });

  const pub = h.publicidad;
  if (!pub.tiene_meta_ads) ops.push({ canal: "Publicidad", icono: "🎯", titulo: "No inviertes en publicidad digital", desc: "Sin publicidad pagada, solo te ven tus seguidores actuales. Con $100-200 MXN/día puedes alcanzar a miles de clientes potenciales en tu zona que están buscando exactamente tus servicios.", impacto: "critico", dificultad: "medio" });

  return ops;
}

export function getDefaultHallazgos(): Hallazgos {
  return {
    google_maps: { tiene_perfil: false, perfil_reclamado: false, num_resenas: 0, rating: 0, tiene_fotos: false, num_fotos: 0, tiene_horarios: false, tiene_sitio_web: false, tiene_telefono: false, responde_resenas: false },
    google_search: { aparece_busqueda: false, posicion_aprox: 0, tiene_seo_basico: false },
    instagram: { tiene_cuenta: false, username: "", seguidores: 0, posts_ultimo_mes: 0, tiene_highlights: false, tiene_link_bio: false, tiene_whatsapp_bio: false, usa_reels: false, calidad_contenido: "baja", tiene_precios: false },
    facebook: { tiene_pagina: false, pagina_activa: false, tiene_resenas_fb: false, num_likes: 0, tiene_messenger: false, responde_rapido: false, tiene_catalogo: false },
    sitio_web: { tiene_sitio: false, url: "", es_responsive: false, tiene_whatsapp: false, tiene_booking: false, tiene_precios: false, tiene_ssl: false, velocidad: "n/a" },
    publicidad: { tiene_meta_ads: false, tiene_google_ads: false },
  };
}

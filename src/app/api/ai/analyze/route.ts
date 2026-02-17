import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { askClaude } from "@/lib/ai/claude";
import type { Hallazgos } from "@/lib/analizador/scoring";

const SYSTEM_PROMPT = `Eres un experto en marketing digital y presencia online para negocios locales en México. Tu trabajo es estimar la presencia digital de un negocio basándote en su nombre, giro y zona geográfica.

Debes devolver un JSON con la estructura exacta de "Hallazgos" que represente tu mejor estimación de la presencia digital del negocio. Basa tus estimaciones en:
- El tipo de negocio (giro) y qué tan digitalizado suele estar ese sector
- La zona geográfica y su nivel de adopción digital
- El nombre del negocio y si suena como una marca establecida o pequeña

IMPORTANTE: Sé realista. La mayoría de negocios locales en México tienen presencia digital básica o nula. No asumas que todos tienen todo.

Responde ÚNICAMENTE con el JSON, sin markdown, sin explicaciones.`;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { nombre, giro, zona } = (await request.json()) as {
    nombre: string;
    giro: string;
    zona: string;
  };

  if (!nombre || !giro || !zona) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  try {
    const userMessage = `Analiza la presencia digital estimada de este negocio:

Nombre: ${nombre}
Giro: ${giro}
Zona: ${zona}

Devuelve un JSON con esta estructura exacta:
{
  "google_maps": {
    "tiene_perfil": boolean,
    "perfil_reclamado": boolean,
    "num_resenas": number,
    "rating": number (0-5),
    "tiene_fotos": boolean,
    "num_fotos": number,
    "tiene_horarios": boolean,
    "tiene_sitio_web": boolean,
    "tiene_telefono": boolean,
    "responde_resenas": boolean
  },
  "google_search": {
    "aparece_busqueda": boolean,
    "posicion_aprox": number (0 si no aparece),
    "tiene_seo_basico": boolean
  },
  "instagram": {
    "tiene_cuenta": boolean,
    "username": string,
    "seguidores": number,
    "posts_ultimo_mes": number,
    "tiene_highlights": boolean,
    "tiene_link_bio": boolean,
    "tiene_whatsapp_bio": boolean,
    "usa_reels": boolean,
    "calidad_contenido": "baja" | "media" | "alta",
    "tiene_precios": boolean
  },
  "facebook": {
    "tiene_pagina": boolean,
    "pagina_activa": boolean,
    "tiene_resenas_fb": boolean,
    "num_likes": number,
    "tiene_messenger": boolean,
    "responde_rapido": boolean,
    "tiene_catalogo": boolean
  },
  "sitio_web": {
    "tiene_sitio": boolean,
    "url": string,
    "es_responsive": boolean,
    "tiene_whatsapp": boolean,
    "tiene_booking": boolean,
    "tiene_precios": boolean,
    "tiene_ssl": boolean,
    "velocidad": "lenta" | "media" | "rapida" | "n/a"
  },
  "publicidad": {
    "tiene_meta_ads": boolean,
    "tiene_google_ads": boolean
  }
}`;

    const result = await askClaude(SYSTEM_PROMPT, userMessage);

    // Parse the JSON response
    const hallazgos: Hallazgos = JSON.parse(result);

    return NextResponse.json({ hallazgos });
  } catch (error) {
    console.error("AI analyze error:", error);
    return NextResponse.json(
      { error: "Error al analizar con IA" },
      { status: 500 }
    );
  }
}

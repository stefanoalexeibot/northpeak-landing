import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { askClaude } from "@/lib/ai/claude";
import type { Servicio } from "@/lib/analizador/pricing";

const SYSTEM_PROMPT = `Eres un experto en pricing de servicios de marketing digital para negocios locales en México.

Tu trabajo es ajustar los precios base de servicios de marketing digital según el contexto del negocio.

Reglas de ajuste:
- Zona premium (San Pedro, Polanco, Santa Fe, Del Valle, etc.): +15-25%
- Zona económica (colonias populares, pueblos): -10-15%
- Giro altamente competido (restaurantes, salones, gimnasios): +10-15%
- Giro de nicho con menos competencia: sin ajuste
- Score muy bajo (<25): ofrecer -10% como incentivo para cerrar
- Score medio-alto (>60): sin descuento, el valor está claro

Responde ÚNICAMENTE con un JSON con esta estructura:
{
  "serviciosAjustados": [
    { "id": "service-id", "precioAjustado": 1234, "razon": "breve explicación" }
  ],
  "notaIA": "Nota general sobre la estrategia de precios para este prospecto (1-2 oraciones)"
}

No incluyas markdown, solo el JSON puro.`;

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { servicios, giro, zona, score } = (await request.json()) as {
    servicios: Servicio[];
    giro: string;
    zona: string;
    score: number;
  };

  if (!servicios?.length || !giro || !zona) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  try {
    const userMessage = `Negocio: ${giro} en ${zona}
Score digital actual: ${score}/100

Servicios a cotizar (con precio base en MXN):
${servicios.map((s) => `- ${s.nombre} (${s.id}): $${s.precioBase.toLocaleString()} / ${s.tipo}`).join("\n")}

Ajusta los precios según el contexto.`;

    const response = await askClaude(SYSTEM_PROMPT, userMessage, { maxTokens: 1024 });

    // Strip markdown fences if present
    const cleaned = response.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("AI pricing error:", e);
    return NextResponse.json({ error: "Error al ajustar precios con IA" }, { status: 500 });
  }
}

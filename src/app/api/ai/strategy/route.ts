import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { askClaude } from "@/lib/ai/claude";

const SYSTEM_PROMPT = `Eres un consultor de marketing digital senior especializado en negocios locales en México. Tu trabajo es crear planes de acción paso a paso para generar ventas durante una prueba piloto de 30 días.

Tu estrategia debe ser:
- Práctica y ejecutable en 30 días
- Enfocada en resultados rápidos (quick wins)
- Adaptada al giro y zona del negocio
- Con métricas claras de éxito
- Escrita en español mexicano profesional pero accesible

Estructura tu respuesta en formato markdown con semanas y acciones concretas.`;

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

  const { clientId, analisisId, nombre, giro, zona, score, nivel, oportunidades } =
    (await request.json()) as {
      clientId: string;
      analisisId?: string;
      nombre: string;
      giro: string;
      zona: string;
      score: number;
      nivel: string;
      oportunidades?: { titulo: string; canal: string; impacto: string }[];
    };

  if (!clientId || !nombre || !giro) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  try {
    const userMessage = `Crea un plan de acción de 30 días (prueba piloto) para este negocio:

Negocio: ${nombre}
Giro: ${giro}
Zona: ${zona}
Score digital actual: ${score}/100 (Nivel: ${nivel})

${
  oportunidades?.length
    ? `Oportunidades identificadas:\n${oportunidades
        .map((o) => `- [${o.canal}] ${o.titulo} (Impacto: ${o.impacto})`)
        .join("\n")}`
    : ""
}

El plan debe incluir:

## Semana 1: Quick Wins
(Acciones inmediatas de alto impacto y baja dificultad)

## Semana 2: Fundamentos
(Establecer presencia digital básica)

## Semana 3: Contenido y Engagement
(Estrategia de contenido y comunidad)

## Semana 4: Optimización y Escala
(Medir resultados y ajustar)

## Métricas de Éxito
(KPIs específicos a 30 días)

## Presupuesto Estimado
(Desglose de inversión recomendada)

Sé específico con las acciones: incluye qué hacer, cómo hacerlo, y qué resultado esperar.`;

    const result = await askClaude(SYSTEM_PROMPT, userMessage);

    // Save to database
    const { data: strategy, error } = await supabase
      .from("ai_strategies")
      .insert({
        client_id: clientId,
        analisis_id: analisisId || null,
        content: result,
      })
      .select()
      .single();

    if (error) {
      console.error("DB error saving strategy:", error);
      return NextResponse.json({ content: result });
    }

    return NextResponse.json({ content: result, id: strategy.id });
  } catch (error) {
    console.error("AI strategy error:", error);
    return NextResponse.json(
      { error: "Error al generar estrategia con IA" },
      { status: 500 }
    );
  }
}

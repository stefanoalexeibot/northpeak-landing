import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { askClaude } from "@/lib/ai/claude";

const SYSTEM_PROMPT = `Eres un experto en marketing de contenido para redes sociales, especializado en negocios locales en México. Generas ideas de posts creativos, relevantes y adaptados al público mexicano.

Tus ideas deben ser:
- Prácticas y fáciles de ejecutar
- Adaptadas al giro del negocio
- Con copy en español mexicano natural (no formal, no Spain-Spanish)
- Con sugerencias de formato (carrusel, reel, story, post estático)
- Con hashtags relevantes

Responde en formato markdown estructurado.`;

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

  const { clientName, company, giro, zona, score, oportunidades } =
    (await request.json()) as {
      clientName: string;
      company?: string;
      giro: string;
      zona: string;
      score?: number;
      oportunidades?: string[];
    };

  if (!clientName || !giro) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  try {
    const userMessage = `Genera 5 ideas de contenido para redes sociales para este negocio:

Negocio: ${company || clientName}
Giro: ${giro}
Zona: ${zona || "México"}
${score ? `Score de presencia digital: ${score}/100` : ""}
${oportunidades?.length ? `Oportunidades identificadas:\n${oportunidades.map((o) => `- ${o}`).join("\n")}` : ""}

Para cada idea incluye:
1. Título del post
2. Formato sugerido (Reel, Carrusel, Story, Post)
3. Copy sugerido (texto del caption)
4. Hashtags recomendados
5. Tip de ejecución

Enfócate en contenido que genere engagement y atraiga clientes locales.`;

    const result = await askClaude(SYSTEM_PROMPT, userMessage);

    return NextResponse.json({ content: result });
  } catch (error) {
    console.error("AI content error:", error);
    return NextResponse.json(
      { error: "Error al generar contenido con IA" },
      { status: 500 }
    );
  }
}

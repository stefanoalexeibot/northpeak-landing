import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Public route — no auth required. Uses service role to bypass RLS.
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: analisis } = await supabase
    .from("analisis_digital")
    .select("report_url")
    .eq("id", params.id)
    .single();

  if (!analisis?.report_url) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>No encontrado</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#05060A;color:#7A7D8A;margin:0"><div style="text-align:center"><h1 style="color:#E8E9ED;font-size:24px">Reporte no encontrado</h1><p>El enlace puede haber expirado o ser incorrecto.</p></div></body></html>`,
      {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  // Fetch the HTML from Supabase Storage
  const res = await fetch(analisis.report_url);
  if (!res.ok) {
    return new NextResponse("Error al cargar reporte", { status: 500 });
  }

  const html = await res.text();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

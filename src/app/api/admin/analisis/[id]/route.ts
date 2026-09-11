import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();

  const { data: analisis } = await supabase
    .from("analisis_digital")
    .select("report_url")
    .eq("id", params.id)
    .single();

  if (!analisis?.report_url) {
    return new NextResponse("Reporte no encontrado", { status: 404 });
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
    },
  });
}

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const ext = searchParams.get("ext") || "jpg";

  if (!token) {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 });
  }

  // Verify the token is valid
  const anon = getAnonClient();
  const { data: payment, error } = await anon
    .from("payments")
    .select("id, client_id")
    .eq("pago_token", token)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: "Token inválido" }, { status: 404 });
  }

  const path = `comprobantes/${payment.id}_${Date.now()}.${ext}`;

  // Create signed upload URL using service role
  const service = getServiceClient();
  const { data, error: signError } = await service.storage
    .from("client-files")
    .createSignedUploadUrl(path);

  if (signError || !data) {
    return NextResponse.json({ error: "No se pudo generar el enlace de subida" }, { status: 500 });
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()}/storage/v1/object/public/client-files/${path}`;

  return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl });
}

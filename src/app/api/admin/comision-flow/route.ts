import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Default steps for the comision flow checklist
const DEFAULT_COMISION_TASKS = [
  "Prospecto registrado por el comisionista",
  "Primera cita / presentación agendada",
  "Propuesta enviada al cliente",
  "Contrato firmado por el cliente",
  "Primer pago recibido (venta cerrada)",
  "Comisión calculada y registrada",
  "Comisión pagada al comisionista",
];

async function getAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado", status: 401, supabase: null };
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "No autorizado", status: 403, supabase: null };
  return { error: null, status: 200, supabase: createAdminClient() };
}

// GET: returns socio, comision tasks, and comision status for a client
export async function GET(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id");
  if (!clientId) return NextResponse.json({ error: "Falta client_id" }, { status: 400 });

  // Get client with socio and comision
  const { data: client } = await supabase
    .from("clients")
    .select("id, socio_id, comision_id")
    .eq("id", clientId)
    .single();

  // Get all active socios for dropdown
  const { data: socios } = await supabase
    .from("socios")
    .select("id, nombre, porcentaje_comision")
    .eq("activo", true)
    .order("nombre");

  // Get or auto-create comision tasks
  const { data: existingTasks } = await supabase
    .from("comision_tasks")
    .select("*")
    .eq("client_id", clientId)
    .order("sort_order");

  let tasks = existingTasks ?? [];

  if (tasks.length === 0) {
    const rows = DEFAULT_COMISION_TASKS.map((label, i) => ({
      client_id: clientId,
      label,
      sort_order: i,
    }));
    const { data: created } = await supabase
      .from("comision_tasks")
      .insert(rows)
      .select()
      .order("sort_order");
    tasks = created ?? [];
  }

  // Get comision if linked
  let comision = null;
  if (client?.comision_id) {
    const { data: com } = await supabase
      .from("comisiones")
      .select("*")
      .eq("id", client.comision_id)
      .single();
    comision = com;
  }

  // Get linked socio info
  let socio = null;
  if (client?.socio_id) {
    const { data: s } = await supabase
      .from("socios")
      .select("id, nombre, porcentaje_comision")
      .eq("id", client.socio_id)
      .single();
    socio = s;
  }

  return NextResponse.json({
    socio_id: client?.socio_id ?? null,
    comision_id: client?.comision_id ?? null,
    socios: socios ?? [],
    tasks,
    comision,
    socio,
  });
}

// PATCH: toggle a task, or update socio link
export async function PATCH(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const { action, client_id, task_id, done, socio_id } = body;

  if (action === "toggle_task") {
    if (!task_id) return NextResponse.json({ error: "Falta task_id" }, { status: 400 });
    const { data, error: dbError } = await supabase
      .from("comision_tasks")
      .update({ done, done_at: done ? new Date().toISOString() : null })
      .eq("id", task_id)
      .select()
      .single();
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (action === "link_socio") {
    if (!client_id) return NextResponse.json({ error: "Falta client_id" }, { status: 400 });
    const { error: dbError } = await supabase
      .from("clients")
      .update({ socio_id: socio_id || null })
      .eq("id", client_id);
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "mark_comision_pagada") {
    const { comision_id } = body;
    if (!comision_id) return NextResponse.json({ error: "Falta comision_id" }, { status: 400 });
    const { data, error: dbError } = await supabase
      .from("comisiones")
      .update({ status: "pagada", paid_at: new Date().toISOString() })
      .eq("id", comision_id)
      .select()
      .single();
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
}

// POST: register comision when sale is closed
export async function POST(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const { client_id, socio_id, nombre_negocio, monto_venta, porcentaje_aplicado, notas } = body;

  if (!client_id || !socio_id || !nombre_negocio || monto_venta === undefined || porcentaje_aplicado === undefined) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const monto_comision = (Number(monto_venta) * Number(porcentaje_aplicado)) / 100;

  const { data: comision, error: comErr } = await supabase
    .from("comisiones")
    .insert({
      socio_id,
      client_id,
      nombre_negocio,
      monto_venta,
      porcentaje_aplicado,
      monto_comision,
      status: "pendiente",
      notas: notas || null,
    })
    .select()
    .single();

  if (comErr) return NextResponse.json({ error: comErr.message }, { status: 500 });

  // Link comision to client
  await supabase
    .from("clients")
    .update({ comision_id: comision.id })
    .eq("id", client_id);

  return NextResponse.json(comision);
}

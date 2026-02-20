import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { notifyAdmin } from "@/lib/email/notify-admin";

// Called by Vercel Cron every Monday at 9:00 AM UTC (3:00 AM CST)
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const today = now.toISOString().split("T")[0];

  const [
    { data: weekPayments },
    { data: pendingPayments },
    { data: overduePayments },
    { count: newClients },
    { count: totalClients },
    { data: newProspectos },
    { data: completedCuestionarios },
    { count: staleProspectos },
  ] = await Promise.all([
    // Revenue this week
    supabase
      .from("payments")
      .select("amount")
      .eq("status", "completed")
      .gte("paid_at", weekAgo),
    // Pending payments
    supabase
      .from("payments")
      .select("amount")
      .eq("status", "pending"),
    // Overdue payments
    supabase
      .from("payments")
      .select("amount")
      .eq("status", "pending")
      .not("due_date", "is", null)
      .lt("due_date", today),
    // New clients this week
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    // Total clients
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true }),
    // New prospectos this week
    supabase
      .from("analisis_digital")
      .select("id, nombre_negocio, etapa")
      .gte("created_at", weekAgo),
    // Completed cuestionarios this week
    supabase
      .from("cuestionarios")
      .select("id")
      .eq("status", "completed")
      .gte("completed_at", weekAgo),
    // Stale prospectos (no movement in 5+ days, not closed)
    supabase
      .from("analisis_digital")
      .select("*", { count: "exact", head: true })
      .not("etapa", "in", "(cerrado_ganado,cerrado_perdido)")
      .lt("etapa_updated_at", new Date(now.getTime() - 5 * 86400000).toISOString()),
  ]);

  const weekRevenue = weekPayments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const totalPending = pendingPayments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const totalOverdue = overduePayments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const newProspectosCount = newProspectos?.length ?? 0;
  const ganados = newProspectos?.filter((p) => p.etapa === "cerrado_ganado").length ?? 0;

  // Pipeline summary
  const pipelineSummary = newProspectos
    ? {
      nuevos: newProspectos.filter((p) => p.etapa === "nuevo").length,
      enNegociacion: newProspectos.filter((p) => p.etapa === "en_negociacion").length,
      ganados,
      perdidos: newProspectos.filter((p) => p.etapa === "cerrado_perdido").length,
    }
    : { nuevos: 0, enNegociacion: 0, ganados: 0, perdidos: 0 };

  const fmt = (n: number) =>
    `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  const body = `
    <h2 style="color: #00E5A0; font-size: 20px; margin-bottom: 24px;">Resumen Semanal</h2>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 16px; background: #0C0D12; border-radius: 8px 0 0 0;">
          <div style="color: #7A7D8A; font-size: 11px; text-transform: uppercase;">Ingresos semana</div>
          <div style="color: #00E5A0; font-size: 22px; font-weight: bold;">${fmt(weekRevenue)}</div>
        </td>
        <td style="padding: 12px 16px; background: #0C0D12; border-radius: 0 8px 0 0;">
          <div style="color: #7A7D8A; font-size: 11px; text-transform: uppercase;">Por cobrar</div>
          <div style="color: #E8E9ED; font-size: 22px; font-weight: bold;">${fmt(totalPending)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; background: #0C0D12; border-radius: 0 0 0 8px;">
          <div style="color: #7A7D8A; font-size: 11px; text-transform: uppercase;">Vencidos</div>
          <div style="color: ${totalOverdue > 0 ? "#F87171" : "#E8E9ED"}; font-size: 22px; font-weight: bold;">${fmt(totalOverdue)}</div>
        </td>
        <td style="padding: 12px 16px; background: #0C0D12; border-radius: 0 0 8px 0;">
          <div style="color: #7A7D8A; font-size: 11px; text-transform: uppercase;">Clientes nuevos</div>
          <div style="color: #E8E9ED; font-size: 22px; font-weight: bold;">${newClients ?? 0} <span style="color: #7A7D8A; font-size: 14px;">/ ${totalClients ?? 0} total</span></div>
        </td>
      </tr>
    </table>

    <h3 style="color: #E8E9ED; font-size: 16px; margin-bottom: 12px;">Pipeline</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 8px 12px; background: #0C0D12; border-radius: 8px; text-align: center;">
          <div style="color: #00E5A0; font-size: 20px; font-weight: bold;">${newProspectosCount}</div>
          <div style="color: #7A7D8A; font-size: 10px; text-transform: uppercase;">Nuevos prospectos</div>
        </td>
        <td style="padding: 8px 12px; background: #0C0D12; border-radius: 8px; text-align: center;">
          <div style="color: #3B82F6; font-size: 20px; font-weight: bold;">${completedCuestionarios?.length ?? 0}</div>
          <div style="color: #7A7D8A; font-size: 10px; text-transform: uppercase;">Cuestionarios</div>
        </td>
        <td style="padding: 8px 12px; background: #0C0D12; border-radius: 8px; text-align: center;">
          <div style="color: #22C55E; font-size: 20px; font-weight: bold;">${pipelineSummary.ganados}</div>
          <div style="color: #7A7D8A; font-size: 10px; text-transform: uppercase;">Ganados</div>
        </td>
      </tr>
    </table>

    ${(staleProspectos ?? 0) > 0 ? `
    <div style="background: rgba(250, 204, 21, 0.1); border: 1px solid rgba(250, 204, 21, 0.2); border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
      <span style="color: #FACC15; font-weight: bold;">⚠ ${staleProspectos} prospecto${(staleProspectos ?? 0) > 1 ? "s" : ""}</span>
      <span style="color: #FACC15;"> sin seguimiento hace 5+ días</span>
    </div>
    ` : ""}

    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://northpeakdigital.com"}/admin" style="display: inline-block; background: #00E5A0; color: #05060A; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
        Ir al Portal
      </a>
    </div>
  `;

  await notifyAdmin({
    subject: `📊 Resumen semanal — ${fmt(weekRevenue)} ingresos, ${newProspectosCount} prospectos`,
    body,
  });

  return NextResponse.json({ success: true });
}

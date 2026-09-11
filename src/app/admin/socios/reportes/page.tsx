"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Loader2,
  Trophy,
  TrendingUp,
  DollarSign,
  Handshake,
  Users,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Socio } from "@/lib/types";

interface SocioStats extends Socio {
  stats: { prospectos: number; ganados: number };
  total_comisiones: number;
}

interface Comision {
  id: string;
  Socio_id: string;
  monto_venta: number;
  monto_comision: number;
  status: string;
  created_at: string;
  porcentaje_aplicado: number;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
}

export default function SociosReportesPage() {
  const [Socios, setSocios] = useState<SocioStats[]>([]);
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cRes, coRes] = await Promise.all([
          fetch("/api/admin/socios"),
          fetch("/api/admin/comisiones"),
        ]);
        if (cRes.ok) setSocios(await cRes.json());
        if (coRes.ok) setComisiones(await coRes.json());
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  // Monthly data (last 6 months)
  const months: Record<string, { ventas: number; comisiones: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
    months[key] = { ventas: 0, comisiones: 0 };
  }
  for (const c of comisiones) {
    if (c.status === "cancelada") continue;
    const key = formatMonth(c.created_at);
    if (key in months) {
      months[key].ventas += Number(c.monto_venta);
      months[key].comisiones += Number(c.monto_comision);
    }
  }
  const monthlyData = Object.entries(months).map(([month, data]) => ({ month, ...data }));
  const maxVentas = Math.max(...monthlyData.map((m) => m.ventas), 1);

  // Top Socios
  const ranked = [...Socios].sort((a, b) => b.total_comisiones - a.total_comisiones);

  // Conversion rates
  const SocioConversion = Socios.map((c) => ({
    nombre: c.nombre,
    prospectos: c.stats.prospectos,
    ganados: c.stats.ganados,
    conversion: c.stats.prospectos > 0 ? Math.round((c.stats.ganados / c.stats.prospectos) * 100) : 0,
    comisiones: c.total_comisiones,
  })).sort((a, b) => b.ganados - a.ganados);

  // Totals
  const totalVentas = comisiones.filter((c) => c.status !== "cancelada").reduce((s, c) => s + Number(c.monto_venta), 0);
  const totalComisionesGeneradas = comisiones.filter((c) => c.status !== "cancelada").reduce((s, c) => s + Number(c.monto_comision), 0);
  const totalPendiente = comisiones.filter((c) => c.status === "pendiente").reduce((s, c) => s + Number(c.monto_comision), 0);
  const totalGanados = Socios.reduce((s, c) => s + c.stats.ganados, 0);

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <PieChart className="h-5 w-5 text-amber-400" />
          <h1 className="text-2xl font-heading font-bold text-northpeak-text">Reportes — Socios</h1>
        </div>
        <p className="text-northpeak-text-muted text-sm">
          Resumen de rendimiento, ventas y comisiones generadas.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-northpeak-text-muted" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Socios activos", value: Socios.filter((c) => c.activo).length, icon: Handshake, color: "text-amber-400" },
              { label: "Total ventas generadas", value: formatCurrency(totalVentas), icon: TrendingUp, color: "text-blue-400" },
              { label: "Comisiones generadas", value: formatCurrency(totalComisionesGeneradas), icon: DollarSign, color: "text-northpeak-green" },
              { label: "Por pagar", value: formatCurrency(totalPendiente), icon: Target, color: "text-yellow-400" },
            ].map((kpi) => (
              <Card key={kpi.label} className="bg-northpeak-card border-northpeak-surface">
                <CardContent className="p-5">
                  <kpi.icon className={cn("h-4 w-4 mb-2", kpi.color)} />
                  <p className={cn("font-heading font-bold text-xl leading-none mb-1", kpi.color)}>{kpi.value}</p>
                  <p className="text-[11px] text-northpeak-text-muted">{kpi.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly chart */}
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-sm text-northpeak-text font-semibold">Ventas vs. Comisiones (últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-40">
                {monthlyData.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end gap-0.5 h-32">
                      <div
                        className="flex-1 bg-blue-400/30 rounded-t-sm transition-all"
                        style={{ height: `${(m.ventas / maxVentas) * 100}%` }}
                        title={`Ventas: ${formatCurrency(m.ventas)}`}
                      />
                      <div
                        className="flex-1 bg-amber-400/70 rounded-t-sm transition-all"
                        style={{ height: `${(m.comisiones / maxVentas) * 100}%` }}
                        title={`Comisión: ${formatCurrency(m.comisiones)}`}
                      />
                    </div>
                    <span className="text-[10px] text-northpeak-text-muted">{m.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-400/30" /><span className="text-xs text-northpeak-text-muted">Ventas</span></div>
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400/70" /><span className="text-xs text-northpeak-text-muted">Comisión</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Ranking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-northpeak-card border-northpeak-surface">
              <CardHeader>
                <CardTitle className="text-sm text-northpeak-text font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  Top Socios por comisión
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ranked.length === 0 ? (
                  <p className="text-sm text-northpeak-text-muted text-center py-4">Sin datos</p>
                ) : (
                  ranked.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className={cn("text-lg font-bold w-6 text-center",
                        i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-northpeak-text-muted"
                      )}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-northpeak-text truncate">{c.nombre}</p>
                        <p className="text-xs text-northpeak-text-muted">{c.stats.ganados} ventas · {c.porcentaje_comision}%</p>
                      </div>
                      <p className="text-sm font-bold text-amber-400">{formatCurrency(c.total_comisiones)}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-northpeak-card border-northpeak-surface">
              <CardHeader>
                <CardTitle className="text-sm text-northpeak-text font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  Conversión por Socio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SocioConversion.length === 0 ? (
                  <p className="text-sm text-northpeak-text-muted text-center py-4">Sin datos</p>
                ) : (
                  SocioConversion.map((c) => (
                    <div key={c.nombre} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-northpeak-text font-medium truncate">{c.nombre}</span>
                        <span className="text-northpeak-text-muted ml-2 flex-shrink-0">
                          {c.ganados}/{c.prospectos} · <span className="text-blue-400 font-medium">{c.conversion}%</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-northpeak-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full transition-all"
                          style={{ width: `${c.conversion}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumen total */}
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-sm text-northpeak-text font-semibold">Resumen global</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-northpeak-text">{Socios.reduce((s, c) => s + c.stats.prospectos, 0)}</p>
                  <p className="text-xs text-northpeak-text-muted">Prospectos referidos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{totalGanados}</p>
                  <p className="text-xs text-northpeak-text-muted">Ventas cerradas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">
                    {Socios.reduce((s, c) => s + c.stats.prospectos, 0) > 0
                      ? Math.round((totalGanados / Socios.reduce((s, c) => s + c.stats.prospectos, 0)) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-northpeak-text-muted">Conversión global</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{comisiones.length}</p>
                  <p className="text-xs text-northpeak-text-muted">Comisiones registradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


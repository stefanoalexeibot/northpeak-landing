"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Handshake,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Users,
  Loader2,
  LogOut,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardData {
  Socio: {
    nombre: string;
    email: string;
    porcentaje_comision: number;
  };
  stats: {
    total_prospectos: number;
    ganados: number;
    comisiones_pendientes: number;
    comisiones_pagadas: number;
  };
  prospectos: Array<{
    id: string;
    nombre_negocio: string;
    giro: string;
    zona: string;
    score: number;
    nivel: string;
    etapa: string;
    contacto?: string;
    telefono?: string;
    cuestionario_token?: string;
    created_at: string;
  }>;
  comisiones: Array<{
    id: string;
    nombre_negocio: string;
    monto_venta: number;
    monto_comision: number;
    porcentaje_aplicado: number;
    status: string;
    created_at: string;
    paid_at?: string;
  }>;
}

const ETAPA_LABELS: Record<string, { label: string; color: string }> = {
  nuevo: { label: "Nuevo", color: "text-gray-400 bg-gray-400/10" },
  cuestionario_enviado: { label: "Cuestionario enviado", color: "text-blue-400 bg-blue-400/10" },
  cuestionario_completado: { label: "Cotización lista", color: "text-emerald-400 bg-emerald-400/10" },
  en_negociacion: { label: "En negociación", color: "text-yellow-400 bg-yellow-400/10" },
  cerrado_ganado: { label: "¡Ganado! 🎉", color: "text-green-400 bg-green-400/10" },
  cerrado_perdido: { label: "Cerrado", color: "text-red-400 bg-red-400/10" },
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
    timeZone: "America/Monterrey",
  });
}

export default function SocioDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"prospectos" | "comisiones">("prospectos");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/socio/dashboard");
      if (res.ok) {
        setData(await res.json());
      } else {
        const err = await res.json();
        setError(err.error || "Error al cargar datos");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/socio/login");
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/cuestionario/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  function openWhatsApp(telefono: string, nombre: string, token?: string) {
    const link = token ? `${window.location.origin}/cuestionario/${token}` : "";
    const msg = encodeURIComponent(
      `Hola ${nombre}! Te comparto este formulario rápido para que podamos analizar tu negocio sin costo: ${link}`
    );
    window.open(`https://wa.me/${telefono.replace(/\D/g, "")}?text=${msg}`, "_blank");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-sm">{error || "Error"}</div>
    );
  }

  const { Socio, stats, prospectos, comisiones } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="NorthPeak Digital" className="h-7 mb-4" />
          <div className="flex items-center gap-2 mb-1">
            <Handshake className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Portal Socio</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-northpeak-text">
            Hola, {Socio.nombre.split(" ")[0]} 👋
          </h1>
          <p className="text-northpeak-text-muted text-sm">
            Tu comisión: <span className="text-amber-400 font-semibold">{Socio.porcentaje_comision}%</span> sobre cada venta cerrada
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-northpeak-text-muted hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-northpeak-surface"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Prospectos referidos", value: stats.total_prospectos, icon: Users, color: "text-northpeak-text" },
          { label: "Ventas cerradas", value: stats.ganados, icon: TrendingUp, color: "text-green-400" },
          { label: "Comisión pendiente", value: formatCurrency(stats.comisiones_pendientes), icon: Clock, color: "text-yellow-400" },
          { label: "Comisión cobrada", value: formatCurrency(stats.comisiones_pagadas), icon: CheckCircle2, color: "text-amber-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-northpeak-surface bg-northpeak-card p-5">
            <kpi.icon className={cn("h-4 w-4 mb-2", kpi.color)} />
            <p className={cn("font-heading font-bold text-xl leading-none mb-1", kpi.color)}>{kpi.value}</p>
            <p className="text-[11px] text-northpeak-text-muted">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-northpeak-surface rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("prospectos")}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
            activeTab === "prospectos"
              ? "bg-northpeak-card text-northpeak-text shadow-sm"
              : "text-northpeak-text-muted hover:text-northpeak-text"
          )}
        >
          Mis prospectos ({prospectos.length})
        </button>
        <button
          onClick={() => setActiveTab("comisiones")}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
            activeTab === "comisiones"
              ? "bg-northpeak-card text-northpeak-text shadow-sm"
              : "text-northpeak-text-muted hover:text-northpeak-text"
          )}
        >
          Comisiones ({comisiones.length})
        </button>
      </div>

      {/* Tab: Prospectos */}
      {activeTab === "prospectos" && (
        <div className="space-y-3">
          {prospectos.length === 0 ? (
            <div className="text-center py-16 text-northpeak-text-muted">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin prospectos aún</p>
              <p className="text-sm mt-1">Tu administrador registrará los prospectos que refieras.</p>
            </div>
          ) : (
            prospectos.map((p) => {
              const etapaConfig = ETAPA_LABELS[p.etapa] || { label: p.etapa, color: "text-gray-400 bg-gray-400/10" };
              return (
                <div key={p.id} className="rounded-xl border border-northpeak-surface bg-northpeak-card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-northpeak-text mb-0.5">{p.nombre_negocio}</h3>
                      <p className="text-xs text-northpeak-text-muted">{p.giro} · {p.zona}</p>
                      {p.contacto && <p className="text-xs text-northpeak-text-muted mt-0.5">👤 {p.contacto}</p>}
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full flex-shrink-0", etapaConfig.color)}>
                      {etapaConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.cuestionario_token && (
                      <>
                        <button
                          onClick={() => copyLink(p.cuestionario_token!)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-northpeak-surface text-northpeak-text-muted hover:text-northpeak-text transition-colors"
                        >
                          {copied === p.cuestionario_token ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                          Copiar link del cuestionario
                        </button>
                        <a
                          href={`/cuestionario/${p.cuestionario_token}`}
                          target="_blank"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-northpeak-surface text-northpeak-text-muted hover:text-northpeak-text transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Ver cuestionario
                        </a>
                      </>
                    )}
                    {p.telefono && p.cuestionario_token && (
                      <button
                        onClick={() => openWhatsApp(p.telefono!, p.nombre_negocio, p.cuestionario_token)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Enviar por WhatsApp
                      </button>
                    )}
                    <span className="text-xs text-northpeak-text-muted ml-auto">
                      {formatDate(p.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Comisiones */}
      {activeTab === "comisiones" && (
        <div className="space-y-3">
          {comisiones.length === 0 ? (
            <div className="text-center py-16 text-northpeak-text-muted">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin comisiones registradas</p>
              <p className="text-sm mt-1">Se registrarán cuando se cierren ventas de tus prospectos.</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <p className="text-xs text-northpeak-text-muted mb-1">Por cobrar</p>
                  <p className="text-xl font-bold text-yellow-400">{formatCurrency(stats.comisiones_pendientes)}</p>
                </div>
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                  <p className="text-xs text-northpeak-text-muted mb-1">Ya cobrado</p>
                  <p className="text-xl font-bold text-green-400">{formatCurrency(stats.comisiones_pagadas)}</p>
                </div>
              </div>

              {comisiones.map((c) => (
                <div key={c.id} className="rounded-xl border border-northpeak-surface bg-northpeak-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-northpeak-text mb-0.5">{c.nombre_negocio}</h3>
                      <div className="text-xs text-northpeak-text-muted space-y-0.5">
                        <p>Venta: <span className="text-northpeak-text">{formatCurrency(Number(c.monto_venta))}</span> · {c.porcentaje_aplicado}%</p>
                        <p>Fecha: {formatDate(c.created_at)}</p>
                        {c.paid_at && <p className="text-green-400">Pagado el {formatDate(c.paid_at)}</p>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-amber-400 mb-1">{formatCurrency(Number(c.monto_comision))}</p>
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        c.status === "pendiente" ? "text-yellow-400 bg-yellow-400/10" :
                        c.status === "pagada" ? "text-green-400 bg-green-400/10" :
                        "text-red-400 bg-red-400/10"
                      )}>
                        {c.status === "pendiente" ? "Pendiente" : c.status === "pagada" ? "Pagada ✓" : "Cancelada"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}


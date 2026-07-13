"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Loader2,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  GripVertical,
  AlertTriangle,
  Filter,
  Handshake,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EtapaProspecto, Socio } from "@/lib/types";

interface ProspectoCard {
  id: string;
  nombre_negocio: string;
  giro: string;
  zona: string;
  score: number;
  nivel: string;
  etapa: EtapaProspecto;
  contacto?: string;
  telefono?: string;
  cuestionario_token?: string;
  Socio_id?: string | null;
  etapa_updated_at?: string;
  created_at: string;
}

const COLUMNAS: { etapa: EtapaProspecto; label: string; color: string; dotColor: string }[] = [
  { etapa: "nuevo", label: "Nuevos", color: "border-gray-500/30", dotColor: "bg-gray-400" },
  { etapa: "cuestionario_enviado", label: "Cuestionario enviado", color: "border-blue-500/30", dotColor: "bg-blue-400" },
  { etapa: "cuestionario_completado", label: "Cotización lista", color: "border-emerald-500/30", dotColor: "bg-emerald-400" },
  { etapa: "en_negociacion", label: "En negociación", color: "border-yellow-500/30", dotColor: "bg-yellow-400" },
  { etapa: "cerrado_ganado", label: "Ganados ✓", color: "border-green-500/30", dotColor: "bg-green-400" },
  { etapa: "cerrado_perdido", label: "Perdidos", color: "border-red-500/30", dotColor: "bg-red-400" },
];

const STALE_DAYS = 5;

function nivelColor(nivel: string) {
  if (nivel === "CRITICO") return "text-red-400 bg-red-400/10";
  if (nivel === "BAJO") return "text-yellow-400 bg-yellow-400/10";
  if (nivel === "MEDIO") return "text-blue-400 bg-blue-400/10";
  return "text-green-400 bg-green-400/10";
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function isStale(p: ProspectoCard): boolean {
  if (p.etapa === "cerrado_ganado" || p.etapa === "cerrado_perdido") return false;
  const ref = p.etapa_updated_at || p.created_at;
  return daysAgo(ref) >= STALE_DAYS;
}

export default function SociosPipelinePage() {
  const { addToast } = useToast();
  const [prospectos, setProspectos] = useState<ProspectoCard[]>([]);
  const [Socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverEtapa, setDragOverEtapa] = useState<string | null>(null);
  const [SocioFilter, setSocioFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [analisisRes, SociosRes] = await Promise.all([
        fetch("/api/admin/analisis"),
        fetch("/api/admin/Socios"),
      ]);
      if (analisisRes.ok) {
        const all: ProspectoCard[] = await analisisRes.json();
        // Only show prospectos that have a Socio_id
        setProspectos(all.filter((p) => p.Socio_id));
      }
      if (SociosRes.ok) {
        setSocios(await SociosRes.json());
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  const updateEtapa = useCallback(async (id: string, etapa: EtapaProspecto) => {
    setProspectos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, etapa, etapa_updated_at: new Date().toISOString() } : p))
    );
    try {
      const res = await fetch("/api/admin/analisis", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, etapa }),
      });
      if (!res.ok) {
        addToast("Error al mover prospecto", "error");
        loadData();
      }
    } catch {
      addToast("Error de conexión", "error");
      loadData();
    }
  }, [addToast]);

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e: React.DragEvent, etapa: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverEtapa(etapa);
  }

  function handleDrop(e: React.DragEvent, etapa: EtapaProspecto) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setDraggingId(null);
    setDragOverEtapa(null);
    if (id) {
      const current = prospectos.find((p) => p.id === id);
      if (current && current.etapa !== etapa) updateEtapa(id, etapa);
    }
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverEtapa(null);
  }

  function copyLink(url: string) {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  function openWhatsApp(telefono: string, nombre: string, token?: string) {
    const link = token ? `${window.location.origin}/cuestionario/${token}` : "";
    const msg = encodeURIComponent(
      `Hola ${nombre}, soy tu Socio de NorthPeak Digital. Te comparto el formulario para analizar tu negocio: ${link}`
    );
    window.open(`https://wa.me/${telefono.replace(/\D/g, "")}?text=${msg}`, "_blank");
  }

  const filteredProspectos = SocioFilter
    ? prospectos.filter((p) => p.Socio_id === SocioFilter)
    : prospectos;

  const getSocioNombre = (id?: string | null) =>
    Socios.find((c) => c.id === id)?.nombre || "—";

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <Handshake className="h-5 w-5 text-amber-400" />
            <h1 className="text-2xl font-heading font-bold text-northpeak-text">Pipeline Socios</h1>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-northpeak-surface text-northpeak-text-muted gap-2"
          >
            <Filter className="h-3.5 w-3.5" />
            Filtros
          </Button>
        </div>
        <p className="text-northpeak-text-muted text-sm">
          Prospectos referidos por Socios — arrastra para mover entre etapas.
        </p>

        {showFilters && (
          <div className="mt-3 p-3 rounded-lg bg-northpeak-card border border-northpeak-surface flex items-center gap-3">
            <label className="text-xs text-northpeak-text-muted">Socio:</label>
            <select
              value={SocioFilter}
              onChange={(e) => setSocioFilter(e.target.value)}
              className="text-sm bg-northpeak-surface border border-northpeak-surface rounded-lg px-3 py-1.5 text-northpeak-text"
            >
              <option value="">Todos</option>
              {Socios.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {SocioFilter && (
              <button onClick={() => setSocioFilter("")} className="text-northpeak-text-muted hover:text-northpeak-text">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-northpeak-text-muted" />
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ minHeight: "60vh" }}
        >
          {COLUMNAS.map((col) => {
            const cards = filteredProspectos.filter((p) => p.etapa === col.etapa);
            const isDragTarget = dragOverEtapa === col.etapa;
            return (
              <div
                key={col.etapa}
                className={cn(
                  "flex-shrink-0 w-72 rounded-xl border bg-northpeak-card/50 transition-colors",
                  col.color,
                  isDragTarget && "bg-amber-500/5 border-amber-500/50"
                )}
                onDragOver={(e) => handleDragOver(e, col.etapa)}
                onDragLeave={() => setDragOverEtapa(null)}
                onDrop={(e) => handleDrop(e, col.etapa)}
              >
                <div className="p-3 border-b border-northpeak-surface/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", col.dotColor)} />
                    <span className="text-xs font-semibold text-northpeak-text">{col.label}</span>
                  </div>
                  <span className="text-xs text-northpeak-text-muted bg-northpeak-surface px-1.5 py-0.5 rounded-full">
                    {cards.length}
                  </span>
                </div>
                <div className="p-2 space-y-2 min-h-[200px]">
                  {cards.map((p) => (
                    <Card
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "bg-northpeak-card border-northpeak-surface cursor-grab active:cursor-grabbing transition-opacity select-none",
                        draggingId === p.id && "opacity-40"
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVertical className="h-3.5 w-3.5 text-northpeak-text-muted/40 flex-shrink-0" />
                            <p className="font-semibold text-sm text-northpeak-text leading-tight truncate">{p.nombre_negocio}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {isStale(p) && (
                              <span title="Sin movimiento">
                                <AlertTriangle className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                              </span>
                            )}
                            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0", nivelColor(p.nivel))}>
                              {p.nivel}
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] text-northpeak-text-muted space-y-0.5 mb-2">
                          <p className="truncate">{p.giro} · {p.zona}</p>
                          {p.contacto && <p className="truncate">👤 {p.contacto}</p>}
                          <p className="text-amber-400/80 truncate">🤝 {getSocioNombre(p.Socio_id)}</p>
                          <p>Score: <span className="text-northpeak-text font-medium">{p.score}</span></p>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {p.cuestionario_token && (
                            <button
                              onClick={() => copyLink(`/cuestionario/${p.cuestionario_token}`)}
                              className="flex items-center gap-1 text-[10px] px-1.5 py-1 rounded-md bg-northpeak-surface text-northpeak-text-muted hover:text-northpeak-text transition-colors"
                            >
                              {copied === `/cuestionario/${p.cuestionario_token}` ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                              Link
                            </button>
                          )}
                          {p.telefono && (
                            <button
                              onClick={() => openWhatsApp(p.telefono!, p.nombre_negocio, p.cuestionario_token)}
                              className="flex items-center gap-1 text-[10px] px-1.5 py-1 rounded-md bg-northpeak-surface text-northpeak-text-muted hover:text-green-400 transition-colors"
                            >
                              <MessageCircle className="h-3 w-3" />
                              WA
                            </button>
                          )}
                          <a
                            href={`/api/reporte/${p.id}`}
                            target="_blank"
                            className="flex items-center gap-1 text-[10px] px-1.5 py-1 rounded-md bg-northpeak-surface text-northpeak-text-muted hover:text-northpeak-text transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Reporte
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {cards.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-northpeak-text-muted/40">
                      Sin prospectos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

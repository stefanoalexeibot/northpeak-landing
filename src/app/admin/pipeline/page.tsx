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
  Send,
  Clock,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EtapaProspecto } from "@/lib/types";

interface ProspectoCard {
  id: string;
  nombre_negocio: string;
  giro: string;
  zona: string;
  score: number;
  nivel: string;
  report_url: string;
  etapa: EtapaProspecto;
  contacto?: string;
  telefono?: string;
  cuestionario_token?: string;
  vendedor?: string;
  etapa_updated_at?: string;
  created_at: string;
}

const COLUMNAS: { etapa: EtapaProspecto; label: string; color: string; dotColor: string }[] = [
  { etapa: "nuevo", label: "Nuevos", color: "border-gray-500/30", dotColor: "bg-gray-400" },
  { etapa: "cuestionario_enviado", label: "Cuestionario enviado", color: "border-blue-500/30", dotColor: "bg-blue-400" },
  { etapa: "cuestionario_completado", label: "Cotización lista", color: "border-emerald-500/30", dotColor: "bg-emerald-400" },
  { etapa: "en_negociacion", label: "En negociación", color: "border-yellow-500/30", dotColor: "bg-yellow-400" },
  { etapa: "cerrado_ganado", label: "Ganados", color: "border-green-500/30", dotColor: "bg-green-400" },
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

export default function PipelinePage() {
  const { addToast } = useToast();
  const [prospectos, setProspectos] = useState<ProspectoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverEtapa, setDragOverEtapa] = useState<string | null>(null);
  const [vendedorFilter, setVendedorFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMessage, setBulkMessage] = useState("");
  const [showBulkWA, setShowBulkWA] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProspectos();
  }, []);

  async function loadProspectos() {
    try {
      const res = await fetch("/api/admin/analisis");
      if (res.ok) {
        setProspectos(await res.json());
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  async function deleteProspecto(id: string) {
    if (!confirm("¿Eliminar este prospecto del pipeline?")) return;
    // Optimistic update
    setProspectos(prev => prev.filter(p => p.id !== id));
    try {
      await fetch("/api/admin/analisis", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      // Reload on failure
      loadProspectos();
    }
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
        loadProspectos();
      }
    } catch {
      addToast("Error de conexión", "error");
      loadProspectos();
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

  function handleDragLeave() {
    setDragOverEtapa(null);
  }

  function handleDrop(e: React.DragEvent, etapa: EtapaProspecto) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setDraggingId(null);
    setDragOverEtapa(null);
    if (id) {
      const current = prospectos.find((p) => p.id === id);
      if (current && current.etapa !== etapa) {
        updateEtapa(id, etapa);
      }
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
    addToast("Link copiado", "success");
    setTimeout(() => setCopied(null), 2000);
  }

  function sendWhatsApp(p: ProspectoCard) {
    if (!p.cuestionario_token) return;
    const url = `${window.location.origin}/cuestionario/${p.cuestionario_token}`;
    const msg = `Hola${p.contacto ? ` ${p.contacto}` : ""}, te preparamos un análisis digital de *${p.nombre_negocio}*.\n\nPara darte una cotización personalizada, contesta estas preguntas rápidas (2 min):\n${url}\n\n— NorthPeak Digital`;
    const waUrl = `https://wa.me/${p.telefono ? p.telefono.replace(/\D/g, "") : ""}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function sendBulkWhatsApp() {
    const selected = prospectos.filter((p) => selectedIds.has(p.id) && p.telefono);
    for (const p of selected) {
      const msg = bulkMessage
        .replace("{nombre}", p.contacto || "")
        .replace("{negocio}", p.nombre_negocio);
      const waUrl = `https://wa.me/${p.telefono!.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");
    }
    addToast(`Abriendo ${selected.length} conversaciones`, "success");
    setSelectedIds(new Set());
    setShowBulkWA(false);
    setBulkMessage("");
  }

  // Filter by vendedor
  const vendedores = Array.from(new Set(prospectos.map((p) => p.vendedor).filter(Boolean))) as string[];
  const filtered = vendedorFilter
    ? prospectos.filter((p) => p.vendedor === vendedorFilter)
    : prospectos;

  // Count stale prospects
  const staleCount = prospectos.filter(isStale).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-northpeak-text-dim" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">
            Pipeline de Prospectos
          </h1>
          <p className="text-northpeak-text-muted mt-1 text-sm">
            Arrastra las tarjetas entre columnas para actualizar el estado
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button
              size="sm"
              onClick={() => { setShowBulkWA(true); setBulkMessage("Hola {nombre}, seguimos con la propuesta de *{negocio}* disponible. ¿Te interesa agendar una llamada?"); }}
              className="bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              <Send className="h-3 w-3 mr-1.5" />
              WhatsApp ({selectedIds.size})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "border-northpeak-surface text-northpeak-text-muted text-xs",
              showFilters && "bg-northpeak-surface"
            )}
          >
            <Filter className="h-3 w-3 mr-1.5" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Stale alert */}
      {staleCount > 0 && (
        <div className="flex items-center gap-2 bg-yellow-400/5 border border-yellow-400/20 rounded-lg px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
          <span className="text-sm text-yellow-400">
            <strong>{staleCount}</strong> prospecto{staleCount > 1 ? "s" : ""} sin seguimiento hace {STALE_DAYS}+ días
          </span>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 bg-northpeak-card border border-northpeak-surface rounded-lg p-3">
          <div className="space-y-1">
            <span className="text-xs text-northpeak-text-dim">Vendedor</span>
            <select
              value={vendedorFilter}
              onChange={(e) => setVendedorFilter(e.target.value)}
              className="flex h-8 rounded-md border border-northpeak-surface bg-northpeak-bg px-2 text-sm text-northpeak-text"
            >
              <option value="">Todos</option>
              {vendedores.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Bulk WhatsApp modal */}
      {showBulkWA && (
        <div className="bg-northpeak-card border border-northpeak-surface rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-northpeak-text">
              Mensaje masivo ({selectedIds.size} prospectos)
            </span>
            <Button variant="ghost" size="sm" onClick={() => setShowBulkWA(false)} className="text-northpeak-text-muted h-7">
              Cancelar
            </Button>
          </div>
          <p className="text-xs text-northpeak-text-dim">
            Usa {"{nombre}"} y {"{negocio}"} como variables
          </p>
          <textarea
            value={bulkMessage}
            onChange={(e) => setBulkMessage(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-northpeak-surface bg-northpeak-bg px-3 py-2 text-sm text-northpeak-text resize-none"
          />
          <Button
            size="sm"
            onClick={sendBulkWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1.5" />
            Enviar a {selectedIds.size} prospectos
          </Button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {COLUMNAS.map((col) => {
          const count = filtered.filter((p) => p.etapa === col.etapa).length;
          const staleInCol = filtered.filter((p) => p.etapa === col.etapa && isStale(p)).length;
          return (
            <div key={col.etapa} className="bg-northpeak-card border border-northpeak-surface rounded-lg p-3 text-center relative">
              <div className="text-lg font-heading font-bold text-northpeak-text">{count}</div>
              <div className="text-[10px] text-northpeak-text-dim uppercase tracking-wider">{col.label}</div>
              {staleInCol > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-400 text-[9px] font-bold px-1">
                  {staleInCol}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-2 px-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {COLUMNAS.map((col) => {
          const items = filtered.filter((p) => p.etapa === col.etapa);
          const isOver = dragOverEtapa === col.etapa;

          return (
            <div
              key={col.etapa}
              className={cn(
                "flex-shrink-0 w-60 sm:w-68 md:w-72 rounded-xl border-2 transition-colors",
                isOver ? col.color.replace("/30", "/60") + " bg-northpeak-card/50" : "border-transparent"
              )}
              onDragOver={(e) => handleDragOver(e, col.etapa)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.etapa)}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-3 py-3">
                <span className={cn("w-2.5 h-2.5 rounded-full", col.dotColor)} />
                <span className="text-sm font-medium text-northpeak-text">{col.label}</span>
                <span className="text-xs text-northpeak-text-dim ml-auto">{items.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2 px-1 pb-2 min-h-[120px]">
                {items.length === 0 && (
                  <div className="text-center py-8 text-xs text-northpeak-text-dim">
                    Sin prospectos
                  </div>
                )}
                {items.map((p) => {
                  const stale = isStale(p);
                  const selected = selectedIds.has(p.id);
                  const daysSinceUpdate = daysAgo(p.etapa_updated_at || p.created_at);

                  return (
                    <Card
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "bg-northpeak-card border-northpeak-surface cursor-grab active:cursor-grabbing transition-all",
                        draggingId === p.id && "opacity-40 scale-95",
                        stale && "border-yellow-400/30",
                        selected && "ring-1 ring-northpeak-green"
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <GripVertical className="h-4 w-4 text-northpeak-text-dim mt-0.5" />
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleSelect(p.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-northpeak-surface bg-northpeak-bg text-northpeak-green focus:ring-northpeak-green h-3.5 w-3.5"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-northpeak-text truncate">
                                {p.nombre_negocio}
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0",
                                  nivelColor(p.nivel)
                                )}
                              >
                                {p.score}
                              </span>
                            </div>
                            <p className="text-xs text-northpeak-text-muted truncate">
                              {p.giro} · {p.zona}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] text-northpeak-text-dim">
                                {new Date(p.created_at).toLocaleDateString("es-MX", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                              {p.vendedor && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-northpeak-surface text-northpeak-text-dim">
                                  {p.vendedor}
                                </span>
                              )}
                              {stale && (
                                <span className="flex items-center gap-0.5 text-[9px] text-yellow-400">
                                  <Clock className="h-2.5 w-2.5" />
                                  {daysSinceUpdate}d
                                </span>
                              )}
                            </div>
                            {/* Quick actions */}
                            <div className="flex gap-1 mt-2">
                              {p.cuestionario_token && (col.etapa === "nuevo" || col.etapa === "cuestionario_enviado") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); sendWhatsApp(p); }}
                                  className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                                  title="Enviar cuestionario por WhatsApp"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); copyLink(p.report_url); }}
                                className="h-6 w-6 p-0 text-northpeak-text-dim hover:text-northpeak-text"
                                title="Copiar link reporte"
                              >
                                {copied === p.report_url ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                              <a href={p.report_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-northpeak-text-dim hover:text-northpeak-green"
                                  title="Ver reporte"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); deleteProspecto(p.id); }}
                                className="h-6 w-6 p-0 text-northpeak-text-dim hover:text-red-400"
                                title="Eliminar prospecto"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

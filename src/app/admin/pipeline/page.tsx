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

function nivelColor(nivel: string) {
  if (nivel === "CRITICO") return "text-red-400 bg-red-400/10";
  if (nivel === "BAJO") return "text-yellow-400 bg-yellow-400/10";
  if (nivel === "MEDIO") return "text-blue-400 bg-blue-400/10";
  return "text-green-400 bg-green-400/10";
}

export default function PipelinePage() {
  const { addToast } = useToast();
  const [prospectos, setProspectos] = useState<ProspectoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverEtapa, setDragOverEtapa] = useState<string | null>(null);
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

  const updateEtapa = useCallback(async (id: string, etapa: EtapaProspecto) => {
    // Optimistic update
    setProspectos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, etapa } : p))
    );

    try {
      const res = await fetch("/api/admin/analisis", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, etapa }),
      });
      if (!res.ok) {
        addToast("Error al mover prospecto", "error");
        loadProspectos(); // Revert
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-northpeak-text-dim" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">
          Pipeline de Prospectos
        </h1>
        <p className="text-northpeak-text-muted mt-1 text-sm">
          Arrastra las tarjetas entre columnas para actualizar el estado
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {COLUMNAS.map((col) => {
          const count = prospectos.filter((p) => p.etapa === col.etapa).length;
          return (
            <div key={col.etapa} className="bg-northpeak-card border border-northpeak-surface rounded-lg p-3 text-center">
              <div className="text-lg font-heading font-bold text-northpeak-text">{count}</div>
              <div className="text-[10px] text-northpeak-text-dim uppercase tracking-wider">{col.label}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {COLUMNAS.map((col) => {
          const items = prospectos.filter((p) => p.etapa === col.etapa);
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
                {items.map((p) => (
                  <Card
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "bg-northpeak-card border-northpeak-surface cursor-grab active:cursor-grabbing transition-all",
                      draggingId === p.id && "opacity-40 scale-95"
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-northpeak-text-dim shrink-0 mt-0.5" />
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
                          <p className="text-[10px] text-northpeak-text-dim mt-1">
                            {new Date(p.created_at).toLocaleDateString("es-MX", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
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
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

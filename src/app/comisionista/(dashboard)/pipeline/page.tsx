"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Loader2,
  GripVertical,
  Filter,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Socio {
  id: string;
  nombre: string;
}

interface Prospecto {
  id: string;
  socio_id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  descripcion?: string;
  etapa: "nuevo" | "contactado" | "interesado" | "negociacion" | "ganado" | "perdido";
  monto_potencial?: number;
  fuente?: string;
  notas?: string;
  created_at: string;
  socios?: { nombre: string };
}

const COLUMNAS: { etapa: string; label: string; borderClass: string; dotClass: string }[] = [
  { etapa: "nuevo", label: "Nuevos", borderClass: "border-blue-500/20", dotClass: "bg-blue-400" },
  { etapa: "contactado", label: "Contactados", borderClass: "border-indigo-500/20", dotClass: "bg-indigo-400" },
  { etapa: "interesado", label: "Interesados", borderClass: "border-purple-500/20", dotClass: "bg-purple-400" },
  { etapa: "negociacion", label: "En Negociación", borderClass: "border-yellow-500/20", dotClass: "bg-yellow-400" },
  { etapa: "ganado", label: "Ganados 🎉", borderClass: "border-emerald-500/20", dotClass: "bg-emerald-400" },
  { etapa: "perdido", label: "Perdidos", borderClass: "border-red-500/20", dotClass: "bg-red-400" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export default function PipelinePage() {
  const { addToast } = useToast();
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverEtapa, setDragOverEtapa] = useState<string | null>(null);
  const [socioFilter, setSocioFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [resPros, resSocios] = await Promise.all([
        fetch("/api/comisionista/prospectos"),
        fetch("/api/comisionista/socios")
      ]);
      if (resPros.ok) setProspectos(await resPros.json());
      if (resSocios.ok) setSocios(await resSocios.json());
    } catch {
      addToast("Error al cargar pipeline", "error");
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleUpdateEtapa(id: string, etapa: string) {
    const res = await fetch("/api/comisionista/prospectos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, etapa }),
    });

    if (res.ok) {
      addToast("Etapa actualizada", "success");
      // Optimistic update
      setProspectos(prev => prev.map(p => p.id === id ? { ...p, etapa: etapa as Prospecto["etapa"] } : p));
    } else {
      addToast("Error al mover prospecto", "error");
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverEtapa(null);
  };

  const handleDragOver = (e: React.DragEvent, etapa: string) => {
    e.preventDefault();
    if (dragOverEtapa !== etapa) {
      setDragOverEtapa(etapa);
    }
  };

  const handleDrop = async (e: React.DragEvent, etapa: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      const current = prospectos.find(p => p.id === id);
      if (current && current.etapa !== etapa) {
        await handleUpdateEtapa(id, etapa);
      }
    }
    setDragOverEtapa(null);
    setDraggingId(null);
  };

  const filteredProspectos = prospectos.filter(p => {
    if (socioFilter && p.socio_id !== socioFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pipeline de Ventas</h1>
          <p className="text-white/40 text-sm mt-1">Arrastra y suelta los prospectos para actualizar su etapa en el embudo.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "border border-white/5 text-white/70 hover:text-white flex items-center gap-2",
              showFilters && "bg-white/[0.04]"
            )}
          >
            <Filter className="w-4 h-4" /> Filtros
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="bg-white/[0.02] border-white/10 text-white flex-shrink-0">
          <CardContent className="p-4 flex gap-4 items-end">
            <div className="space-y-2 flex-1 max-w-xs">
              <Label className="text-white/60 text-xs">Filtrar por Socio Comercial</Label>
              <select
                value={socioFilter}
                onChange={(e) => setSocioFilter(e.target.value)}
                className="w-full bg-[#0c0c0c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Todos los Socios</option>
                {socios.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            {socioFilter && (
              <Button variant="ghost" onClick={() => setSocioFilter("")} className="text-white/40 hover:text-white">
                Limpiar <X className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex gap-4 h-full min-w-[1200px]">
            {COLUMNAS.map((col) => {
              const columnProspects = filteredProspectos.filter(p => p.etapa === col.etapa);
              
              return (
                <div
                  key={col.etapa}
                  onDragOver={(e) => handleDragOver(e, col.etapa)}
                  onDrop={(e) => handleDrop(e, col.etapa)}
                  className={cn(
                    "flex flex-col w-72 rounded-2xl bg-white/[0.01] border border-white/5 p-4 transition-all duration-200",
                    dragOverEtapa === col.etapa && "bg-white/[0.03] border-amber-500/30"
                  )}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", col.dotClass)} />
                      <h3 className="font-semibold text-sm text-white">{col.label}</h3>
                    </div>
                    <span className="text-xs text-white/30 font-medium bg-white/[0.04] px-2 py-0.5 rounded-full">
                      {columnProspects.length}
                    </span>
                  </div>

                  {/* Column Body (Scrollable) */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {columnProspects.map((p) => (
                      <div
                        key={p.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, p.id)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all cursor-grab active:cursor-grabbing",
                          draggingId === p.id && "opacity-40"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                            <h4 className="font-semibold text-sm text-white truncate">{p.nombre}</h4>
                          </div>
                        </div>

                        {p.descripcion && (
                          <p className="text-xs text-white/40 mt-2 line-clamp-2 bg-white/[0.01] p-1.5 rounded border border-white/[0.02]">
                            {p.descripcion}
                          </p>
                        )}

                        <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-[10px] text-white/40">
                            <span>Socio</span>
                            <span className="font-medium text-amber-400 truncate max-w-[120px]">
                              {p.socios?.nombre || "Socio"}
                            </span>
                          </div>
                          {p.monto_potencial && (
                            <div className="flex justify-between items-center text-[10px] text-white/40">
                              <span>Monto</span>
                              <span className="font-bold text-white">
                                {formatCurrency(p.monto_potencial)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

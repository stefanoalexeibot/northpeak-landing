"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Tarea } from "@/lib/types";

interface TareasListProps {
  clientId?: string;
  analisisId?: string;
}

export default function TareasList({ clientId, analisisId }: TareasListProps) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTareas = useCallback(async () => {
    const params = new URLSearchParams();
    if (clientId) params.set("client_id", clientId);
    if (analisisId) params.set("analisis_id", analisisId);

    const res = await fetch(`/api/admin/tareas?${params}`);
    if (res.ok) {
      const data: Tarea[] = await res.json();
      setTareas(data);
    }
    setLoading(false);
  }, [clientId, analisisId]);

  useEffect(() => {
    fetchTareas();
  }, [fetchTareas]);

  const addTarea = async () => {
    const trimmed = texto.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);

    const body: Record<string, string> = { texto: trimmed };
    if (clientId) body.client_id = clientId;
    if (analisisId) body.analisis_id = analisisId;
    if (fechaLimite) body.fecha_limite = fechaLimite;

    const res = await fetch("/api/admin/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const newTarea: Tarea = await res.json();
      setTareas((prev) => [newTarea, ...prev]);
      setTexto("");
      setFechaLimite("");
    }
    setSubmitting(false);
  };

  const toggleCompletada = async (tarea: Tarea) => {
    const res = await fetch("/api/admin/tareas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: tarea.id, completada: !tarea.completada }),
    });

    if (res.ok) {
      setTareas((prev) =>
        prev.map((t) =>
          t.id === tarea.id ? { ...t, completada: !t.completada } : t
        )
      );
    }
  };

  const deleteTarea = async (id: string) => {
    const res = await fetch("/api/admin/tareas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setTareas((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Sort: pending first, completed last
  const sorted = [...tareas].sort((a, b) => {
    if (a.completada !== b.completada) return a.completada ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const pendingCount = tareas.filter((t) => !t.completada).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#E8E9ED]">
          Tareas
          {tareas.length > 0 && (
            <span className="ml-2 text-xs font-normal text-[#E8E9ED]/50">
              {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
            </span>
          )}
        </h3>
      </div>

      {/* Add task input */}
      <div className="flex gap-2">
        <Input
          placeholder="Nueva tarea..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTarea();
          }}
          disabled={submitting}
          className="h-8 flex-1 border-[#161821] bg-[#0C0D12] text-sm text-[#E8E9ED] placeholder:text-[#E8E9ED]/30 focus-visible:ring-[#00E5A0]/40"
        />
        <input
          type="date"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
          className="h-8 w-[120px] rounded-md border border-[#161821] bg-[#0C0D12] px-2 text-xs text-[#E8E9ED]/70 focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/40 [&::-webkit-calendar-picker-indicator]:invert"
        />
        <button
          onClick={addTarea}
          disabled={!texto.trim() || submitting}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#00E5A0] text-sm font-bold text-[#05060A] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          +
        </button>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="py-4 text-center text-xs text-[#E8E9ED]/40">
          Cargando...
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-4 text-center text-xs text-[#E8E9ED]/40">
          Sin tareas
        </div>
      ) : (
        <ul className="space-y-0.5">
          {sorted.map((tarea) => (
            <li
              key={tarea.id}
              className="group flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-[#161821]/60"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleCompletada(tarea)}
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  tarea.completada
                    ? "border-[#00E5A0] bg-[#00E5A0]"
                    : "border-[#E8E9ED]/20 hover:border-[#00E5A0]/60"
                }`}
              >
                {tarea.completada && (
                  <svg
                    className="h-3 w-3 text-[#05060A]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              {/* Text + date */}
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className={`text-sm leading-tight ${
                    tarea.completada
                      ? "text-[#E8E9ED]/30 line-through"
                      : "text-[#E8E9ED]"
                  }`}
                >
                  {tarea.texto}
                </span>
                {tarea.fecha_limite && (
                  <span
                    className={`mt-0.5 text-[10px] ${
                      tarea.completada
                        ? "text-[#E8E9ED]/20"
                        : isOverdue(tarea.fecha_limite)
                          ? "text-red-400"
                          : "text-[#00E5A0]/60"
                    }`}
                  >
                    {formatDate(tarea.fecha_limite)}
                  </span>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={() => deleteTarea(tarea.id)}
                className="mt-0.5 shrink-0 text-[#E8E9ED]/0 transition-colors group-hover:text-[#E8E9ED]/30 hover:!text-red-400"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function isOverdue(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + "T00:00:00");
  return date < today;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

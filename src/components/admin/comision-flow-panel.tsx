"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Handshake,
  DollarSign,
  CheckCheck,
  AlertCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Socio {
  id: string;
  nombre: string;
  porcentaje_comision: number;
}

interface Task {
  id: string;
  label: string;
  done: boolean;
  done_at: string | null;
  sort_order: number;
}

interface Comision {
  id: string;
  nombre_negocio: string;
  monto_venta: number;
  porcentaje_aplicado: number;
  monto_comision: number;
  status: "pendiente" | "pagada" | "cancelada";
  paid_at: string | null;
  notas: string | null;
}

interface FlowData {
  socio_id: string | null;
  comision_id: string | null;
  socios: Socio[];
  tasks: Task[];
  comision: Comision | null;
  socio: Socio | null;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

// Task index for "Primer pago recibido" — this triggers comision registration
const SALE_CLOSED_STEP = 4; // 0-indexed
// Task index for "Comision calculada y registrada"
const COMISION_REGISTERED_STEP = 5;
// Task index for "Comision pagada"
const COMISION_PAID_STEP = 6;

export default function ComisionFlowPanel({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [data, setData] = useState<FlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [showSocioDropdown, setShowSocioDropdown] = useState(false);

  // Comision form state
  const [showComisionForm, setShowComisionForm] = useState(false);
  const [montoVenta, setMontoVenta] = useState("");
  const [porcentaje, setPorcentaje] = useState("");
  const [notasCom, setNotasCom] = useState("");
  const [savingComision, setSavingComision] = useState(false);

  // Marking paid state
  const [markingPaid, setMarkingPaid] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/comision-flow?client_id=${clientId}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        // Pre-fill porcentaje from linked socio
        if (d.socio?.porcentaje_comision) {
          setPorcentaje(d.socio.porcentaje_comision.toString());
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [clientId]);

  useEffect(() => { loadData(); }, [loadData]);

  async function toggleTask(task: Task) {
    setToggling(task.id);
    const res = await fetch("/api/admin/comision-flow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_task", task_id: task.id, done: !task.done }),
    });
    if (res.ok) {
      const updated = await res.json();
      setData(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(t => t.id === task.id ? updated : t),
      } : prev);

      // If the sale closed step was just checked and no comision exists yet, show form
      if (task.sort_order === SALE_CLOSED_STEP && !task.done && !data?.comision_id) {
        setShowComisionForm(true);
      }
    }
    setToggling(null);
  }

  async function linkSocio(socioId: string | null) {
    if (!data) return;
    setLinkingLoading(true);
    const res = await fetch("/api/admin/comision-flow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "link_socio", client_id: clientId, socio_id: socioId }),
    });
    if (res.ok) {
      const newSocio = socioId ? data.socios.find(s => s.id === socioId) ?? null : null;
      setData(prev => prev ? {
        ...prev,
        socio_id: socioId,
        socio: newSocio,
      } : prev);
      if (newSocio) {
        setPorcentaje(newSocio.porcentaje_comision.toString());
      }
    }
    setLinkingLoading(false);
    setShowSocioDropdown(false);
  }

  async function registerComision() {
    if (!data?.socio_id || !montoVenta || !porcentaje) return;
    setSavingComision(true);
    const res = await fetch("/api/admin/comision-flow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        socio_id: data.socio_id,
        nombre_negocio: clientName,
        monto_venta: parseFloat(montoVenta),
        porcentaje_aplicado: parseFloat(porcentaje),
        notas: notasCom || null,
      }),
    });
    if (res.ok) {
      const comision = await res.json();
      setData(prev => prev ? { ...prev, comision, comision_id: comision.id } : prev);
      setShowComisionForm(false);
      // Auto-mark step 5 (Comision calculada)
      const step5 = data?.tasks.find(t => t.sort_order === COMISION_REGISTERED_STEP);
      if (step5 && !step5.done) {
        await toggleTask(step5);
      }
    }
    setSavingComision(false);
  }

  async function markComisionPaid() {
    if (!data?.comision_id) return;
    setMarkingPaid(true);
    const res = await fetch("/api/admin/comision-flow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_comision_pagada", comision_id: data.comision_id }),
    });
    if (res.ok) {
      const updated = await res.json();
      setData(prev => prev ? { ...prev, comision: updated } : prev);
      // Auto-mark step 6 (Comision pagada)
      const step6 = data?.tasks.find(t => t.sort_order === COMISION_PAID_STEP);
      if (step6 && !step6.done) {
        await toggleTask(step6);
      }
    }
    setMarkingPaid(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-northpeak-text-muted" />
      </div>
    );
  }

  if (!data) return null;

  const doneTasks = data.tasks.filter(t => t.done).length;
  const totalTasks = data.tasks.length;
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const comisionStatus = data.comision?.status;
  const saleClosed = data.tasks.find(t => t.sort_order === SALE_CLOSED_STEP)?.done;

  return (
    <div className="space-y-5">
      {/* Socio Vinculado */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Handshake className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-northpeak-text">
            {data.socio ? (
              <span>Referido por <span className="text-amber-400">{data.socio.nombre}</span> ({data.socio.porcentaje_comision}%)</span>
            ) : (
              <span className="text-northpeak-text-muted">Sin comisionista asignado</span>
            )}
          </span>
        </div>

        <div className="relative flex items-center gap-2">
          {/* Comision Status Badge */}
          {comisionStatus && (
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
              comisionStatus === "pagada"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : comisionStatus === "pendiente"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              {comisionStatus === "pagada" ? "✓ Comisión Pagada" : comisionStatus === "pendiente" ? "⏳ Comisión Pendiente" : "Cancelada"}
            </span>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSocioDropdown(!showSocioDropdown)}
            disabled={linkingLoading}
            className="text-xs text-northpeak-text-muted hover:text-northpeak-text border border-northpeak-surface h-8 px-2.5"
          >
            {linkingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {data.socio ? "Cambiar" : "Asignar Comisionista"}
          </Button>

          {showSocioDropdown && (
            <div className="absolute right-0 top-9 z-50 w-64 bg-[#1a1a1a] border border-northpeak-surface rounded-xl shadow-2xl p-2">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-northpeak-surface mb-1">
                <span className="text-xs text-northpeak-text-muted font-medium">Selecciona un socio</span>
                <button onClick={() => setShowSocioDropdown(false)} className="text-northpeak-text-muted hover:text-northpeak-text">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {data.socios.length === 0 ? (
                <p className="text-xs text-northpeak-text-muted px-2 py-1">No hay socios activos</p>
              ) : (
                data.socios.map(s => (
                  <button
                    key={s.id}
                    onClick={() => linkSocio(s.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors flex justify-between items-center",
                      data.socio_id === s.id && "bg-amber-500/10 text-amber-400"
                    )}
                  >
                    <span className="text-northpeak-text">{s.nombre}</span>
                    <span className="text-xs text-northpeak-text-muted">{s.porcentaje_comision}%</span>
                  </button>
                ))
              )}
              {data.socio_id && (
                <button
                  onClick={() => linkSocio(null)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors mt-1 border-t border-northpeak-surface pt-2"
                >
                  Quitar comisionista
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-northpeak-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-mono text-northpeak-text-muted whitespace-nowrap">
          {doneTasks}/{totalTasks}
        </span>
      </div>

      {/* Steps Checklist */}
      <div className="space-y-1">
        {data.tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task)}
            disabled={toggling === task.id}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left group",
              task.done
                ? "bg-amber-500/8 hover:bg-amber-500/12"
                : "hover:bg-northpeak-surface"
            )}
          >
            {toggling === task.id ? (
              <Loader2 className="h-4 w-4 animate-spin text-northpeak-text-muted flex-shrink-0" />
            ) : task.done ? (
              <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-northpeak-text-dim flex-shrink-0 group-hover:text-northpeak-text-muted" />
            )}
            <span className={cn(
              "text-sm flex-1",
              task.done ? "line-through text-northpeak-text-muted" : "text-northpeak-text"
            )}>
              {task.label}
            </span>
            {task.done_at && (
              <span className="text-[10px] text-northpeak-text-dim ml-2">
                {new Date(task.done_at).toLocaleDateString("es-MX")}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Comision Form — appears when sale closed step is checked and no comision exists */}
      {saleClosed && !data.comision_id && (
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Registrar Comisión</h4>
          </div>
          <p className="text-xs text-northpeak-text-muted">
            ¡Venta cerrada! Registra el monto de la venta para calcular automáticamente la comisión de <span className="text-amber-400 font-semibold">{data.socio?.nombre ?? "el comisionista"}</span>.
          </p>

          {!data.socio_id ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Primero asigna un comisionista para poder registrar la comisión.
            </div>
          ) : (
            <>
              {showComisionForm ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-northpeak-text-muted">Monto Total de Venta (MXN)</Label>
                      <Input
                        type="number"
                        value={montoVenta}
                        onChange={e => setMontoVenta(e.target.value)}
                        placeholder="Ej. 2500000"
                        className="bg-northpeak-surface border-northpeak-surface text-northpeak-text text-sm h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-northpeak-text-muted">% de Comisión</Label>
                      <Input
                        type="number"
                        value={porcentaje}
                        onChange={e => setPorcentaje(e.target.value)}
                        placeholder="10"
                        className="bg-northpeak-surface border-northpeak-surface text-northpeak-text text-sm h-9"
                      />
                    </div>
                  </div>
                  {montoVenta && porcentaje && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
                      <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-northpeak-text-muted">Comisión a pagar: </span>
                      <span className="text-base font-bold text-emerald-400 ml-1">
                        {formatCurrency((parseFloat(montoVenta) * parseFloat(porcentaje)) / 100)}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-northpeak-text-muted">Notas (opcional)</Label>
                    <Input
                      value={notasCom}
                      onChange={e => setNotasCom(e.target.value)}
                      placeholder="Detalles adicionales sobre esta comisión..."
                      className="bg-northpeak-surface border-northpeak-surface text-northpeak-text text-sm h-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={registerComision}
                      disabled={savingComision || !montoVenta || !porcentaje}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                    >
                      {savingComision ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                      Registrar Comisión
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowComisionForm(false)} className="text-northpeak-text-muted">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setShowComisionForm(true)}
                  className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/20 font-medium"
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                  Registrar Comisión Ahora
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Comision Card — shows when comision exists */}
      {data.comision && (
        <div className={cn(
          "border rounded-xl p-4 space-y-3",
          data.comision.status === "pagada"
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-amber-500/20 bg-amber-500/5"
        )}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-northpeak-text-muted uppercase tracking-wider font-semibold mb-1">Comisión Registrada</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-400">{formatCurrency(data.comision.monto_comision)}</span>
                <span className="text-xs text-northpeak-text-muted">({data.comision.porcentaje_aplicado}% de {formatCurrency(data.comision.monto_venta)})</span>
              </div>
              {data.comision.status === "pagada" && data.comision.paid_at && (
                <p className="text-xs text-emerald-400 mt-1">
                  ✓ Pagada el {new Date(data.comision.paid_at).toLocaleDateString("es-MX")}
                </p>
              )}
            </div>
            {data.comision.status === "pendiente" && (
              <Button
                size="sm"
                onClick={markComisionPaid}
                disabled={markingPaid}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs"
              >
                {markingPaid ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCheck className="w-3.5 h-3.5 mr-1.5" />}
                Marcar como Pagada
              </Button>
            )}
          </div>
          {data.comision.notas && (
            <p className="text-xs text-northpeak-text-muted italic border-t border-white/5 pt-2">{data.comision.notas}</p>
          )}
        </div>
      )}
    </div>
  );
}

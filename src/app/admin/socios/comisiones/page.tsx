"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  DollarSign,
  Loader2,
  Plus,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Handshake,
  Filter,
  Trash2,
  Percent,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Comision, Socio } from "@/lib/types";

interface ComisionWithJoin extends Comision {
  Socios?: { nombre: string; email: string } | null;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
    timeZone: "America/Monterrey",
  });
}

const STATUS_CONFIG = {
  pendiente: { label: "Pendiente", icon: Clock, color: "text-yellow-400 bg-yellow-400/10", dot: "bg-yellow-400" },
  pagada: { label: "Pagada", icon: CheckCircle2, color: "text-green-400 bg-green-400/10", dot: "bg-green-400" },
  cancelada: { label: "Cancelada", icon: XCircle, color: "text-red-400 bg-red-400/10", dot: "bg-red-400" },
};

export default function ComisionesPage() {
  const { addToast } = useToast();
  const [comisiones, setComisiones] = useState<ComisionWithJoin[]>([]);
  const [Socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterSocio, setFilterSocio] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formSocioId, setFormSocioId] = useState("");
  const [formNegocio, setFormNegocio] = useState("");
  const [formMontoVenta, setFormMontoVenta] = useState("");
  const [formPorcentaje, setFormPorcentaje] = useState("");
  const [formNotas, setFormNotas] = useState("");

  const montoCalculado = formMontoVenta && formPorcentaje
    ? (parseFloat(formMontoVenta) * parseFloat(formPorcentaje)) / 100
    : null;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterSocio) params.append("Socio_id", filterSocio);
      if (filterStatus) params.append("status", filterStatus);

      const [comisionesRes, SociosRes] = await Promise.all([
        fetch(`/api/admin/comisiones?${params}`),
        fetch("/api/admin/Socios"),
      ]);
      if (comisionesRes.ok) setComisiones(await comisionesRes.json());
      if (SociosRes.ok) setSocios(await SociosRes.json());
    } catch {
      addToast("Error al cargar datos", "error");
    }
    setLoading(false);
  }, [filterSocio, filterStatus, addToast]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-fill % when Socio changes
  useEffect(() => {
    const c = Socios.find((c) => c.id === formSocioId);
    if (c && !formPorcentaje) setFormPorcentaje(String(c.porcentaje_comision));
  }, [formSocioId, Socios, formPorcentaje]);

  async function handleCreate() {
    if (!formSocioId || !formNegocio || !formMontoVenta || !formPorcentaje) {
      addToast("Completa todos los campos requeridos", "error");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/comisiones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Socio_id: formSocioId,
        nombre_negocio: formNegocio,
        monto_venta: parseFloat(formMontoVenta),
        porcentaje_aplicado: parseFloat(formPorcentaje),
        notas: formNotas || null,
      }),
    });
    if (res.ok) {
      addToast("Comisión registrada", "success");
      setShowForm(false);
      setFormSocioId(""); setFormNegocio(""); setFormMontoVenta(""); setFormPorcentaje(""); setFormNotas("");
      loadData();
    } else {
      const err = await res.json();
      addToast(err.error || "Error al registrar", "error");
    }
    setSaving(false);
  }

  async function handleMarkPagada(id: string) {
    const res = await fetch("/api/admin/comisiones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "pagada" }),
    });
    if (res.ok) { addToast("Comisión marcada como pagada ✓", "success"); loadData(); }
    else addToast("Error", "error");
  }

  async function handleMarkCancelada(id: string) {
    if (!confirm("¿Cancelar esta comisión?")) return;
    const res = await fetch("/api/admin/comisiones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "cancelada" }),
    });
    if (res.ok) { addToast("Comisión cancelada", "success"); loadData(); }
    else addToast("Error", "error");
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta comisión?")) return;
    setDeletingId(id);
    const res = await fetch("/api/admin/comisiones", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { addToast("Eliminado", "success"); loadData(); }
    else addToast("Error al eliminar", "error");
    setDeletingId(null);
  }

  const totalPendiente = comisiones.filter((c) => c.status === "pendiente").reduce((s, c) => s + Number(c.monto_comision), 0);
  const totalPagado = comisiones.filter((c) => c.status === "pagada").reduce((s, c) => s + Number(c.monto_comision), 0);
  const totalVentas = comisiones.filter((c) => c.status !== "cancelada").reduce((s, c) => s + Number(c.monto_venta), 0);

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <DollarSign className="h-5 w-5 text-amber-400" />
            <h1 className="text-2xl font-heading font-bold text-northpeak-text">Comisiones</h1>
          </div>
          <p className="text-northpeak-text-muted text-sm">
            Registro de comisiones por ventas cerradas a través de Socios.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-400 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Registrar comisión
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-5">
            <p className="text-xs text-northpeak-text-muted mb-1">Total ventas generadas</p>
            <p className="text-2xl font-heading font-bold text-northpeak-text">{formatCurrency(totalVentas)}</p>
          </CardContent>
        </Card>
        <Card className="bg-northpeak-card border-yellow-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              <p className="text-xs text-northpeak-text-muted">Comisiones pendientes</p>
            </div>
            <p className="text-2xl font-heading font-bold text-yellow-400">{formatCurrency(totalPendiente)}</p>
          </CardContent>
        </Card>
        <Card className="bg-northpeak-card border-green-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <p className="text-xs text-northpeak-text-muted">Comisiones pagadas</p>
            </div>
            <p className="text-2xl font-heading font-bold text-green-400">{formatCurrency(totalPagado)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Form nueva comisión */}
      {showForm && (
        <Card className="mb-6 bg-northpeak-card border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-base text-northpeak-text">Registrar nueva comisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-northpeak-text-muted text-xs mb-1.5 block">Socio *</Label>
                <select
                  value={formSocioId}
                  onChange={(e) => { setFormSocioId(e.target.value); setFormPorcentaje(""); }}
                  className="w-full text-sm bg-northpeak-surface border border-northpeak-surface rounded-lg px-3 py-2 text-northpeak-text"
                >
                  <option value="">Seleccionar Socio</option>
                  {Socios.filter((c) => c.activo).map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.porcentaje_comision}%)</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-northpeak-text-muted text-xs mb-1.5 block">Nombre del negocio / cliente *</Label>
                <Input
                  value={formNegocio}
                  onChange={(e) => setFormNegocio(e.target.value)}
                  placeholder="Ej: Salon de belleza Liz"
                  className="bg-northpeak-surface border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div>
                <Label className="text-northpeak-text-muted text-xs mb-1.5 block">Monto de la venta (MXN) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={formMontoVenta}
                  onChange={(e) => setFormMontoVenta(e.target.value)}
                  placeholder="12000"
                  className="bg-northpeak-surface border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div>
                <Label className="text-northpeak-text-muted text-xs mb-1.5 block">% de comisión aplicado *</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formPorcentaje}
                    onChange={(e) => setFormPorcentaje(e.target.value)}
                    placeholder="10"
                    className="bg-northpeak-surface border-northpeak-surface text-northpeak-text pr-8"
                  />
                  <Percent className="absolute right-2.5 top-2.5 h-4 w-4 text-northpeak-text-muted" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-northpeak-text-muted text-xs mb-1.5 block">Notas</Label>
                <Input
                  value={formNotas}
                  onChange={(e) => setFormNotas(e.target.value)}
                  placeholder="Referencia de pago, detalles..."
                  className="bg-northpeak-surface border-northpeak-surface text-northpeak-text"
                />
              </div>
            </div>

            {montoCalculado !== null && (
              <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-northpeak-text">
                  Comisión calculada:{" "}
                  <span className="font-bold text-amber-400">{formatCurrency(montoCalculado)}</span>
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-white"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Registrar comisión
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-northpeak-surface text-northpeak-text-muted"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Filter className="h-4 w-4 text-northpeak-text-muted" />
        <select
          value={filterSocio}
          onChange={(e) => setFilterSocio(e.target.value)}
          className="text-sm bg-northpeak-surface border border-northpeak-surface rounded-lg px-3 py-1.5 text-northpeak-text"
        >
          <option value="">Todos los Socios</option>
          {Socios.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm bg-northpeak-surface border border-northpeak-surface rounded-lg px-3 py-1.5 text-northpeak-text"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        {(filterSocio || filterStatus) && (
          <button
            onClick={() => { setFilterSocio(""); setFilterStatus(""); }}
            className="text-xs text-northpeak-text-muted hover:text-northpeak-text flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Limpiar
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-northpeak-text-muted" />
        </div>
      ) : comisiones.length === 0 ? (
        <div className="text-center py-20 text-northpeak-text-muted">
          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No hay comisiones registradas</p>
          <p className="text-sm mt-1">Registra la primera cuando se cierre una venta.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comisiones.map((c) => {
            const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pendiente;
            const StatusIcon = statusCfg.icon;
            return (
              <Card key={c.id} className="bg-northpeak-card border-northpeak-surface">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-northpeak-text">{c.nombre_negocio}</p>
                        <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", statusCfg.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-northpeak-text-muted flex-wrap">
                        <span className="flex items-center gap-1">
                          <Handshake className="h-3 w-3" />
                          {c.Socios?.nombre || "—"}
                        </span>
                        <span>Venta: <span className="text-northpeak-text font-medium">{formatCurrency(Number(c.monto_venta))}</span></span>
                        <span><span className="text-northpeak-text-muted">{c.porcentaje_aplicado}%</span></span>
                        <span>Comisión: <span className="text-amber-400 font-bold">{formatCurrency(Number(c.monto_comision))}</span></span>
                        <span>{formatDate(c.created_at)}</span>
                        {c.paid_at && <span className="text-green-400">Pagado: {formatDate(c.paid_at)}</span>}
                      </div>
                      {c.notas && (
                        <p className="mt-1 text-xs text-northpeak-text-muted italic">{c.notas}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {c.status === "pendiente" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleMarkPagada(c.id)}
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-xs h-7"
                          >
                            <Check className="h-3 w-3 mr-1" /> Pagada
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkCancelada(c.id)}
                            className="text-northpeak-text-muted hover:text-red-400 text-xs h-7"
                          >
                            <X className="h-3 w-3 mr-1" /> Cancelar
                          </Button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="p-1.5 rounded-lg text-northpeak-text-muted hover:text-red-400 transition-colors"
                      >
                        {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  Building2,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Socio {
  id: string;
  nombre: string;
  porcentaje_comision: number;
}

interface Prospecto {
  id: string;
  nombre: string;
  socio_id: string;
  etapa: string;
}

interface Comision {
  id: string;
  socio_id: string;
  prospecto_id?: string;
  nombre_negocio: string;
  monto_venta: number;
  porcentaje_aplicado: number;
  monto_comision: number;
  status: "pendiente" | "pagada" | "cancelada";
  paid_at?: string;
  notas?: string;
  created_at: string;
  socios?: { nombre: string };
  prospectos?: { nombre: string };
}

const STATUS_CONFIG: Record<string, { label: string; bgClass: string; textClass: string; icon: React.ElementType }> = {
  pendiente: { label: "Por Cobrar", bgClass: "bg-yellow-500/10 border-yellow-500/20", textClass: "text-yellow-400", icon: Clock },
  pagada: { label: "Cobrada ✓", bgClass: "bg-emerald-500/10 border-emerald-500/20", textClass: "text-emerald-400", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", bgClass: "bg-red-500/10 border-red-500/20", textClass: "text-red-400", icon: AlertOctagon },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export default function ComisionesPage() {
  const { addToast } = useToast();
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New form
  const [showForm, setShowForm] = useState(false);
  const [newSocioId, setNewSocioId] = useState("");
  const [newProspectoId, setNewProspectoId] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newMonto, setNewMonto] = useState("");
  const [newPorcentaje, setNewPorcentaje] = useState("");
  const [newStatus, setNewStatus] = useState("pendiente");
  const [newNotas, setNewNotas] = useState("");

  // Edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSocioId, setEditSocioId] = useState("");
  const [editProspectoId, setEditProspectoId] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editMonto, setEditMonto] = useState("");
  const [editPorcentaje, setEditPorcentaje] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editNotas, setEditNotas] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resCom, resSocios, resPros] = await Promise.all([
        fetch("/api/comisionista/comisiones"),
        fetch("/api/comisionista/socios"),
        fetch("/api/comisionista/prospectos")
      ]);
      if (resCom.ok) setComisiones(await resCom.json());
      if (resSocios.ok) setSocios(await resSocios.json());
      if (resPros.ok) setProspectos(await resPros.json());
    } catch {
      addToast("Error al cargar datos", "error");
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadData(); }, [loadData]);

  // Automatically sets commission % and name when socio/prospecto is selected
  useEffect(() => {
    if (newSocioId) {
      const s = socios.find(x => x.id === newSocioId);
      if (s) {
        setNewPorcentaje(s.porcentaje_comision.toString());
      }
    }
  }, [newSocioId, socios]);

  useEffect(() => {
    if (newProspectoId) {
      const p = prospectos.find(x => x.id === newProspectoId);
      if (p) {
        setNewNombre(p.nombre);
        // Automatically match socio too
        setNewSocioId(p.socio_id);
      }
    }
  }, [newProspectoId, prospectos]);

  async function handleCreate() {
    if (!newSocioId || !newNombre || !newMonto || !newPorcentaje) {
      addToast("Completa los campos obligatorios", "error");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/comisionista/comisiones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        socio_id: newSocioId,
        prospecto_id: newProspectoId || null,
        nombre_negocio: newNombre,
        monto_venta: parseFloat(newMonto),
        porcentaje_aplicado: parseFloat(newPorcentaje),
        status: newStatus,
        notas: newNotas || null
      }),
    });
    if (res.ok) {
      addToast("Comisión registrada", "success");
      setShowForm(false);
      setNewSocioId(""); setNewProspectoId(""); setNewNombre(""); setNewMonto(""); setNewPorcentaje(""); setNewStatus("pendiente"); setNewNotas("");
      loadData();
    } else {
      const err = await res.json();
      addToast(err.error || "Error al registrar", "error");
    }
    setSaving(false);
  }

  async function handleUpdate(id: string) {
    if (!editSocioId || !editNombre || !editMonto || !editPorcentaje) {
      addToast("Completa los campos obligatorios", "error");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/comisionista/comisiones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        socio_id: editSocioId,
        prospecto_id: editProspectoId || null,
        nombre_negocio: editNombre,
        monto_venta: parseFloat(editMonto),
        porcentaje_aplicado: parseFloat(editPorcentaje),
        status: editStatus,
        notas: editNotas || null
      }),
    });
    if (res.ok) {
      addToast("Comisión actualizada", "success");
      setEditingId(null);
      loadData();
    } else {
      const err = await res.json();
      addToast(err.error || "Error al actualizar", "error");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch("/api/comisionista/comisiones", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      addToast("Comisión eliminada", "success");
      loadData();
    } else {
      addToast("Error al eliminar", "error");
    }
    setDeletingId(null);
  }

  function startEdit(c: Comision) {
    setEditingId(c.id);
    setEditSocioId(c.socio_id);
    setEditProspectoId(c.prospecto_id || "");
    setEditNombre(c.nombre_negocio);
    setEditMonto(c.monto_venta.toString());
    setEditPorcentaje(c.porcentaje_aplicado.toString());
    setEditStatus(c.status);
    setEditNotas(c.notas || "");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Comisiones / Cuentas por Cobrar</h1>
          <p className="text-white/40 text-sm mt-1">Registra y rastrea las comisiones que tus socios comerciales te deben.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Registrar Comisión"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white/[0.02] border-white/10 text-white animate-in fade-in-50 duration-200">
          <CardHeader>
            <CardTitle className="text-lg">Nueva Comisión por Cobrar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prospecto" className="text-white/70">Vincular a Prospecto (Opcional)</Label>
                <select
                  id="prospecto"
                  value={newProspectoId}
                  onChange={(e) => setNewProspectoId(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="" className="bg-[#0c0c0c]">-- Seleccionar Prospecto --</option>
                  {prospectos.filter(p => p.etapa === "ganado").map(p => (
                    <option key={p.id} value={p.id} className="bg-[#0c0c0c]">{p.nombre} (Cerrado)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="socio" className="text-white/70">Socio Deudor</Label>
                <select
                  id="socio"
                  value={newSocioId}
                  onChange={(e) => setNewSocioId(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="" className="bg-[#0c0c0c]">-- Seleccionar Socio --</option>
                  {socios.map(s => (
                    <option key={s.id} value={s.id} className="bg-[#0c0c0c]">{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-white/70">Concepto / Nombre de Venta</Label>
                <Input
                  id="nombre"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Ej. Casa en la Huasteca / Bobinado de motor 20HP"
                  className="bg-white/[0.04] border-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto" className="text-white/70">Monto Total de Venta (MXN)</Label>
                <Input
                  id="monto"
                  type="number"
                  value={newMonto}
                  onChange={(e) => setNewMonto(e.target.value)}
                  placeholder="Ej. 2500000"
                  className="bg-white/[0.04] border-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="porcentaje" className="text-white/70">Porcentaje de Comisión (%)</Label>
                <Input
                  id="porcentaje"
                  type="number"
                  value={newPorcentaje}
                  onChange={(e) => setNewPorcentaje(e.target.value)}
                  placeholder="10"
                  className="bg-white/[0.04] border-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-white/70">Estado de Cobro</Label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="pendiente" className="bg-[#0c0c0c]">Por Cobrar</option>
                  <option value="pagada" className="bg-[#0c0c0c]">Cobrada / Pagada</option>
                  <option value="cancelada" className="bg-[#0c0c0c]">Cancelada</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="notas" className="text-white/70">Notas internas / Detalles adicionales</Label>
                <Input
                  id="notas"
                  value={newNotas}
                  onChange={(e) => setNewNotas(e.target.value)}
                  placeholder="Detalles sobre fechas de pago estimadas..."
                  className="bg-white/[0.04] border-white/5 text-white"
                />
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold mt-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Registrar Comisión
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : comisiones.length === 0 ? (
        <div className="text-center py-12 bg-white/[0.01] border border-white/5 rounded-2xl">
          <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-white font-medium text-lg">No hay comisiones registradas</h3>
          <p className="text-white/40 text-sm mt-1">Registra comisiones cuando logres cierres de ventas para tus socios.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comisiones.map((c) => {
            const conf = STATUS_CONFIG[c.status] || STATUS_CONFIG.pendiente;
            
            return (
              <Card key={c.id} className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-all text-white">
                <CardContent className="p-5">
                  {editingId === c.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-white/50 text-xs">Socio</Label>
                          <select
                            value={editSocioId}
                            onChange={(e) => setEditSocioId(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/5 mt-1 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                          >
                            {socios.map(s => (
                              <option key={s.id} value={s.id} className="bg-[#0c0c0c]">{s.nombre}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-white/50 text-xs">Concepto / Venta</Label>
                          <Input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                        </div>
                        <div>
                          <Label className="text-white/50 text-xs">Monto Venta</Label>
                          <Input type="number" value={editMonto} onChange={(e) => setEditMonto(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                        </div>
                        <div>
                          <Label className="text-white/50 text-xs">Comisión %</Label>
                          <Input type="number" value={editPorcentaje} onChange={(e) => setEditPorcentaje(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                        </div>
                        <div>
                          <Label className="text-white/50 text-xs">Estado</Label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/5 mt-1 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                          >
                            <option value="pendiente" className="bg-[#0c0c0c]">Por Cobrar</option>
                            <option value="pagada" className="bg-[#0c0c0c]">Cobrada</option>
                            <option value="cancelada" className="bg-[#0c0c0c]">Cancelada</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-white/50 text-xs">Notas</Label>
                          <Input value={editNotas} onChange={(e) => setEditNotas(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-white/50"><X className="w-4 h-4" /></Button>
                        <Button size="sm" onClick={() => handleUpdate(c.id)} disabled={saving} className="bg-emerald-500 text-black font-semibold">
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />} Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold text-white">{c.nombre_negocio}</h3>
                          <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5", conf.bgClass, conf.textClass)}>
                            <conf.icon className="w-3.5 h-3.5" />
                            {conf.label}
                          </span>
                        </div>
                        
                        <div className="flex gap-6 text-xs text-white/50 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-500" />
                            <span>Socio: <span className="text-white font-medium">{c.socios?.nombre || "No asignado"}</span></span>
                          </div>
                          {c.prospectos?.nombre && (
                            <div className="flex items-center gap-1.5">
                              <UserPlus className="w-3.5 h-3.5 text-amber-500" />
                              <span>Lead: <span className="text-white font-medium">{c.prospectos.nombre}</span></span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            <span>Creada: <span className="text-white font-medium">{new Date(c.created_at).toLocaleDateString()}</span></span>
                          </div>
                          {c.paid_at && (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Cobrada el: <span className="text-emerald-400 font-medium">{new Date(c.paid_at).toLocaleDateString()}</span></span>
                            </div>
                          )}
                        </div>

                        {c.notas && (
                          <p className="text-xs text-white/40 italic bg-white/[0.01] p-2 rounded-lg border border-white/[0.02] mt-1 inline-block">
                            Nota: {c.notas}
                          </p>
                        )}
                      </div>

                      {/* Right: Amounts & Actions */}
                      <div className="flex items-center gap-6 justify-between md:justify-end flex-shrink-0 border-t border-white/5 md:border-none pt-3 md:pt-0">
                        <div className="grid grid-cols-2 gap-x-6 text-right">
                          <div>
                            <span className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">Venta Total</span>
                            <p className="text-sm font-semibold text-white/80 mt-0.5">{formatCurrency(c.monto_venta)}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">Tus Ganancias ({c.porcentaje_aplicado}%)</span>
                            <p className="text-base font-bold text-amber-400 mt-0.5">{formatCurrency(c.monto_comision)}</p>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <Button size="icon" variant="ghost" onClick={() => startEdit(c)} className="text-white/40 hover:text-white">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="text-white/45 hover:text-red-400">
                            {deletingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

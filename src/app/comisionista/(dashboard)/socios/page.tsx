"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Handshake,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Phone,
  Mail,
  Percent,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Socio } from "@/lib/types";

interface SocioWithStats extends Socio {
  stats: { prospectos: number; ganados: number };
  total_comisiones: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export default function SociosPage() {
  const { addToast } = useToast();
  const [socios, setSocios] = useState<SocioWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New form
  const [showForm, setShowForm] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTelefono, setNewTelefono] = useState("");
  const [newPorcentaje, setNewPorcentaje] = useState("10");
  const [newNotas, setNewNotas] = useState("");

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editPorcentaje, setEditPorcentaje] = useState("");
  const [editNotas, setEditNotas] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/comisionista/socios");
      if (res.ok) setSocios(await res.json());
    } catch {
      addToast("Error al cargar socios", "error");
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCreate() {
    if (!newNombre || !newEmail) {
      addToast("Nombre y email son requeridos", "error");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/comisionista/socios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: newNombre,
        email: newEmail,
        telefono: newTelefono || null,
        porcentaje_comision: parseFloat(newPorcentaje) || 10,
        notes: newNotas || null,
      }),
    });
    if (res.ok) {
      addToast("Socio comercial creado", "success");
      setShowForm(false);
      setNewNombre(""); setNewEmail(""); setNewTelefono(""); setNewPorcentaje("10"); setNewNotas("");
      loadData();
    } else {
      const err = await res.json();
      addToast(err.error || "Error al crear", "error");
    }
    setSaving(false);
  }

  async function handleUpdate(id: string) {
    if (!editNombre || !editEmail) {
      addToast("Nombre y email son requeridos", "error");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/comisionista/socios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        nombre: editNombre,
        email: editEmail,
        telefono: editTelefono || null,
        porcentaje_comision: parseFloat(editPorcentaje) || 10,
        notas: editNotas || null,
      }),
    });
    if (res.ok) {
      addToast("Socio actualizado", "success");
      setEditingId(null);
      loadData();
    } else {
      const err = await res.json();
      addToast(err.error || "Error al actualizar", "error");
    }
    setSaving(false);
  }

  async function handleToggleActivo(id: string, current: boolean) {
    const res = await fetch("/api/comisionista/socios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, activo: !current }),
    });
    if (res.ok) {
      addToast("Estado actualizado", "success");
      loadData();
    } else {
      addToast("Error al cambiar estado", "error");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch("/api/comisionista/socios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      addToast("Socio comercial eliminado", "success");
      loadData();
    } else {
      addToast("Error al eliminar", "error");
    }
    setDeletingId(null);
  }

  function startEdit(s: SocioWithStats) {
    setEditingId(s.id);
    setEditNombre(s.nombre);
    setEditEmail(s.email);
    setEditTelefono(s.telefono || "");
    setEditPorcentaje(s.porcentaje_comision.toString());
    setEditNotas(s.notas || "");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Socios Comerciales</h1>
          <p className="text-white/40 text-sm mt-1">Negocios aliados a los que les generas ventas.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Nuevo Socio"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white/[0.02] border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Registrar Nuevo Socio Comercial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-white/70">Nombre del Negocio</Label>
                <Input
                  id="nombre"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Ej. Inmobiliaria Cima"
                  className="bg-white/[0.04] border-white/5 text-white focus-visible:ring-amber-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="dueño@negocio.com"
                  className="bg-white/[0.04] border-white/5 text-white focus-visible:ring-amber-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-white/70">Teléfono (WhatsApp)</Label>
                <Input
                  id="telefono"
                  value={newTelefono}
                  onChange={(e) => setNewTelefono(e.target.value)}
                  placeholder="WhatsApp del Socio"
                  className="bg-white/[0.04] border-white/5 text-white focus-visible:ring-amber-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="porcentaje" className="text-white/70">Comisión Pactada (%)</Label>
                <div className="relative">
                  <Input
                    id="porcentaje"
                    type="number"
                    value={newPorcentaje}
                    onChange={(e) => setNewPorcentaje(e.target.value)}
                    className="bg-white/[0.04] border-white/5 text-white pr-8 focus-visible:ring-amber-500/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas" className="text-white/70">Notas internas / Detalles del acuerdo</Label>
              <Input
                id="notas"
                value={newNotas}
                onChange={(e) => setNewNotas(e.target.value)}
                placeholder="Detalla los términos de las comisiones..."
                className="bg-white/[0.04] border-white/5 text-white focus-visible:ring-amber-500/50"
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Guardar Socio
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : socios.length === 0 ? (
        <div className="text-center py-12 bg-white/[0.01] border border-white/5 rounded-2xl">
          <Handshake className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-white font-medium text-lg">No tienes socios registrados</h3>
          <p className="text-white/40 text-sm mt-1">Registra negocios como inmobiliarias o talleres para empezar a vincular prospectos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {socios.map((s) => (
            <Card key={s.id} className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-all text-white overflow-hidden">
              <CardContent className="p-6">
                {editingId === s.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/50 text-xs">Nombre</Label>
                        <Input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                      </div>
                      <div>
                        <Label className="text-white/50 text-xs">Email</Label>
                        <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                      </div>
                      <div>
                        <Label className="text-white/50 text-xs">Teléfono</Label>
                        <Input value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                      </div>
                      <div>
                        <Label className="text-white/50 text-xs">Comisión %</Label>
                        <Input type="number" value={editPorcentaje} onChange={(e) => setEditPorcentaje(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/50 text-xs">Notas</Label>
                      <Input value={editNotas} onChange={(e) => setEditNotas(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-white/50"><X className="w-4 h-4" /></Button>
                      <Button size="sm" onClick={() => handleUpdate(s.id)} disabled={saving} className="bg-emerald-500 text-black font-semibold">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />} Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-4 flex-1">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg font-bold text-white">{s.nombre}</h3>
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", s.activo ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/40 border-white/10")}>
                            {s.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        {s.notas && <p className="text-xs text-white/50 mt-1">{s.notas}</p>}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Mail className="w-4 h-4 text-amber-500" />
                          <span className="truncate">{s.email}</span>
                        </div>
                        {s.telefono && (
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <Phone className="w-4 h-4 text-amber-500" />
                            <span>{s.telefono}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Percent className="w-4 h-4 text-amber-500" />
                          <span>{s.porcentaje_comision}% Comisión</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5 text-center">
                        <div>
                          <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">Prospectos</p>
                          <p className="text-lg font-bold text-white mt-0.5">{s.stats?.prospectos || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">Cerrados</p>
                          <p className="text-lg font-bold text-emerald-400 mt-0.5">{s.stats?.ganados || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">Comisiones</p>
                          <p className="text-lg font-bold text-amber-400 mt-0.5">{formatCurrency(s.total_comisiones || 0)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => handleToggleActivo(s.id, s.activo)} className="text-white/40 hover:text-white">
                        {s.activo ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => startEdit(s)} className="text-white/40 hover:text-white">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)} disabled={deletingId === s.id} className="text-white/45 hover:text-red-400">
                        {deletingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

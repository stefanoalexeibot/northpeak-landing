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
  Users,
  DollarSign,
  TrendingUp,
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
  const [Socios, setSocios] = useState<SocioWithStats[]>([]);
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
      const res = await fetch("/api/admin/socios");
      if (res.ok) setSocios(await res.json());
    } catch {
      addToast("Error al cargar Socios", "error");
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
    const res = await fetch("/api/admin/socios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: newNombre,
        email: newEmail,
        telefono: newTelefono || null,
        porcentaje_comision: parseFloat(newPorcentaje) || 10,
        notas: newNotas || null,
      }),
    });
    if (res.ok) {
      addToast("Socio creado", "success");
      setShowForm(false);
      setNewNombre(""); setNewEmail(""); setNewTelefono(""); setNewPorcentaje("10"); setNewNotas("");
      loadData();
    } else {
      const err = await res.json();
      addToast(err.error || "Error al crear", "error");
    }
    setSaving(false);
  }

  function startEdit(c: SocioWithStats) {
    setEditingId(c.id);
    setEditNombre(c.nombre);
    setEditEmail(c.email);
    setEditTelefono(c.telefono || "");
    setEditPorcentaje(String(c.porcentaje_comision));
    setEditNotas(c.notas || "");
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    const res = await fetch("/api/admin/socios", {
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
      addToast("Guardado", "success");
      setEditingId(null);
      loadData();
    } else {
      const err = await res.json();
      addToast(err.error || "Error al guardar", "error");
    }
    setSaving(false);
  }

  async function handleToggleActivo(c: SocioWithStats) {
    await fetch("/api/admin/socios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, activo: !c.activo }),
    });
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que quieres eliminar este Socio?")) return;
    setDeletingId(id);
    const res = await fetch("/api/admin/socios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      addToast("Socio eliminado", "success");
      loadData();
    } else {
      addToast("Error al eliminar", "error");
    }
    setDeletingId(null);
  }

  const totalProspectos = Socios.reduce((s, c) => s + c.stats.prospectos, 0);
  const totalGanados = Socios.reduce((s, c) => s + c.stats.ganados, 0);
  const totalComisiones = Socios.reduce((s, c) => s + c.total_comisiones, 0);

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Handshake className="h-5 w-5 text-amber-400" />
            <h1 className="text-2xl font-heading font-bold text-northpeak-text">Socios</h1>
          </div>
          <p className="text-northpeak-text-muted text-sm">
            Gestión de Socios externos — cobran por comisión sobre ventas generadas.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-400 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Socio
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Socios", value: Socios.length, icon: Users, color: "text-northpeak-text" },
          { label: "Prospectos referidos", value: totalProspectos, icon: TrendingUp, color: "text-blue-400" },
          { label: "Ventas cerradas", value: totalGanados, icon: Check, color: "text-green-400" },
          { label: "Total comisiones", value: formatCurrency(totalComisiones), icon: DollarSign, color: "text-amber-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-northpeak-card border-northpeak-surface">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <p className={cn("font-heading font-bold text-2xl leading-none mb-1", s.color)}>{s.value}</p>
              <p className="text-xs text-northpeak-text-muted">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New form */}
      {showForm && (
        <Card className="mb-6 bg-northpeak-card border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-base text-northpeak-text">Nuevo Socio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-northpeak-text-muted text-xs mb-1.5 block">Nombre *</Label>
                <Input
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Nombre completo"
                  className="bg-northpeak-surface border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div>
                <Label className="text-northpeak-text-muted text-xs mb-1.5 block">Email *</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="bg-northpeak-surface border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div>
                <Label className="text-northpeak-text-muted text-xs mb-1.5 block">Teléfono</Label>
                <Input
                  value={newTelefono}
                  onChange={(e) => setNewTelefono(e.target.value)}
                  placeholder="+52 81 0000 0000"
                  className="bg-northpeak-surface border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div>
                <Label className="text-northpeak-text-muted text-xs mb-1.5 block">% de comisión</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={newPorcentaje}
                    onChange={(e) => setNewPorcentaje(e.target.value)}
                    className="bg-northpeak-surface border-northpeak-surface text-northpeak-text pr-8"
                  />
                  <Percent className="absolute right-2.5 top-2.5 h-4 w-4 text-northpeak-text-muted" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-northpeak-text-muted text-xs mb-1.5 block">Notas internas</Label>
                <Input
                  value={newNotas}
                  onChange={(e) => setNewNotas(e.target.value)}
                  placeholder="Notas sobre este Socio..."
                  className="bg-northpeak-surface border-northpeak-surface text-northpeak-text"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-white"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Crear Socio
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

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-northpeak-text-muted" />
        </div>
      ) : Socios.length === 0 ? (
        <div className="text-center py-20 text-northpeak-text-muted">
          <Handshake className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No hay Socios registrados</p>
          <p className="text-sm mt-1">Crea el primero para empezar a trackear referidos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Socios.map((c) => (
            <Card key={c.id} className={cn("bg-northpeak-card border-northpeak-surface transition-all", !c.activo && "opacity-60")}>
              <CardContent className="p-5">
                {editingId === c.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} placeholder="Nombre" className="bg-northpeak-surface border-northpeak-surface text-northpeak-text" />
                      <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" className="bg-northpeak-surface border-northpeak-surface text-northpeak-text" />
                      <Input value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} placeholder="Teléfono" className="bg-northpeak-surface border-northpeak-surface text-northpeak-text" />
                      <div className="relative">
                        <Input type="number" min="0" max="100" step="0.5" value={editPorcentaje} onChange={(e) => setEditPorcentaje(e.target.value)} placeholder="% comisión" className="bg-northpeak-surface border-northpeak-surface text-northpeak-text pr-8" />
                        <Percent className="absolute right-2.5 top-2.5 h-4 w-4 text-northpeak-text-muted" />
                      </div>
                      <div className="sm:col-span-2">
                        <Input value={editNotas} onChange={(e) => setEditNotas(e.target.value)} placeholder="Notas" className="bg-northpeak-surface border-northpeak-surface text-northpeak-text" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(c.id)} disabled={saving} className="bg-amber-500 hover:bg-amber-400 text-white">
                        {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="border-northpeak-surface text-northpeak-text-muted">
                        <X className="h-3 w-3 mr-1" /> Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-400 font-bold text-sm">{c.nombre.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-northpeak-text truncate">{c.nombre}</p>
                          {!c.activo && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-northpeak-surface text-northpeak-text-muted">Inactivo</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-northpeak-text-muted flex-wrap">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                          {c.telefono && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.telefono}</span>}
                          <span className="flex items-center gap-1 text-amber-400 font-medium"><Percent className="h-3 w-3" />{c.porcentaje_comision}% comisión</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="hidden sm:flex items-center gap-6 text-center">
                        <div>
                          <p className="text-lg font-bold text-northpeak-text">{c.stats.prospectos}</p>
                          <p className="text-[10px] text-northpeak-text-muted">Referidos</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-400">{c.stats.ganados}</p>
                          <p className="text-[10px] text-northpeak-text-muted">Ganados</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-amber-400">{formatCurrency(c.total_comisiones)}</p>
                          <p className="text-[10px] text-northpeak-text-muted">Comisiones</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleActivo(c)}
                          className="p-1.5 rounded-lg text-northpeak-text-muted hover:text-amber-400 transition-colors"
                          title={c.activo ? "Desactivar" : "Activar"}
                        >
                          {c.activo ? <ToggleRight className="h-5 w-5 text-amber-400" /> : <ToggleLeft className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => startEdit(c)}
                          className="p-1.5 rounded-lg text-northpeak-text-muted hover:text-northpeak-text transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="p-1.5 rounded-lg text-northpeak-text-muted hover:text-red-400 transition-colors"
                        >
                          {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
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


"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  UserCheck,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Users,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Vendedor {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  activo: boolean;
  created_at: string;
}


export default function VendedoresPage() {
  const { addToast } = useToast();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [stats, setStats] = useState<Record<string, { prospectos: number; ganados: number }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New vendedor form
  const [showForm, setShowForm] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTelefono, setNewTelefono] = useState("");

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefono, setEditTelefono] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [vendRes, analisisRes] = await Promise.all([
        fetch("/api/admin/vendedores"),
        fetch("/api/admin/analisis"),
      ]);

      if (vendRes.ok) {
        const v: Vendedor[] = await vendRes.json();
        setVendedores(v);

        if (analisisRes.ok) {
          const analisis: Array<{ vendedor?: string; etapa: string }> = await analisisRes.json();
          const statsMap: Record<string, { prospectos: number; ganados: number }> = {};
          for (const a of analisis) {
            if (!a.vendedor) continue;
            if (!statsMap[a.vendedor]) statsMap[a.vendedor] = { prospectos: 0, ganados: 0 };
            statsMap[a.vendedor].prospectos++;
            if (a.etapa === "cerrado_ganado") statsMap[a.vendedor].ganados++;
          }
          setStats(statsMap);
        }
      }
    } catch {
      addToast("Error al cargar vendedores", "error");
    }
    setLoading(false);
  }

  async function handleCreate() {
    if (!newNombre.trim()) { addToast("El nombre es requerido", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/vendedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newNombre, email: newEmail, telefono: newTelefono }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error || "Error al crear", "error"); }
      else {
        setVendedores((prev) => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setNewNombre(""); setNewEmail(""); setNewTelefono("");
        setShowForm(false);
        addToast("Vendedor creado", "success");
      }
    } catch { addToast("Error de conexión", "error"); }
    setSaving(false);
  }

  function startEdit(v: Vendedor) {
    setEditingId(v.id);
    setEditNombre(v.nombre);
    setEditEmail(v.email || "");
    setEditTelefono(v.telefono || "");
  }

  async function handleSaveEdit(id: string) {
    if (!editNombre.trim()) { addToast("El nombre es requerido", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/vendedores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nombre: editNombre, email: editEmail, telefono: editTelefono }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error || "Error al guardar", "error"); }
      else {
        setVendedores((prev) =>
          prev.map((v) => (v.id === id ? data : v)).sort((a, b) => a.nombre.localeCompare(b.nombre))
        );
        setEditingId(null);
        addToast("Vendedor actualizado", "success");
      }
    } catch { addToast("Error de conexión", "error"); }
    setSaving(false);
  }

  async function handleToggle(v: Vendedor) {
    try {
      const res = await fetch("/api/admin/vendedores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: v.id, activo: !v.activo }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error || "Error", "error"); }
      else {
        setVendedores((prev) => prev.map((x) => (x.id === v.id ? data : x)));
      }
    } catch { addToast("Error de conexión", "error"); }
  }

  async function handleDelete(id: string, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return;
    try {
      const res = await fetch("/api/admin/vendedores", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { const d = await res.json(); addToast(d.error || "Error al eliminar", "error"); }
      else {
        setVendedores((prev) => prev.filter((v) => v.id !== id));
        addToast("Vendedor eliminado", "success");
      }
    } catch { addToast("Error de conexión", "error"); }
  }

  const activos = vendedores.filter((v) => v.activo);
  const totalProspectos = Object.values(stats).reduce((sum, s) => sum + s.prospectos, 0);
  const totalGanados = Object.values(stats).reduce((sum, s) => sum + s.ganados, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-northpeak-text-dim" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">
            Vendedores
          </h1>
          <p className="text-northpeak-text-muted mt-1 text-sm">
            Gestión del equipo de ventas
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Agregar vendedor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-northpeak-green/10">
              <UserCheck className="h-5 w-5 text-northpeak-green" />
            </div>
            <div>
              <div className="text-2xl font-heading font-bold text-northpeak-text">{activos.length}</div>
              <div className="text-xs text-northpeak-text-muted">Vendedores activos</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/10">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-heading font-bold text-northpeak-text">{totalProspectos}</div>
              <div className="text-xs text-northpeak-text-muted">Prospectos asignados</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10">
              <Trophy className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-heading font-bold text-northpeak-text">{totalGanados}</div>
              <div className="text-xs text-northpeak-text-muted">Prospectos ganados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="bg-northpeak-card border-northpeak-green/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-northpeak-text font-heading text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-northpeak-green" />
              Nuevo vendedor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-northpeak-text text-xs">Nombre *</Label>
                <Input
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Juan Pérez"
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-9"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-northpeak-text text-xs">Email</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="juan@empresa.com"
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-northpeak-text text-xs">Teléfono</Label>
                <Input
                  value={newTelefono}
                  onChange={(e) => setNewTelefono(e.target.value)}
                  placeholder="+52 81 ..."
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={saving}
                className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                Guardar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowForm(false); setNewNombre(""); setNewEmail(""); setNewTelefono(""); }}
                className="text-northpeak-text-muted"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendedores list */}
      <Card className="bg-northpeak-card border-northpeak-surface">
        <CardHeader className="pb-3">
          <CardTitle className="text-northpeak-text font-heading text-base">
            Equipo ({vendedores.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {vendedores.length === 0 ? (
            <div className="p-12 text-center">
              <UserCheck className="h-10 w-10 text-northpeak-text-dim mx-auto mb-3" />
              <p className="text-northpeak-text-muted text-sm">
                No hay vendedores. Agrega el primero.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-northpeak-surface">
              {vendedores.map((v) => {
                const vStats = stats[v.nombre] || { prospectos: 0, ganados: 0 };
                const isEditing = editingId === v.id;

                return (
                  <div key={v.id} className="p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-northpeak-text text-xs">Nombre *</Label>
                            <Input
                              value={editNombre}
                              onChange={(e) => setEditNombre(e.target.value)}
                              className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-northpeak-text text-xs">Email</Label>
                            <Input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-northpeak-text text-xs">Teléfono</Label>
                            <Input
                              value={editTelefono}
                              onChange={(e) => setEditTelefono(e.target.value)}
                              className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(v.id)}
                            disabled={saving}
                            className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 h-7 text-xs"
                          >
                            {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                            Guardar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(null)}
                            className="text-northpeak-text-muted h-7 text-xs"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-northpeak-text">{v.nombre}</span>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                              v.activo
                                ? "bg-northpeak-green/10 text-northpeak-green"
                                : "bg-northpeak-surface text-northpeak-text-dim"
                            )}>
                              {v.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                            {v.email && (
                              <span className="text-xs text-northpeak-text-muted">{v.email}</span>
                            )}
                            {v.telefono && (
                              <span className="text-xs text-northpeak-text-muted">{v.telefono}</span>
                            )}
                          </div>
                          <div className="flex gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[10px] text-northpeak-text-dim">
                              <Users className="h-3 w-3" />
                              {vStats.prospectos} prospectos
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                              <Trophy className="h-3 w-3" />
                              {vStats.ganados} ganados
                            </span>
                            {vStats.prospectos > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-northpeak-text-dim">
                                <TrendingUp className="h-3 w-3" />
                                {Math.round((vStats.ganados / vStats.prospectos) * 100)}% conversión
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(v)}
                            className="h-7 w-7 p-0 text-northpeak-text-muted hover:text-northpeak-text"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(v)}
                            className={cn(
                              "h-7 px-2 text-xs",
                              v.activo
                                ? "text-northpeak-text-muted hover:text-yellow-400"
                                : "text-northpeak-text-muted hover:text-northpeak-green"
                            )}
                            title={v.activo ? "Desactivar" : "Activar"}
                          >
                            {v.activo ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(v.id, v.nombre)}
                            className="h-7 w-7 p-0 text-northpeak-text-muted hover:text-red-400"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

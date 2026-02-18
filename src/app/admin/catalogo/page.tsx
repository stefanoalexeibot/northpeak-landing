"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio_mensual: number | null;
  precio_unico: number | null;
  activo: boolean;
  orden: number | null;
  created_at: string;
}

const CATEGORIAS = ["marketing", "desarrollo", "diseno", "consultoria", "otro"];

const CATEGORIA_LABELS: Record<string, string> = {
  marketing: "Marketing",
  desarrollo: "Desarrollo",
  diseno: "Diseño",
  consultoria: "Consultoría",
  otro: "Otro",
};

const CATEGORIA_COLORS: Record<string, string> = {
  marketing: "bg-blue-500/20 text-blue-400",
  desarrollo: "bg-purple-500/20 text-purple-400",
  diseno: "bg-pink-500/20 text-pink-400",
  consultoria: "bg-amber-500/20 text-amber-400",
  otro: "bg-gray-500/20 text-gray-400",
};

function formatMXN(amount: number | null) {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const emptyForm = {
  nombre: "",
  descripcion: "",
  categoria: "marketing",
  precio_mensual: "",
  precio_unico: "",
  orden: "",
};

export default function CatalogoPage() {
  const { addToast } = useToast();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [deleting, setDeleting] = useState<Servicio | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function fetchServicios() {
    try {
      const res = await fetch("/api/admin/catalogo");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setServicios(data);
    } catch {
      addToast("Error al cargar servicios", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServicios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(s: Servicio) {
    setEditing(s);
    setForm({
      nombre: s.nombre,
      descripcion: s.descripcion || "",
      categoria: s.categoria,
      precio_mensual: s.precio_mensual?.toString() || "",
      precio_unico: s.precio_unico?.toString() || "",
      orden: s.orden?.toString() || "",
    });
    setDialogOpen(true);
  }

  function openDelete(s: Servicio) {
    setDeleting(s);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!form.nombre.trim()) {
      addToast("Nombre es requerido", "error");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        categoria: form.categoria,
        precio_mensual: form.precio_mensual ? parseFloat(form.precio_mensual) : null,
        precio_unico: form.precio_unico ? parseFloat(form.precio_unico) : null,
      };

      if (form.orden) payload.orden = parseInt(form.orden);

      if (editing) {
        payload.id = editing.id;
        const res = await fetch("/api/admin/catalogo", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        addToast("Servicio actualizado");
      } else {
        const res = await fetch("/api/admin/catalogo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        addToast("Servicio creado");
      }

      setDialogOpen(false);
      fetchServicios();
    } catch {
      addToast("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/catalogo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleting.id }),
      });
      if (!res.ok) throw new Error();
      addToast("Servicio eliminado");
      setDeleteDialogOpen(false);
      setDeleting(null);
      fetchServicios();
    } catch {
      addToast("Error al eliminar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActivo(s: Servicio) {
    try {
      const res = await fetch("/api/admin/catalogo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, activo: !s.activo }),
      });
      if (!res.ok) throw new Error();
      setServicios((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, activo: !item.activo } : item))
      );
    } catch {
      addToast("Error al actualizar estado", "error");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">
            Catálogo de Servicios
          </h1>
          <p className="text-northpeak-text-muted mt-1">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">
            Catálogo de Servicios
          </h1>
          <p className="text-northpeak-text-muted mt-1">
            {servicios.length} servicio{servicios.length !== 1 ? "s" : ""} registrado
            {servicios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-northpeak-green hover:bg-northpeak-green/90 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Agregar servicio
        </Button>
      </div>

      {/* Grid */}
      {servicios.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center space-y-4">
            <Package className="h-12 w-12 mx-auto text-northpeak-text-dim" />
            <p className="text-northpeak-text-muted">No hay servicios en el catálogo.</p>
            <Button onClick={openCreate} className="bg-northpeak-green hover:bg-northpeak-green/90 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Crear primer servicio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicios.map((s) => (
            <Card
              key={s.id}
              className={cn(
                "bg-northpeak-card border-northpeak-surface transition-colors hover:border-northpeak-text-dim cursor-pointer",
                !s.activo && "opacity-50"
              )}
              onClick={() => openEdit(s)}
            >
              <CardContent className="p-5 space-y-3">
                {/* Top row: name + badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-northpeak-text leading-tight">{s.nombre}</h3>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium px-2 py-0.5 rounded-full",
                      CATEGORIA_COLORS[s.categoria] || CATEGORIA_COLORS.otro
                    )}
                  >
                    {CATEGORIA_LABELS[s.categoria] || s.categoria}
                  </span>
                </div>

                {/* Description */}
                {s.descripcion && (
                  <p className="text-sm text-northpeak-text-muted line-clamp-2">{s.descripcion}</p>
                )}

                {/* Prices */}
                <div className="flex flex-wrap gap-3 text-sm">
                  {s.precio_mensual !== null && (
                    <div>
                      <span className="text-northpeak-text-dim">Mensual:</span>{" "}
                      <span className="text-northpeak-green font-medium">
                        {formatMXN(s.precio_mensual)}
                      </span>
                    </div>
                  )}
                  {s.precio_unico !== null && (
                    <div>
                      <span className="text-northpeak-text-dim">Único:</span>{" "}
                      <span className="text-blue-400 font-medium">
                        {formatMXN(s.precio_unico)}
                      </span>
                    </div>
                  )}
                  {s.precio_mensual === null && s.precio_unico === null && (
                    <span className="text-northpeak-text-dim">Sin precio definido</span>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-1">
                  {/* Active toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActivo(s);
                    }}
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded transition-colors",
                      s.activo
                        ? "bg-northpeak-green/15 text-northpeak-green hover:bg-northpeak-green/25"
                        : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                    )}
                  >
                    {s.activo ? "Activo" : "Inactivo"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(s);
                      }}
                      className="p-1.5 rounded text-northpeak-text-muted hover:text-northpeak-text hover:bg-northpeak-surface transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDelete(s);
                      }}
                      className="p-1.5 rounded text-northpeak-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface text-northpeak-text max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-northpeak-text-muted">Nombre *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Gestión de Redes Sociales"
                className="bg-northpeak-surface border-northpeak-surface text-northpeak-text"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-northpeak-text-muted">Descripción</Label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Descripción breve del servicio..."
                rows={3}
                className="flex w-full rounded-md border bg-northpeak-surface border-northpeak-surface px-3 py-2 text-sm text-northpeak-text placeholder:text-northpeak-text-dim focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-northpeak-green resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-northpeak-text-muted">Categoría</Label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="flex h-10 w-full rounded-md border bg-northpeak-surface border-northpeak-surface px-3 py-2 text-sm text-northpeak-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-northpeak-green"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIA_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-northpeak-text-muted">Precio mensual (MXN)</Label>
                <Input
                  type="number"
                  value={form.precio_mensual}
                  onChange={(e) => setForm({ ...form, precio_mensual: e.target.value })}
                  placeholder="0"
                  className="bg-northpeak-surface border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-northpeak-text-muted">Precio único (MXN)</Label>
                <Input
                  type="number"
                  value={form.precio_unico}
                  onChange={(e) => setForm({ ...form, precio_unico: e.target.value })}
                  placeholder="0"
                  className="bg-northpeak-surface border-northpeak-surface text-northpeak-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-northpeak-text-muted">Orden (opcional)</Label>
              <Input
                type="number"
                value={form.orden}
                onChange={(e) => setForm({ ...form, orden: e.target.value })}
                placeholder="1, 2, 3..."
                className="bg-northpeak-surface border-northpeak-surface text-northpeak-text"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-northpeak-surface text-northpeak-text-muted hover:bg-northpeak-surface"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-northpeak-green hover:bg-northpeak-green/90 text-black"
            >
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear servicio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface text-northpeak-text max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar servicio</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-northpeak-text-muted py-2">
            ¿Estás seguro que quieres eliminar{" "}
            <span className="text-northpeak-text font-medium">{deleting?.nombre}</span>? Esta
            acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-northpeak-surface text-northpeak-text-muted hover:bg-northpeak-surface"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Users,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Phone,
  Mail,
  Coins,
  FileText,
} from "lucide-react";
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

const ETAPAS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "interesado", label: "Interesado" },
  { value: "negociacion", label: "Negociación" },
  { value: "ganado", label: "Cerrado Ganado 🎉" },
  { value: "perdido", label: "Cerrado Perdido" }
];

const ETAPA_COLOR: Record<string, string> = {
  nuevo: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contactado: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  interesado: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  negociacion: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  ganado: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  perdido: "bg-red-500/10 text-red-400 border-red-500/20"
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export default function ProspectosPage() {
  const { addToast } = useToast();
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New form
  const [showForm, setShowForm] = useState(false);
  const [newSocioId, setNewSocioId] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newTelefono, setNewTelefono] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newEtapa, setNewEtapa] = useState("nuevo");
  const [newMonto, setNewMonto] = useState("");
  const [newFuente, setNewFuente] = useState("");
  const [newNotas, setNewNotas] = useState("");

  // Edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSocioId, setEditSocioId] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editEtapa, setEditEtapa] = useState("nuevo");
  const [editMonto, setEditMonto] = useState("");
  const [editFuente, setEditFuente] = useState("");
  const [editNotas, setEditNotas] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resPros, resSocios] = await Promise.all([
        fetch("/api/comisionista/prospectos"),
        fetch("/api/comisionista/socios")
      ]);
      if (resPros.ok) setProspectos(await resPros.json());
      if (resSocios.ok) setSocios(await resSocios.json());
    } catch {
      addToast("Error al cargar datos", "error");
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCreate() {
    if (!newSocioId || !newNombre) {
      addToast("Socio y Nombre son requeridos", "error");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/comisionista/prospectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        socio_id: newSocioId,
        nombre: newNombre,
        telefono: newTelefono || null,
        email: newEmail || null,
        descripcion: newDescripcion || null,
        etapa: newEtapa,
        monto_potencial: parseFloat(newMonto) || null,
        fuente: newFuente || null,
        notas: newNotas || null
      }),
    });
    if (res.ok) {
      addToast("Prospecto registrado", "success");
      setShowForm(false);
      // Reset form
      setNewSocioId(""); setNewNombre(""); setNewTelefono(""); setNewEmail("");
      setNewDescripcion(""); setNewEtapa("nuevo"); setNewMonto(""); setNewFuente(""); setNewNotas("");
      loadData();
    } else {
      const err = await res.json();
      addToast(err.error || "Error al registrar", "error");
    }
    setSaving(false);
  }

  async function handleUpdate(id: string) {
    if (!editSocioId || !editNombre) {
      addToast("Socio y Nombre son requeridos", "error");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/comisionista/prospectos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        socio_id: editSocioId,
        nombre: editNombre,
        telefono: editTelefono || null,
        email: editEmail || null,
        descripcion: editDescripcion || null,
        etapa: editEtapa,
        monto_potencial: parseFloat(editMonto) || null,
        fuente: editFuente || null,
        notas: editNotas || null
      }),
    });
    if (res.ok) {
      addToast("Prospecto actualizado", "success");
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
    const res = await fetch("/api/comisionista/prospectos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      addToast("Prospecto eliminado", "success");
      loadData();
    } else {
      addToast("Error al eliminar", "error");
    }
    setDeletingId(null);
  }

  function startEdit(p: Prospecto) {
    setEditingId(p.id);
    setEditSocioId(p.socio_id);
    setEditNombre(p.nombre);
    setEditTelefono(p.telefono || "");
    setEditEmail(p.email || "");
    setEditDescripcion(p.descripcion || "");
    setEditEtapa(p.etapa);
    setEditMonto(p.monto_potencial ? p.monto_potencial.toString() : "");
    setEditFuente(p.fuente || "");
    setEditNotas(p.notas || "");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Prospectos / Leads</h1>
          <p className="text-white/40 text-sm mt-1">Registra y administra los prospectos que consigues para tus socios comerciales.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Nuevo Prospecto"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white/[0.02] border-white/10 text-white animate-in fade-in-50 duration-200">
          <CardHeader>
            <CardTitle className="text-lg">Registrar Prospecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="socio" className="text-white/70">Socio Comercial Beneficiario</Label>
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
                <Label htmlFor="nombre" className="text-white/70">Nombre del Prospecto</Label>
                <Input
                  id="nombre"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="bg-white/[0.04] border-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-white/70">Teléfono (WhatsApp)</Label>
                <Input
                  id="telefono"
                  value={newTelefono}
                  onChange={(e) => setNewTelefono(e.target.value)}
                  placeholder="+52 81..."
                  className="bg-white/[0.04] border-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="juan@correo.com"
                  className="bg-white/[0.04] border-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto" className="text-white/70">Monto Potencial / Venta estimado</Label>
                <Input
                  id="monto"
                  type="number"
                  value={newMonto}
                  onChange={(e) => setNewMonto(e.target.value)}
                  placeholder="Ej. 150000"
                  className="bg-white/[0.04] border-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="etapa" className="text-white/70">Etapa de la venta</Label>
                <select
                  id="etapa"
                  value={newEtapa}
                  onChange={(e) => setNewEtapa(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                >
                  {ETAPAS.map(et => (
                    <option key={et.value} value={et.value} className="bg-[#0c0c0c]">{et.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="descripcion" className="text-white/70">¿Qué producto/servicio le interesa?</Label>
                <Input
                  id="descripcion"
                  value={newDescripcion}
                  onChange={(e) => setNewDescripcion(e.target.value)}
                  placeholder="Ej. Compra de casa en zona sur / Reparación de motor de 50 HP"
                  className="bg-white/[0.04] border-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuente" className="text-white/70">Fuente / Origen del Lead</Label>
                <Input
                  id="fuente"
                  value={newFuente}
                  onChange={(e) => setNewFuente(e.target.value)}
                  placeholder="Ej. Facebook Ads, Recomendado, etc."
                  className="bg-white/[0.04] border-white/5 text-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notas" className="text-white/70">Notas de seguimiento</Label>
                <Input
                  id="notas"
                  value={newNotas}
                  onChange={(e) => setNewNotas(e.target.value)}
                  placeholder="Información adicional útil para el socio..."
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
              Registrar Prospecto
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : prospectos.length === 0 ? (
        <div className="text-center py-12 bg-white/[0.01] border border-white/5 rounded-2xl">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-white font-medium text-lg">No hay prospectos registrados</h3>
          <p className="text-white/40 text-sm mt-1">Usa el botón &quot;Nuevo Prospecto&quot; para registrar los leads que vayas consiguiendo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {prospectos.map((p) => (
            <Card key={p.id} className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-all text-white overflow-hidden">
              <CardContent className="p-6">
                {editingId === p.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/50 text-xs">Socio Comercial</Label>
                        <select
                          value={editSocioId}
                          onChange={(e) => setEditSocioId(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/5 mt-1 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                        >
                          <option value="">-- Seleccionar --</option>
                          {socios.map(s => (
                            <option key={s.id} value={s.id} className="bg-[#0c0c0c]">{s.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-white/50 text-xs">Nombre del Prospecto</Label>
                        <Input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                      </div>
                      <div>
                        <Label className="text-white/50 text-xs">Teléfono</Label>
                        <Input value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                      </div>
                      <div>
                        <Label className="text-white/50 text-xs">Email</Label>
                        <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                      </div>
                      <div>
                        <Label className="text-white/50 text-xs">Monto Estimado</Label>
                        <Input type="number" value={editMonto} onChange={(e) => setEditMonto(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                      </div>
                      <div>
                        <Label className="text-white/50 text-xs">Etapa</Label>
                        <select
                          value={editEtapa}
                          onChange={(e) => setEditEtapa(e.target.value as Prospecto["etapa"])}
                          className="w-full bg-white/[0.04] border border-white/5 mt-1 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                        >
                          {ETAPAS.map(et => (
                            <option key={et.value} value={et.value} className="bg-[#0c0c0c]">{et.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/50 text-xs">Producto / Descripción del interés</Label>
                      <Input value={editDescripcion} onChange={(e) => setEditDescripcion(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/50 text-xs">Fuente</Label>
                        <Input value={editFuente} onChange={(e) => setEditFuente(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                      </div>
                      <div>
                        <Label className="text-white/50 text-xs">Notas</Label>
                        <Input value={editNotas} onChange={(e) => setEditNotas(e.target.value)} className="bg-white/[0.04] border-white/5 mt-1" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-white/50"><X className="w-4 h-4" /></Button>
                      <Button size="sm" onClick={() => handleUpdate(p.id)} disabled={saving} className="bg-emerald-500 text-black font-semibold">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />} Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-4 flex-1">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-lg font-bold text-white">{p.nombre}</h3>
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", ETAPA_COLOR[p.etapa])}>
                            {ETAPAS.find(e => e.value === p.etapa)?.label || p.etapa}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-1">Socio asignado: <span className="font-semibold text-amber-400">{p.socios?.nombre || "No asignado"}</span></p>
                      </div>

                      {p.descripcion && (
                        <div className="flex gap-2 items-start text-xs text-white/70 bg-white/[0.02] border border-white/5 p-2.5 rounded-lg">
                          <FileText className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{p.descripcion}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        {p.telefono && (
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <Phone className="w-3.5 h-3.5 text-amber-500" />
                            <span>{p.telefono}</span>
                          </div>
                        )}
                        {p.email && (
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <Mail className="w-3.5 h-3.5 text-amber-500" />
                            <span className="truncate">{p.email}</span>
                          </div>
                        )}
                        {p.monto_potencial && (
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span>Monto: <span className="font-semibold text-white">{formatCurrency(p.monto_potencial)}</span></span>
                          </div>
                        )}
                      </div>

                      {p.notas && (
                        <div className="text-xs border-t border-white/5 pt-3 space-y-1 text-white/55">
                          <p className="font-semibold text-[10px] uppercase tracking-wider text-white/30">Notas Internas</p>
                          <p>{p.notas}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(p)} className="text-white/40 hover:text-white">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="text-white/45 hover:text-red-400">
                        {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

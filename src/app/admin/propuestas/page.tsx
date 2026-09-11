"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Plus, Copy, Check, Trash2, Eye, Clock, CheckCircle2, FileText, Loader2,
} from "lucide-react";

interface Propuesta {
  id: string;
  token: string;
  nombre_prospecto: string;
  empresa: string | null;
  servicios: string[];
  precio_total: number | null;
  mensaje: string | null;
  vigencia_dias: number;
  status: "pendiente" | "vista" | "aceptada";
  visto_at: string | null;
  vistas_count: number;
  ultima_vista_at: string | null;
  created_at: string;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

const SERVICIOS_OPCIONES = [
  "Redes sociales",
  "Google My Business",
  "Análisis digital",
  "Diseño web",
  "Email marketing",
  "Publicidad en Meta",
  "Publicidad en Google",
  "Fotografía de producto",
];

const STATUS_CONFIG = {
  pendiente: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  vista: { label: "Vista", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  aceptada: { label: "Aceptada", color: "bg-northpeak-green/10 text-northpeak-green border-northpeak-green/20" },
};

function diasRestantes(created_at: string, vigencia_dias: number): number {
  const expiry = new Date(created_at);
  expiry.setDate(expiry.getDate() + vigencia_dias);
  const diff = expiry.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function PropuestasPage() {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCreatedLink, setShowCreatedLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { addToast } = useToast();

  // Form state
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [servicios, setServicios] = useState<string[]>([]);
  const [precio, setPrecio] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [vigencia, setVigencia] = useState("7");

  const fetchPropuestas = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/propuestas");
      if (res.ok) {
        const data = await res.json();
        setPropuestas(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPropuestas(); }, [fetchPropuestas]);

  function toggleServicio(s: string) {
    setServicios(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  }

  async function handleCreate() {
    if (!nombre) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/propuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_prospecto: nombre,
          empresa: empresa || null,
          servicios,
          precio_total: precio ? parseFloat(precio) : null,
          mensaje: mensaje || null,
          vigencia_dias: parseInt(vigencia),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Error al crear propuesta", "error");
        return;
      }
      setShowModal(false);
      setShowCreatedLink(data.url);
      resetForm();
      fetchPropuestas();
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta propuesta?")) return;
    const res = await fetch("/api/admin/propuestas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setPropuestas(prev => prev.filter(p => p.id !== id));
      addToast("Propuesta eliminada", "success");
    }
  }

  function getLink(token: string): string {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${base}/propuesta/${token}`;
  }

  async function copyLink(token: string, id: string) {
    const link = getLink(token);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const inp = document.createElement("input");
      inp.value = link;
      document.body.appendChild(inp);
      inp.select();
      document.execCommand("copy");
      document.body.removeChild(inp);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function resetForm() {
    setNombre(""); setEmpresa(""); setServicios([]);
    setPrecio(""); setMensaje(""); setVigencia("7");
  }

  const stats = {
    total: propuestas.length,
    pendientes: propuestas.filter(p => p.status === "pendiente").length,
    vistas: propuestas.filter(p => p.status === "vista").length,
    aceptadas: propuestas.filter(p => p.status === "aceptada").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-northpeak-text">Propuestas</h1>
          <p className="text-sm text-northpeak-text-muted mt-0.5">
            Crea y envía propuestas personalizadas a prospectos
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nueva propuesta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: FileText, color: "text-northpeak-text-muted" },
          { label: "Pendientes", value: stats.pendientes, icon: Clock, color: "text-yellow-400" },
          { label: "Vistas", value: stats.vistas, icon: Eye, color: "text-blue-400" },
          { label: "Aceptadas", value: stats.aceptadas, icon: CheckCircle2, color: "text-northpeak-green" },
        ].map(stat => (
          <Card key={stat.label} className="bg-northpeak-card border-northpeak-surface">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-northpeak-text">{stat.value}</p>
                <p className="text-xs text-northpeak-text-muted">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-northpeak-card border-northpeak-surface">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-northpeak-text-muted" />
            </div>
          ) : propuestas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-northpeak-text-dim mx-auto mb-3" />
              <p className="text-northpeak-text-muted text-sm">No hay propuestas aún</p>
              <p className="text-northpeak-text-dim text-xs mt-1">
                Crea tu primera propuesta para enviar a un prospecto
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-northpeak-surface">
                    <th className="text-left px-4 py-3 text-xs font-medium text-northpeak-text-muted uppercase tracking-wider">Prospecto</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-northpeak-text-muted uppercase tracking-wider hidden sm:table-cell">Empresa</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-northpeak-text-muted uppercase tracking-wider hidden md:table-cell">Precio</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-northpeak-text-muted uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-northpeak-text-muted uppercase tracking-wider hidden lg:table-cell">Vigencia</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-northpeak-text-muted uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {propuestas.map(p => {
                    const dias = diasRestantes(p.created_at, p.vigencia_dias);
                    const cfg = STATUS_CONFIG[p.status];
                    return (
                      <tr key={p.id} className="border-b border-northpeak-surface hover:bg-northpeak-surface/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-northpeak-text">{p.nombre_prospecto}</p>
                          <p className="text-xs text-northpeak-text-dim sm:hidden">{p.empresa}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-sm text-northpeak-text-muted">{p.empresa || "—"}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-sm text-northpeak-text">
                            {p.precio_total
                              ? `$${Number(p.precio_total).toLocaleString("es-MX")}`
                              : "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          {p.vistas_count > 0 && (
                            <p className="text-[10px] text-northpeak-text-dim mt-0.5">
                              {p.vistas_count} {p.vistas_count === 1 ? "vista" : "vistas"}
                              {p.ultima_vista_at && ` · ${timeAgo(p.ultima_vista_at)}`}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-sm text-northpeak-text-muted">
                            {p.status === "aceptada" ? "—" : dias > 0 ? `${dias}d restantes` : "Expirada"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyLink(p.token, p.id)}
                              className="border-northpeak-surface text-northpeak-text-muted text-xs h-7 px-2"
                            >
                              {copiedId === p.id ? (
                                <><Check className="h-3 w-3 mr-1 text-northpeak-green" />Copiado</>
                              ) : (
                                <><Copy className="h-3 w-3 mr-1" />Link</>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(p.id)}
                              className="text-northpeak-text-dim hover:text-red-400 h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New propuesta modal */}
      <Dialog open={showModal} onOpenChange={(v) => { setShowModal(v); if (!v) resetForm(); }}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-northpeak-text">Nueva propuesta</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-northpeak-text-muted text-xs">Nombre del prospecto *</Label>
                <Input
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej. María López"
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-northpeak-text-muted text-xs">Empresa</Label>
                <Input
                  value={empresa}
                  onChange={e => setEmpresa(e.target.value)}
                  placeholder="Ej. Café Central"
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-northpeak-text-muted text-xs">Servicios incluidos</Label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICIOS_OPCIONES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleServicio(s)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-left transition-colors border ${
                      servicios.includes(s)
                        ? "bg-northpeak-green/10 border-northpeak-green/30 text-northpeak-green"
                        : "bg-northpeak-bg border-northpeak-surface text-northpeak-text-muted hover:bg-northpeak-surface"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                      servicios.includes(s) ? "bg-northpeak-green border-northpeak-green" : "border-northpeak-surface"
                    }`}>
                      {servicios.includes(s) && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3l2 2 4-4" stroke="#05060A" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </span>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-northpeak-text-muted text-xs">Precio total (MXN)</Label>
                <Input
                  type="number"
                  value={precio}
                  onChange={e => setPrecio(e.target.value)}
                  placeholder="Ej. 8500"
                  className="bg-northpeak-bg border-northpeak-surface text-northpeak-text"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-northpeak-text-muted text-xs">Vigencia</Label>
                <select
                  value={vigencia}
                  onChange={e => setVigencia(e.target.value)}
                  className="w-full h-9 rounded-md border border-northpeak-surface bg-northpeak-bg text-northpeak-text text-sm px-3"
                >
                  <option value="7">7 días</option>
                  <option value="14">14 días</option>
                  <option value="30">30 días</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-northpeak-text-muted text-xs">Mensaje personalizado</Label>
              <Textarea
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                placeholder="Escribe un mensaje para el prospecto..."
                rows={3}
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="border-northpeak-surface text-northpeak-text-muted"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !nombre}
              className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
            >
              {creating ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Creando...</> : "Crear propuesta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link created dialog */}
      <Dialog open={!!showCreatedLink} onOpenChange={() => setShowCreatedLink(null)}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface max-w-md">
          <DialogHeader>
            <DialogTitle className="text-northpeak-text">Propuesta creada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-northpeak-bg rounded-lg border border-northpeak-surface">
              <code className="flex-1 text-xs text-northpeak-text-muted break-all font-mono">
                {showCreatedLink}
              </code>
            </div>
            <Button
              onClick={async () => {
                if (!showCreatedLink) return;
                try { await navigator.clipboard.writeText(showCreatedLink); }
                catch { /* fallback */ }
                addToast("Link copiado", "success");
                setShowCreatedLink(null);
              }}
              className="w-full bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

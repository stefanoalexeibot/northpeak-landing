"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  Plus,
  Minus,
  Trash2,
  Copy,
  MessageCircle,
  FileText,
  ShoppingCart,
} from "lucide-react";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio_mensual: number | null;
  precio_unico: number | null;
  activo: boolean;
}

interface LineItem {
  id: string;
  servicioId: string;
  nombre: string;
  tipo: "mensual" | "unico";
  precioUnitario: number;
  cantidad: number;
}

const CATEGORIA_LABELS: Record<string, string> = {
  marketing: "Marketing",
  desarrollo: "Desarrollo",
  diseno: "Diseño",
  consultoria: "Consultoría",
  otro: "Otro",
};

const CATEGORIA_COLORS: Record<string, string> = {
  marketing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  desarrollo: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  diseno: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  consultoria: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  otro: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function formatMXN(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function CotizadorPage() {
  const { addToast } = useToast();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [items, setItems] = useState<LineItem[]>([]);
  const [clientName, setClientName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [includeIVA, setIncludeIVA] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/catalogo");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setServicios(data.filter((s: Servicio) => s.activo));
      } catch {
        addToast("Error al cargar servicios", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categorias = useMemo(() => {
    const cats = new Set(servicios.map((s) => s.categoria));
    return ["todos", ...Array.from(cats)];
  }, [servicios]);

  const filteredServicios = useMemo(() => {
    if (categoriaFilter === "todos") return servicios;
    return servicios.filter((s) => s.categoria === categoriaFilter);
  }, [servicios, categoriaFilter]);

  function addService(s: Servicio, tipo: "mensual" | "unico") {
    const precio = tipo === "mensual" ? s.precio_mensual : s.precio_unico;
    if (!precio) return;

    setItems((prev) => [
      ...prev,
      {
        id: uid(),
        servicioId: s.id,
        nombre: s.nombre,
        tipo,
        precioUnitario: precio,
        cantidad: 1,
      },
    ]);
  }

  function updateItemQty(id: string, delta: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
      )
    );
  }

  function updateItemPrice(id: string, price: number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, precioUnitario: price } : item))
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0),
    [items]
  );

  const iva = includeIVA ? subtotal * 0.16 : 0;
  const total = subtotal + iva;

  const today = new Date().toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function buildText() {
    const lines: string[] = [];
    lines.push("*COTIZACION - NORTHPEAK*");
    lines.push(`Fecha: ${today}`);
    if (clientName) lines.push(`Cliente: ${clientName}`);
    if (businessName) lines.push(`Empresa: ${businessName}`);
    lines.push("");
    lines.push("--- Servicios ---");

    items.forEach((item, i) => {
      const tipoLabel = item.tipo === "mensual" ? "/mes" : "(unico)";
      const lineTotal = item.precioUnitario * item.cantidad;
      lines.push(
        `${i + 1}. ${item.nombre} ${tipoLabel} x${item.cantidad} = ${formatMXN(lineTotal)}`
      );
    });

    lines.push("");
    lines.push(`Subtotal: ${formatMXN(subtotal)}`);
    if (includeIVA) lines.push(`IVA (16%): ${formatMXN(iva)}`);
    lines.push(`*TOTAL: ${formatMXN(total)}*`);
    lines.push("");
    lines.push("Cotizacion valida por 15 dias.");

    return lines.join("\n");
  }

  function copyText() {
    navigator.clipboard.writeText(buildText());
    addToast("Cotización copiada al portapapeles");
  }

  function sendWhatsApp() {
    const text = encodeURIComponent(buildText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function showSummary() {
    addToast("Resumen generado (PDF pendiente de implementar)", "info");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">
            Cotizador Rápido
          </h1>
          <p className="text-northpeak-text-muted mt-1">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">
          Cotizador Rápido
        </h1>
        <p className="text-northpeak-text-muted mt-1">
          Selecciona servicios del catálogo para generar una cotización
        </p>
      </div>

      {/* Main layout: side by side on md+, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Service selector */}
        <div className="md:col-span-3 space-y-4">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-northpeak-text">Servicios disponibles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-2">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaFilter(cat)}
                    className={cn(
                      "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                      categoriaFilter === cat
                        ? "bg-northpeak-green/20 text-northpeak-green border-northpeak-green/30"
                        : "bg-northpeak-surface text-northpeak-text-muted border-northpeak-surface hover:text-northpeak-text"
                    )}
                  >
                    {cat === "todos" ? "Todos" : CATEGORIA_LABELS[cat] || cat}
                  </button>
                ))}
              </div>

              {/* Service list */}
              {filteredServicios.length === 0 ? (
                <p className="text-sm text-northpeak-text-dim py-4 text-center">
                  No hay servicios en esta categoría.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredServicios.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-northpeak-surface/50 hover:bg-northpeak-surface transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-northpeak-text truncate">
                            {s.nombre}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                              CATEGORIA_COLORS[s.categoria] || CATEGORIA_COLORS.otro
                            )}
                          >
                            {CATEGORIA_LABELS[s.categoria] || s.categoria}
                          </span>
                        </div>
                        {s.descripcion && (
                          <p className="text-xs text-northpeak-text-dim mt-0.5 line-clamp-1">
                            {s.descripcion}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {s.precio_mensual !== null && (
                          <button
                            onClick={() => addService(s, "mensual")}
                            className="text-xs font-medium px-2.5 py-1.5 rounded bg-northpeak-green/15 text-northpeak-green hover:bg-northpeak-green/25 transition-colors"
                          >
                            <Plus className="h-3 w-3 inline mr-1" />
                            {formatMXN(s.precio_mensual)}/mes
                          </button>
                        )}
                        {s.precio_unico !== null && (
                          <button
                            onClick={() => addService(s, "unico")}
                            className="text-xs font-medium px-2.5 py-1.5 rounded bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors"
                          >
                            <Plus className="h-3 w-3 inline mr-1" />
                            {formatMXN(s.precio_unico)}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Quotation preview */}
        <div className="md:col-span-2 space-y-4">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-northpeak-text flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Cotización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client info */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-northpeak-text-dim">Cliente (opcional)</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="bg-northpeak-surface border-northpeak-surface text-northpeak-text h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-northpeak-text-dim">Empresa (opcional)</Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Nombre de la empresa"
                    className="bg-northpeak-surface border-northpeak-surface text-northpeak-text h-8 text-sm"
                  />
                </div>
              </div>

              <p className="text-xs text-northpeak-text-dim">{today}</p>

              {/* Line items */}
              {items.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto text-northpeak-text-dim mb-2" />
                  <p className="text-sm text-northpeak-text-dim">
                    Agrega servicios desde el catálogo
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-northpeak-surface/50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-northpeak-text truncate">
                            {item.nombre}
                          </p>
                          <span className="text-[10px] text-northpeak-text-dim">
                            {item.tipo === "mensual" ? "Mensual" : "Pago único"}
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 rounded text-northpeak-text-dim hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Price input */}
                        <div className="flex items-center gap-1 flex-1">
                          <span className="text-xs text-northpeak-text-dim">$</span>
                          <input
                            type="number"
                            value={item.precioUnitario}
                            onChange={(e) =>
                              updateItemPrice(item.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-20 bg-northpeak-surface border border-northpeak-surface rounded px-1.5 py-1 text-xs text-northpeak-text focus:outline-none focus:ring-1 focus:ring-northpeak-green"
                          />
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateItemQty(item.id, -1)}
                            className="p-0.5 rounded bg-northpeak-surface hover:bg-northpeak-card text-northpeak-text-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs text-northpeak-text w-5 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => updateItemQty(item.id, 1)}
                            className="p-0.5 rounded bg-northpeak-surface hover:bg-northpeak-card text-northpeak-text-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Line total */}
                        <span className="text-sm font-medium text-northpeak-text w-20 text-right">
                          {formatMXN(item.precioUnitario * item.cantidad)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              {items.length > 0 && (
                <div className="border-t border-northpeak-surface pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-northpeak-text-muted">Subtotal</span>
                    <span className="text-northpeak-text">{formatMXN(subtotal)}</span>
                  </div>

                  {/* IVA toggle */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeIVA}
                        onChange={(e) => setIncludeIVA(e.target.checked)}
                        className="rounded border-northpeak-surface bg-northpeak-surface text-northpeak-green focus:ring-northpeak-green"
                      />
                      <span className="text-sm text-northpeak-text-muted">IVA (16%)</span>
                    </label>
                    {includeIVA && (
                      <span className="text-sm text-northpeak-text">{formatMXN(iva)}</span>
                    )}
                  </div>

                  <div className="flex justify-between text-base font-bold pt-1">
                    <span className="text-northpeak-text">Total</span>
                    <span className="text-northpeak-green">{formatMXN(total)}</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {items.length > 0 && (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Button
                    onClick={showSummary}
                    className="bg-northpeak-green hover:bg-northpeak-green/90 text-black w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generar PDF
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={copyText}
                      variant="outline"
                      className="border-northpeak-surface text-northpeak-text-muted hover:bg-northpeak-surface hover:text-northpeak-text"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar texto
                    </Button>
                    <Button
                      onClick={sendWhatsApp}
                      className="bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

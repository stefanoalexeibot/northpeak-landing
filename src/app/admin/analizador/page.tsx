"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Search,
  Loader2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Instagram,
  Facebook,
  Monitor,
  Megaphone,
  Check,
  Sparkles,
  DollarSign,
  Package,
  Zap,
} from "lucide-react";
import { getDefaultHallazgos } from "@/lib/analizador/scoring";
import type { Hallazgos, DatosNegocio } from "@/lib/analizador/scoring";
import type { Cotizacion } from "@/lib/analizador/pricing";
import { cn } from "@/lib/utils";

interface AnalisisRecord {
  id: string;
  nombre_negocio: string;
  giro: string;
  zona: string;
  score: number;
  nivel: string;
  report_url: string;
  client_id: string | null;
  created_at: string;
}

const GIROS = [
  "Restaurante",
  "Cafetería",
  "Salón de Belleza",
  "Salón de Uñas",
  "Barbería",
  "Gimnasio / Fitness",
  "Consultorio Médico",
  "Consultorio Dental",
  "Veterinaria",
  "Tienda de Ropa",
  "Tienda en línea",
  "Agencia de Marketing",
  "Despacho Contable",
  "Despacho Legal",
  "Inmobiliaria",
  "Constructora",
  "Taller Mecánico",
  "Escuela / Academia",
  "Spa / Wellness",
  "Fotografía",
  "Panadería / Repostería",
  "Floristería",
  "Otro",
];

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 w-full py-2 text-left"
    >
      <div
        className={cn(
          "flex h-5 w-9 items-center rounded-full px-0.5 transition-colors",
          value ? "bg-northpeak-green" : "bg-northpeak-surface"
        )}
      >
        <div
          className={cn(
            "h-4 w-4 rounded-full bg-white transition-transform",
            value ? "translate-x-4" : "translate-x-0"
          )}
        />
      </div>
      <span className="text-sm text-northpeak-text">{label}</span>
    </button>
  );
}

function NumberInput({
  value,
  onChange,
  label,
  min = 0,
  step = 1,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  min?: number;
  step?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-northpeak-text">{label}</span>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        step={step}
        max={max}
        className="w-24 bg-northpeak-bg border-northpeak-surface text-northpeak-text text-right h-8 text-sm"
      />
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  iconColor,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: typeof MapPin;
  iconColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="bg-northpeak-card border-northpeak-surface">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-4"
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("h-5 w-5", iconColor)} />
          <span className="text-sm font-medium text-northpeak-text">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-northpeak-text-dim" />
        ) : (
          <ChevronDown className="h-4 w-4 text-northpeak-text-dim" />
        )}
      </button>
      {open && (
        <CardContent className="px-4 pb-4 pt-0 border-t border-northpeak-surface">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

function nivelColor(nivel: string) {
  if (nivel === "CRITICO") return "text-red-400 bg-red-400/10";
  if (nivel === "BAJO") return "text-yellow-400 bg-yellow-400/10";
  if (nivel === "MEDIO") return "text-blue-400 bg-blue-400/10";
  return "text-green-400 bg-green-400/10";
}

export default function AnalizadorPage() {
  return (
    <Suspense>
      <AnalizadorContent />
    </Suspense>
  );
}

function AnalizadorContent() {
  const searchParams = useSearchParams();
  const linkedClientId = searchParams.get("client_id");
  const linkedClientName = searchParams.get("client_name");
  const { addToast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalisisRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [tab, setTab] = useState<"form" | "history">("form");
  const [aiLoading, setAiLoading] = useState(false);

  // Form state
  const [datos, setDatos] = useState<DatosNegocio>({
    nombre: "",
    giro: "",
    zona: "",
    contacto: "",
    telefono: "",
  });
  const [hallazgos, setHallazgos] = useState<Hallazgos>(getDefaultHallazgos());

  // Result state
  const [result, setResult] = useState<{
    score: number;
    nivel: string;
    oportunidades: number;
    report_url: string;
    cotizacion?: Cotizacion;
  } | null>(null);
  const [aiPricingLoading, setAiPricingLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/analisis");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      // ignore
    }
    setLoadingHistory(false);
  }

  function updateGM<K extends keyof Hallazgos["google_maps"]>(key: K, val: Hallazgos["google_maps"][K]) {
    setHallazgos((prev) => ({ ...prev, google_maps: { ...prev.google_maps, [key]: val } }));
  }
  function updateGS<K extends keyof Hallazgos["google_search"]>(key: K, val: Hallazgos["google_search"][K]) {
    setHallazgos((prev) => ({ ...prev, google_search: { ...prev.google_search, [key]: val } }));
  }
  function updateIG<K extends keyof Hallazgos["instagram"]>(key: K, val: Hallazgos["instagram"][K]) {
    setHallazgos((prev) => ({ ...prev, instagram: { ...prev.instagram, [key]: val } }));
  }
  function updateFB<K extends keyof Hallazgos["facebook"]>(key: K, val: Hallazgos["facebook"][K]) {
    setHallazgos((prev) => ({ ...prev, facebook: { ...prev.facebook, [key]: val } }));
  }
  function updateSW<K extends keyof Hallazgos["sitio_web"]>(key: K, val: Hallazgos["sitio_web"][K]) {
    setHallazgos((prev) => ({ ...prev, sitio_web: { ...prev.sitio_web, [key]: val } }));
  }
  function updatePUB<K extends keyof Hallazgos["publicidad"]>(key: K, val: Hallazgos["publicidad"][K]) {
    setHallazgos((prev) => ({ ...prev, publicidad: { ...prev.publicidad, [key]: val } }));
  }

  async function handleGenerate() {
    if (!datos.nombre || !datos.giro || !datos.zona) {
      addToast("Llena al menos nombre, giro y zona del negocio", "error");
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/analisis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos, hallazgos, client_id: linkedClientId }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || "Error al generar análisis", "error");
        setGenerating(false);
        return;
      }

      setResult({
        score: data.score,
        nivel: data.nivel,
        oportunidades: data.oportunidades,
        report_url: data.report_url,
        cotizacion: data.cotizacion,
      });

      addToast(`Análisis generado: ${data.score}/100 (${data.nivel})`, "success");
      loadHistory();
    } catch {
      addToast("Error de conexión", "error");
    }

    setGenerating(false);
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    addToast("Link copiado al portapapeles", "success");
    setTimeout(() => setCopied(null), 2000);
  }

  function resetForm() {
    setDatos({ nombre: "", giro: "", zona: "", contacto: "", telefono: "" });
    setHallazgos(getDefaultHallazgos());
    setResult(null);
  }

  async function handleAiPricing() {
    if (!result?.cotizacion) return;
    setAiPricingLoading(true);
    try {
      const res = await fetch("/api/ai/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicios: result.cotizacion.serviciosRecomendados,
          giro: datos.giro,
          zona: datos.zona,
          score: result.score,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Error al ajustar precios", "error");
      } else {
        // Apply adjusted prices
        const adjusted = { ...result.cotizacion };
        adjusted.serviciosRecomendados = adjusted.serviciosRecomendados.map((s) => {
          const adj = data.serviciosAjustados?.find((a: { id: string; precioAjustado: number }) => a.id === s.id);
          return adj ? { ...s, precioFinal: adj.precioAjustado } : s;
        });
        adjusted.totalMensualIndividual = adjusted.serviciosRecomendados
          .filter((s) => s.tipo === "mensual")
          .reduce((sum, s) => sum + s.precioFinal, 0);
        adjusted.totalUnicoIndividual = adjusted.serviciosRecomendados
          .filter((s) => s.tipo === "unico")
          .reduce((sum, s) => sum + s.precioFinal, 0);
        adjusted.totalIndividual = adjusted.totalMensualIndividual + adjusted.totalUnicoIndividual;
        if (adjusted.paqueteRecomendado) {
          adjusted.ahorroConPaquete = Math.max(0, adjusted.totalMensualIndividual - adjusted.paqueteRecomendado.precioMensual);
        }
        setResult({ ...result, cotizacion: adjusted });
        addToast(data.notaIA || "Precios ajustados por IA", "success");
      }
    } catch {
      addToast("Error de conexión", "error");
    }
    setAiPricingLoading(false);
  }

  function copyCotizacion() {
    if (!result?.cotizacion) return;
    const cot = result.cotizacion;
    const lines = [
      `COTIZACIÓN — ${datos.nombre}`,
      `${datos.giro} · ${datos.zona}`,
      "",
      "SERVICIOS RECOMENDADOS:",
      ...cot.serviciosRecomendados.map(
        (s) => `  - ${s.nombre}: $${s.precioFinal.toLocaleString("es-MX")} (${s.tipo})`
      ),
      "",
      `Total mensual individual: $${cot.totalMensualIndividual.toLocaleString("es-MX")}/mes`,
    ];
    if (cot.totalUnicoIndividual > 0) {
      lines.push(`Servicios únicos: $${cot.totalUnicoIndividual.toLocaleString("es-MX")}`);
    }
    if (cot.paqueteRecomendado) {
      lines.push(
        "",
        `PAQUETE RECOMENDADO: ${cot.paqueteRecomendado.nombre}`,
        `$${cot.paqueteRecomendado.precioMensual.toLocaleString("es-MX")}/mes`,
        `Ahorro: $${cot.ahorroConPaquete.toLocaleString("es-MX")}/mes`
      );
    }
    lines.push("", "Precios en MXN + IVA");
    navigator.clipboard.writeText(lines.join("\n"));
    addToast("Cotización copiada al portapapeles", "success");
  }

  async function handleAiFill() {
    if (!datos.nombre || !datos.giro || !datos.zona) {
      addToast("Llena nombre, giro y zona antes de usar IA", "error");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: datos.nombre, giro: datos.giro, zona: datos.zona }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Error al analizar con IA", "error");
      } else {
        setHallazgos(data.hallazgos);
        addToast("Hallazgos estimados por IA. Revisa y ajusta antes de generar.", "success");
      }
    } catch {
      addToast("Error de conexión", "error");
    }
    setAiLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-northpeak-text">
            Analizador Digital
          </h1>
          <p className="text-northpeak-text-muted mt-1">
            Analiza la presencia digital de prospectos y genera reportes
          </p>
          {linkedClientName && (
            <p className="text-xs text-northpeak-green mt-1">
              Vinculado a: <span className="font-medium">{linkedClientName}</span>
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-northpeak-card border border-northpeak-surface rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("form")}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
            tab === "form"
              ? "bg-northpeak-green/10 text-northpeak-green"
              : "text-northpeak-text-muted hover:text-northpeak-text"
          )}
        >
          Nuevo Análisis
        </button>
        <button
          onClick={() => setTab("history")}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
            tab === "history"
              ? "bg-northpeak-green/10 text-northpeak-green"
              : "text-northpeak-text-muted hover:text-northpeak-text"
          )}
        >
          Historial ({history.length})
        </button>
      </div>

      {tab === "form" ? (
        <div className="space-y-4">
          {/* Result banner */}
          {result && (
            <Card className="bg-northpeak-card border-northpeak-green/30">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full text-2xl font-heading font-bold",
                        nivelColor(result.nivel)
                      )}
                    >
                      {result.score}
                    </div>
                    <div>
                      <p className="text-northpeak-text font-medium">
                        Análisis generado:{" "}
                        <span className={nivelColor(result.nivel).split(" ")[0]}>
                          {result.nivel}
                        </span>
                      </p>
                      <p className="text-sm text-northpeak-text-muted">
                        {result.oportunidades} oportunidades encontradas
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(result.report_url)}
                      className="border-northpeak-surface text-northpeak-text"
                    >
                      {copied === result.report_url ? (
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Copiar link
                    </Button>
                    <a href={result.report_url} target="_blank" rel="noreferrer">
                      <Button
                        size="sm"
                        className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Ver reporte
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetForm}
                      className="border-northpeak-surface text-northpeak-text-muted"
                    >
                      Nuevo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cotizacion card */}
          {result?.cotizacion && result.cotizacion.serviciosRecomendados.length > 0 && (
            <Card className="bg-northpeak-card border-northpeak-surface">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-northpeak-text font-heading text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-northpeak-green" />
                    Cotización Automática
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAiPricing}
                      disabled={aiPricingLoading}
                      className="border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 h-7 text-xs"
                    >
                      {aiPricingLoading ? (
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-1.5" />
                      )}
                      Ajustar con IA
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyCotizacion}
                      className="border-northpeak-surface text-northpeak-text-muted h-7 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1.5" />
                      Copiar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Services table */}
                <div className="border border-northpeak-surface rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-northpeak-surface bg-northpeak-bg/50">
                        <th className="text-left px-4 py-2 text-xs font-medium text-northpeak-text-dim uppercase tracking-wider">Servicio</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-northpeak-text-dim uppercase tracking-wider">Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.cotizacion.serviciosRecomendados.map((s) => (
                        <tr key={s.id} className="border-b border-northpeak-surface last:border-0">
                          <td className="px-4 py-3">
                            <div className="text-northpeak-text font-medium text-sm">{s.nombre}</div>
                            <div className="text-northpeak-text-dim text-xs">{s.canal}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-northpeak-text font-mono font-medium">
                              ${s.precioFinal.toLocaleString("es-MX")}
                            </span>
                            <span className="text-northpeak-text-dim text-xs ml-1">
                              {s.tipo === "mensual" ? "/mes" : "único"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-northpeak-bg rounded-lg p-3 text-center">
                    <div className="text-xs text-northpeak-text-dim uppercase tracking-wider mb-1">Individual</div>
                    <div className="text-lg font-heading font-bold text-northpeak-text">
                      ${result.cotizacion.totalMensualIndividual.toLocaleString("es-MX")}
                      <span className="text-xs text-northpeak-text-dim font-normal">/mes</span>
                    </div>
                  </div>
                  {result.cotizacion.paqueteRecomendado && (
                    <div className="flex-1 bg-northpeak-green/5 border border-northpeak-green/20 rounded-lg p-3 text-center">
                      <div className="text-xs text-northpeak-green uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        <Package className="h-3 w-3" />
                        {result.cotizacion.paqueteRecomendado.nombre}
                      </div>
                      <div className="text-lg font-heading font-bold text-northpeak-green">
                        ${result.cotizacion.paqueteRecomendado.precioMensual.toLocaleString("es-MX")}
                        <span className="text-xs text-northpeak-green/60 font-normal">/mes</span>
                      </div>
                    </div>
                  )}
                  {result.cotizacion.ahorroConPaquete > 0 && (
                    <div className="flex-1 bg-northpeak-bg rounded-lg p-3 text-center flex flex-col items-center justify-center">
                      <Zap className="h-4 w-4 text-yellow-400 mb-1" />
                      <div className="text-sm font-bold text-yellow-400">
                        -${result.cotizacion.ahorroConPaquete.toLocaleString("es-MX")}
                      </div>
                      <div className="text-xs text-northpeak-text-dim">ahorro/mes</div>
                    </div>
                  )}
                </div>

                {result.cotizacion.totalUnicoIndividual > 0 && (
                  <p className="text-xs text-northpeak-text-dim text-center">
                    + ${result.cotizacion.totalUnicoIndividual.toLocaleString("es-MX")} MXN en servicios únicos (desarrollo, branding)
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Business info */}
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-northpeak-text font-heading text-base">
                Datos del Negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-northpeak-text text-xs">Nombre del negocio *</Label>
                  <Input
                    value={datos.nombre}
                    onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                    placeholder="Ej: Café del Centro"
                    className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-northpeak-text text-xs">Giro *</Label>
                  <select
                    value={datos.giro}
                    onChange={(e) => setDatos({ ...datos, giro: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-northpeak-surface bg-northpeak-bg px-3 py-1 text-sm text-northpeak-text"
                  >
                    <option value="">Seleccionar...</option>
                    {GIROS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-northpeak-text text-xs">Zona / Ubicación *</Label>
                  <Input
                    value={datos.zona}
                    onChange={(e) => setDatos({ ...datos, zona: e.target.value })}
                    placeholder="Ej: San Pedro Garza García, NL"
                    className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-northpeak-text text-xs">Contacto</Label>
                  <Input
                    value={datos.contacto}
                    onChange={(e) => setDatos({ ...datos, contacto: e.target.value })}
                    placeholder="Nombre del dueño/a"
                    className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-northpeak-text text-xs">Teléfono</Label>
                  <Input
                    value={datos.telefono}
                    onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                    placeholder="+52 81 ..."
                    className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Auto-fill button */}
          <Button
            onClick={handleAiFill}
            disabled={aiLoading || !datos.nombre || !datos.giro || !datos.zona}
            variant="outline"
            className="w-full border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 h-10"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analizando con IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Llenar con IA (estimación automática)
              </>
            )}
          </Button>

          {/* Channel sections */}
          <SectionCard title="Google Maps (25 pts)" icon={MapPin} iconColor="text-red-400" defaultOpen>
            <div className="space-y-1 mt-3">
              <Toggle value={hallazgos.google_maps.tiene_perfil} onChange={(v) => updateGM("tiene_perfil", v)} label="Tiene perfil en Google Maps" />
              <Toggle value={hallazgos.google_maps.perfil_reclamado} onChange={(v) => updateGM("perfil_reclamado", v)} label="Perfil reclamado/verificado" />
              <NumberInput value={hallazgos.google_maps.num_resenas} onChange={(v) => updateGM("num_resenas", v)} label="Número de reseñas" />
              <NumberInput value={hallazgos.google_maps.rating} onChange={(v) => updateGM("rating", v)} label="Rating (0-5)" step={0.1} max={5} />
              <Toggle value={hallazgos.google_maps.tiene_fotos} onChange={(v) => updateGM("tiene_fotos", v)} label="Tiene fotos" />
              <NumberInput value={hallazgos.google_maps.num_fotos} onChange={(v) => updateGM("num_fotos", v)} label="Número de fotos" />
              <Toggle value={hallazgos.google_maps.tiene_horarios} onChange={(v) => updateGM("tiene_horarios", v)} label="Horarios actualizados" />
              <Toggle value={hallazgos.google_maps.tiene_sitio_web} onChange={(v) => updateGM("tiene_sitio_web", v)} label="Link a sitio web" />
              <Toggle value={hallazgos.google_maps.tiene_telefono} onChange={(v) => updateGM("tiene_telefono", v)} label="Teléfono visible" />
              <Toggle value={hallazgos.google_maps.responde_resenas} onChange={(v) => updateGM("responde_resenas", v)} label="Responde reseñas" />
            </div>
          </SectionCard>

          <SectionCard title="Google Search (10 pts)" icon={Search} iconColor="text-blue-400">
            <div className="space-y-1 mt-3">
              <Toggle value={hallazgos.google_search.aparece_busqueda} onChange={(v) => updateGS("aparece_busqueda", v)} label='Aparece al buscar "[nombre] [zona]"' />
              <NumberInput value={hallazgos.google_search.posicion_aprox} onChange={(v) => updateGS("posicion_aprox", v)} label="Posición aprox (0 = no aparece)" />
              <Toggle value={hallazgos.google_search.tiene_seo_basico} onChange={(v) => updateGS("tiene_seo_basico", v)} label="Tiene SEO básico" />
            </div>
          </SectionCard>

          <SectionCard title="Instagram (25 pts)" icon={Instagram} iconColor="text-pink-400">
            <div className="space-y-1 mt-3">
              <Toggle value={hallazgos.instagram.tiene_cuenta} onChange={(v) => updateIG("tiene_cuenta", v)} label="Tiene cuenta" />
              {hallazgos.instagram.tiene_cuenta && (
                <>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-northpeak-text">Username</span>
                    <Input
                      value={hallazgos.instagram.username}
                      onChange={(e) => updateIG("username", e.target.value)}
                      placeholder="@..."
                      className="w-40 bg-northpeak-bg border-northpeak-surface text-northpeak-text h-8 text-sm"
                    />
                  </div>
                  <NumberInput value={hallazgos.instagram.seguidores} onChange={(v) => updateIG("seguidores", v)} label="Seguidores" />
                  <NumberInput value={hallazgos.instagram.posts_ultimo_mes} onChange={(v) => updateIG("posts_ultimo_mes", v)} label="Posts en el último mes" />
                  <Toggle value={hallazgos.instagram.tiene_highlights} onChange={(v) => updateIG("tiene_highlights", v)} label="Tiene Highlights" />
                  <Toggle value={hallazgos.instagram.tiene_link_bio} onChange={(v) => updateIG("tiene_link_bio", v)} label="Link en bio" />
                  <Toggle value={hallazgos.instagram.tiene_whatsapp_bio} onChange={(v) => updateIG("tiene_whatsapp_bio", v)} label="WhatsApp en bio" />
                  <Toggle value={hallazgos.instagram.usa_reels} onChange={(v) => updateIG("usa_reels", v)} label="Usa Reels" />
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-northpeak-text">Calidad contenido</span>
                    <select
                      value={hallazgos.instagram.calidad_contenido}
                      onChange={(e) => updateIG("calidad_contenido", e.target.value as "baja" | "media" | "alta")}
                      className="w-28 h-8 rounded-md border border-northpeak-surface bg-northpeak-bg px-2 text-sm text-northpeak-text"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                  <Toggle value={hallazgos.instagram.tiene_precios} onChange={(v) => updateIG("tiene_precios", v)} label="Muestra precios" />
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Facebook (15 pts)" icon={Facebook} iconColor="text-blue-500">
            <div className="space-y-1 mt-3">
              <Toggle value={hallazgos.facebook.tiene_pagina} onChange={(v) => updateFB("tiene_pagina", v)} label="Tiene página" />
              {hallazgos.facebook.tiene_pagina && (
                <>
                  <Toggle value={hallazgos.facebook.pagina_activa} onChange={(v) => updateFB("pagina_activa", v)} label="Activa (publicó últimos 30 días)" />
                  <Toggle value={hallazgos.facebook.tiene_resenas_fb} onChange={(v) => updateFB("tiene_resenas_fb", v)} label="Tiene reseñas" />
                  <NumberInput value={hallazgos.facebook.num_likes} onChange={(v) => updateFB("num_likes", v)} label="Likes / Seguidores" />
                  <Toggle value={hallazgos.facebook.tiene_messenger} onChange={(v) => updateFB("tiene_messenger", v)} label="Messenger activo" />
                  <Toggle value={hallazgos.facebook.responde_rapido} onChange={(v) => updateFB("responde_rapido", v)} label="Badge de respuesta rápida" />
                  <Toggle value={hallazgos.facebook.tiene_catalogo} onChange={(v) => updateFB("tiene_catalogo", v)} label="Catálogo de servicios" />
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Sitio Web (15 pts)" icon={Monitor} iconColor="text-green-400">
            <div className="space-y-1 mt-3">
              <Toggle value={hallazgos.sitio_web.tiene_sitio} onChange={(v) => updateSW("tiene_sitio", v)} label="Tiene sitio web" />
              {hallazgos.sitio_web.tiene_sitio && (
                <>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-northpeak-text">URL</span>
                    <Input
                      value={hallazgos.sitio_web.url}
                      onChange={(e) => updateSW("url", e.target.value)}
                      placeholder="https://..."
                      className="w-56 bg-northpeak-bg border-northpeak-surface text-northpeak-text h-8 text-sm"
                    />
                  </div>
                  <Toggle value={hallazgos.sitio_web.es_responsive} onChange={(v) => updateSW("es_responsive", v)} label="Responsive (se ve bien en celular)" />
                  <Toggle value={hallazgos.sitio_web.tiene_whatsapp} onChange={(v) => updateSW("tiene_whatsapp", v)} label="Botón de WhatsApp" />
                  <Toggle value={hallazgos.sitio_web.tiene_booking} onChange={(v) => updateSW("tiene_booking", v)} label="Sistema de reservas" />
                  <Toggle value={hallazgos.sitio_web.tiene_precios} onChange={(v) => updateSW("tiene_precios", v)} label="Muestra precios" />
                  <Toggle value={hallazgos.sitio_web.tiene_ssl} onChange={(v) => updateSW("tiene_ssl", v)} label="HTTPS / SSL" />
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-northpeak-text">Velocidad</span>
                    <select
                      value={hallazgos.sitio_web.velocidad}
                      onChange={(e) => updateSW("velocidad", e.target.value as "lenta" | "media" | "rapida" | "n/a")}
                      className="w-28 h-8 rounded-md border border-northpeak-surface bg-northpeak-bg px-2 text-sm text-northpeak-text"
                    >
                      <option value="lenta">Lenta</option>
                      <option value="media">Media</option>
                      <option value="rapida">Rápida</option>
                      <option value="n/a">N/A</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Publicidad (10 pts)" icon={Megaphone} iconColor="text-yellow-400">
            <div className="space-y-1 mt-3">
              <Toggle value={hallazgos.publicidad.tiene_meta_ads} onChange={(v) => updatePUB("tiene_meta_ads", v)} label="Meta Ads activos (Facebook/Instagram)" />
              <Toggle value={hallazgos.publicidad.tiene_google_ads} onChange={(v) => updatePUB("tiene_google_ads", v)} label="Google Ads activos" />
            </div>
          </SectionCard>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 h-12 text-base font-medium"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generando análisis...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Generar Análisis
              </>
            )}
          </Button>
        </div>
      ) : (
        /* History tab */
        <div className="space-y-3">
          {loadingHistory ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-northpeak-text-dim mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <Card className="bg-northpeak-card border-northpeak-surface">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-northpeak-text-dim mx-auto mb-4" />
                <p className="text-northpeak-text-muted">
                  Aún no hay análisis. Crea el primero.
                </p>
              </CardContent>
            </Card>
          ) : (
            history.map((a) => (
              <Card key={a.id} className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-surface/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full text-lg font-heading font-bold shrink-0",
                        nivelColor(a.nivel)
                      )}
                    >
                      {a.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-northpeak-text truncate">
                        {a.nombre_negocio}
                      </p>
                      <p className="text-xs text-northpeak-text-muted">
                        {a.giro} · {a.zona}
                      </p>
                      <p className="text-xs text-northpeak-text-dim mt-0.5">
                        {new Date(a.created_at).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink(a.report_url)}
                        className="text-northpeak-text-muted hover:text-northpeak-text h-8"
                      >
                        {copied === a.report_url ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <a href={a.report_url} target="_blank" rel="noreferrer">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-northpeak-green hover:text-northpeak-green/80 h-8"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

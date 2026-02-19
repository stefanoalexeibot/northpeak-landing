"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Instagram,
  Facebook,
  Monitor,
  Megaphone,
  Search,
  Loader2,
  ExternalLink,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ComboboxInput from "@/components/ui/combobox-input";
import { ZONAS_MEXICO, GIROS_NEGOCIO } from "@/lib/suggestions";
import { getDefaultHallazgos } from "@/lib/analizador/scoring";
import type { Hallazgos, DatosNegocio, Oportunidad } from "@/lib/analizador/scoring";

// ─── Reusable form primitives ──────────────────────────────────────────────

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
          "flex h-5 w-9 items-center rounded-full px-0.5 transition-colors shrink-0",
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
    <div className="bg-northpeak-card border border-northpeak-surface rounded-xl overflow-hidden">
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
        <div className="px-4 pb-4 pt-0 border-t border-northpeak-surface">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Nivel helpers ─────────────────────────────────────────────────────────

function nivelColor(nivel: string) {
  if (nivel === "CRITICO") return "text-red-400 bg-red-400/10 border-red-400/20";
  if (nivel === "BAJO") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
  if (nivel === "MEDIO") return "text-blue-400 bg-blue-400/10 border-blue-400/20";
  return "text-green-400 bg-green-400/10 border-green-400/20";
}

function nivelTextColor(nivel: string) {
  if (nivel === "CRITICO") return "text-red-400";
  if (nivel === "BAJO") return "text-yellow-400";
  if (nivel === "MEDIO") return "text-blue-400";
  return "text-green-400";
}

function impactoColor(impacto: string) {
  if (impacto === "critico") return "text-red-400 bg-red-400/10";
  if (impacto === "alto") return "text-orange-400 bg-orange-400/10";
  return "text-blue-400 bg-blue-400/10";
}

// ─── Results view ──────────────────────────────────────────────────────────

function ResultsView({
  result,
  datos,
  onReset,
}: {
  result: {
    score: number;
    nivel: string;
    prioridad_desc: string;
    oportunidades: Oportunidad[];
    report_url: string;
  };
  datos: DatosNegocio;
  onReset: () => void;
}) {
  const waNumber = process.env.NEXT_PUBLIC_NORTHPEAK_WA;
  const waMsg = encodeURIComponent(
    `Hola, acabo de hacer el diagnóstico digital de *${datos.nombre}* y obtuve ${result.score}/100 (${result.nivel}). Me interesa mejorar mi presencia digital. ¿Pueden ayudarme?`
  );
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : null;

  return (
    <div className="min-h-screen bg-northpeak-bg">
      {/* Header */}
      <header className="border-b border-northpeak-surface bg-northpeak-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-northpeak-green flex items-center justify-center shrink-0">
            <span className="text-northpeak-bg font-heading font-bold text-sm">N</span>
          </div>
          <span className="font-heading font-bold text-northpeak-text">NorthPeak Digital</span>
          <button
            onClick={onReset}
            className="ml-auto flex items-center gap-1.5 text-xs text-northpeak-text-muted hover:text-northpeak-text transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Nuevo diagnóstico
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Score card */}
        <div className={cn("rounded-xl border p-6", nivelColor(result.nivel))}>
          <div className="flex items-center gap-6">
            <div
              className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 text-3xl font-heading font-bold",
                nivelColor(result.nivel)
              )}
            >
              {result.score}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-northpeak-text-muted mb-1">
                Diagnóstico de {datos.nombre}
              </p>
              <p className={cn("text-xl font-heading font-bold", nivelTextColor(result.nivel))}>
                Nivel {result.nivel}
              </p>
              <p className="text-sm text-northpeak-text-muted mt-1 leading-relaxed">
                {result.prioridad_desc}
              </p>
            </div>
          </div>
        </div>

        {/* Oportunidades */}
        {result.oportunidades.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-northpeak-text">
              {result.oportunidades.length} áreas de mejora detectadas
            </h2>
            {result.oportunidades.map((op, i) => (
              <div
                key={i}
                className="bg-northpeak-card border border-northpeak-surface rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{op.icono}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-medium text-northpeak-text">{op.titulo}</p>
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium",
                          impactoColor(op.impacto)
                        )}
                      >
                        {op.impacto === "critico"
                          ? "Crítico"
                          : op.impacto === "alto"
                          ? "Alto impacto"
                          : "Oportunidad"}
                      </span>
                    </div>
                    <p className="text-xs text-northpeak-text-muted leading-relaxed">{op.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={result.report_url} target="_blank" rel="noreferrer" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-northpeak-surface text-northpeak-text hover:border-northpeak-green/30"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver reporte completo
            </Button>
          </a>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noreferrer" className="flex-1">
              <Button className="w-full bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
                <MessageCircle className="h-4 w-4 mr-2" />
                Hablar con un experto
              </Button>
            </a>
          )}
        </div>

        {/* CTA card */}
        <div className="bg-northpeak-card border border-northpeak-green/20 rounded-xl p-5 text-center space-y-3">
          <p className="text-sm font-semibold text-northpeak-text">
            ¿Listo para mejorar tu presencia digital?
          </p>
          <p className="text-xs text-northpeak-text-muted leading-relaxed">
            En NorthPeak Digital somos especialistas en posicionamiento local, redes sociales y
            publicidad digital para negocios en México. Podemos atender cada una de las áreas
            detectadas en tu diagnóstico.
          </p>
          {waUrl ? (
            <a href={waUrl} target="_blank" rel="noreferrer">
              <Button className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
                <MessageCircle className="h-4 w-4 mr-2" />
                Agendar consulta gratuita
              </Button>
            </a>
          ) : (
            <p className="text-xs text-northpeak-text-dim italic">
              Contáctanos para una consulta gratuita y personalizada.
            </p>
          )}
        </div>

        <p className="text-xs text-northpeak-text-dim text-center pb-8">
          © NorthPeak Digital · Diagnóstico automatizado basado en los datos ingresados
        </p>
      </main>
    </div>
  );
}

// ─── Main form ─────────────────────────────────────────────────────────────

export default function AnalizarPublicoPage() {
  const [datos, setDatos] = useState<DatosNegocio>({
    nombre: "",
    giro: "",
    zona: "",
    contacto: "",
    telefono: "",
  });
  const [hallazgos, setHallazgos] = useState<Hallazgos>(getDefaultHallazgos());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score: number;
    nivel: string;
    prioridad_desc: string;
    oportunidades: Oportunidad[];
    report_url: string;
  } | null>(null);

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

  function reset() {
    setDatos({ nombre: "", giro: "", zona: "", contacto: "", telefono: "" });
    setHallazgos(getDefaultHallazgos());
    setResult(null);
    setError(null);
  }

  async function handleSubmit() {
    if (!datos.nombre || !datos.giro || !datos.zona) {
      setError("Completa los campos requeridos: nombre del negocio, giro y zona.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos, hallazgos }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al generar el diagnóstico.");
        return;
      }
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Error de conexión. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return <ResultsView result={result} datos={datos} onReset={reset} />;
  }

  return (
    <div className="min-h-screen bg-northpeak-bg">
      {/* Header */}
      <header className="border-b border-northpeak-surface bg-northpeak-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-northpeak-green flex items-center justify-center shrink-0">
            <span className="text-northpeak-bg font-heading font-bold text-sm">N</span>
          </div>
          <span className="font-heading font-bold text-northpeak-text">NorthPeak Digital</span>
          <span className="text-northpeak-text-muted text-sm ml-auto hidden sm:block">Diagnóstico gratuito</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Intro */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">
            ¿Cómo está la presencia digital de tu negocio?
          </h1>
          <p className="text-northpeak-text-muted mt-2 text-sm leading-relaxed">
            Responde estas preguntas y obtén un diagnóstico gratuito con las áreas de mejora más
            importantes. Tarda menos de 3 minutos.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Datos del negocio */}
        <div className="bg-northpeak-card border border-northpeak-surface rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-northpeak-text">Tu negocio</h2>
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
              <ComboboxInput
                value={datos.giro}
                onChange={(v) => setDatos({ ...datos, giro: v })}
                options={GIROS_NEGOCIO}
                placeholder="Restaurante, Salón..."
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-northpeak-text text-xs">Ciudad / Zona *</Label>
              <ComboboxInput
                value={datos.zona}
                onChange={(v) => setDatos({ ...datos, zona: v })}
                options={ZONAS_MEXICO}
                placeholder="San Pedro Garza García, NL"
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-northpeak-text text-xs">Tu nombre</Label>
              <Input
                value={datos.contacto}
                onChange={(e) => setDatos({ ...datos, contacto: e.target.value })}
                placeholder="Dueño/a del negocio"
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-9"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-northpeak-text text-xs">WhatsApp (para enviarte el reporte)</Label>
              <Input
                value={datos.telefono}
                onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                placeholder="+52 81 ..."
                className="bg-northpeak-bg border-northpeak-surface text-northpeak-text h-9"
              />
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <SectionCard title="Google Maps" icon={MapPin} iconColor="text-red-400" defaultOpen>
          <div className="space-y-1 mt-3">
            <Toggle
              value={hallazgos.google_maps.tiene_perfil}
              onChange={(v) => updateGM("tiene_perfil", v)}
              label="Tienes perfil en Google Maps"
            />
            <Toggle
              value={hallazgos.google_maps.perfil_reclamado}
              onChange={(v) => updateGM("perfil_reclamado", v)}
              label="El perfil está reclamado/verificado"
            />
            <NumberInput
              value={hallazgos.google_maps.num_resenas}
              onChange={(v) => updateGM("num_resenas", v)}
              label="Número de reseñas (aproximado)"
            />
            <NumberInput
              value={hallazgos.google_maps.rating}
              onChange={(v) => updateGM("rating", v)}
              label="Calificación promedio (0–5)"
              step={0.1}
              max={5}
            />
            <Toggle
              value={hallazgos.google_maps.tiene_fotos}
              onChange={(v) => updateGM("tiene_fotos", v)}
              label="Tienes fotos del negocio"
            />
            <NumberInput
              value={hallazgos.google_maps.num_fotos}
              onChange={(v) => updateGM("num_fotos", v)}
              label="Número de fotos"
            />
            <Toggle
              value={hallazgos.google_maps.tiene_horarios}
              onChange={(v) => updateGM("tiene_horarios", v)}
              label="Horarios de atención actualizados"
            />
            <Toggle
              value={hallazgos.google_maps.tiene_sitio_web}
              onChange={(v) => updateGM("tiene_sitio_web", v)}
              label="Link a sitio web en el perfil"
            />
            <Toggle
              value={hallazgos.google_maps.tiene_telefono}
              onChange={(v) => updateGM("tiene_telefono", v)}
              label="Teléfono visible"
            />
            <Toggle
              value={hallazgos.google_maps.responde_resenas}
              onChange={(v) => updateGM("responde_resenas", v)}
              label="Respondes las reseñas"
            />
          </div>
        </SectionCard>

        {/* Google Search */}
        <SectionCard title="Google (Búsquedas)" icon={Search} iconColor="text-blue-400">
          <div className="space-y-1 mt-3">
            <Toggle
              value={hallazgos.google_search.aparece_busqueda}
              onChange={(v) => updateGS("aparece_busqueda", v)}
              label='Apareces al buscar tu negocio en Google'
            />
            <NumberInput
              value={hallazgos.google_search.posicion_aprox}
              onChange={(v) => updateGS("posicion_aprox", v)}
              label="Posición aproximada en resultados (0 = no apareces)"
            />
            <Toggle
              value={hallazgos.google_search.tiene_seo_basico}
              onChange={(v) => updateGS("tiene_seo_basico", v)}
              label="Tu sitio web está optimizado para búsquedas"
            />
          </div>
        </SectionCard>

        {/* Instagram */}
        <SectionCard title="Instagram" icon={Instagram} iconColor="text-pink-400">
          <div className="space-y-1 mt-3">
            <Toggle
              value={hallazgos.instagram.tiene_cuenta}
              onChange={(v) => updateIG("tiene_cuenta", v)}
              label="Tienes cuenta de Instagram"
            />
            {hallazgos.instagram.tiene_cuenta && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-1.5">
                  <span className="text-sm text-northpeak-text">Usuario (@...)</span>
                  <Input
                    value={hallazgos.instagram.username}
                    onChange={(e) => updateIG("username", e.target.value)}
                    placeholder="@tunegocio"
                    className="w-full sm:w-40 bg-northpeak-bg border-northpeak-surface text-northpeak-text h-8 text-sm"
                  />
                </div>
                <NumberInput
                  value={hallazgos.instagram.seguidores}
                  onChange={(v) => updateIG("seguidores", v)}
                  label="Seguidores"
                />
                <NumberInput
                  value={hallazgos.instagram.posts_ultimo_mes}
                  onChange={(v) => updateIG("posts_ultimo_mes", v)}
                  label="Posts en el último mes"
                />
                <Toggle
                  value={hallazgos.instagram.tiene_highlights}
                  onChange={(v) => updateIG("tiene_highlights", v)}
                  label="Tienes Highlights (historias destacadas)"
                />
                <Toggle
                  value={hallazgos.instagram.tiene_link_bio}
                  onChange={(v) => updateIG("tiene_link_bio", v)}
                  label="Link en bio"
                />
                <Toggle
                  value={hallazgos.instagram.tiene_whatsapp_bio}
                  onChange={(v) => updateIG("tiene_whatsapp_bio", v)}
                  label="WhatsApp visible en el perfil"
                />
                <Toggle
                  value={hallazgos.instagram.usa_reels}
                  onChange={(v) => updateIG("usa_reels", v)}
                  label="Publicas Reels"
                />
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-northpeak-text">Calidad del contenido</span>
                  <select
                    value={hallazgos.instagram.calidad_contenido}
                    onChange={(e) =>
                      updateIG("calidad_contenido", e.target.value as "baja" | "media" | "alta")
                    }
                    className="w-28 h-8 rounded-md border border-northpeak-surface bg-northpeak-bg px-2 text-sm text-northpeak-text"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <Toggle
                  value={hallazgos.instagram.tiene_precios}
                  onChange={(v) => updateIG("tiene_precios", v)}
                  label="Muestras precios en tus publicaciones"
                />
              </>
            )}
          </div>
        </SectionCard>

        {/* Facebook */}
        <SectionCard title="Facebook" icon={Facebook} iconColor="text-blue-500">
          <div className="space-y-1 mt-3">
            <Toggle
              value={hallazgos.facebook.tiene_pagina}
              onChange={(v) => updateFB("tiene_pagina", v)}
              label="Tienes página de Facebook"
            />
            {hallazgos.facebook.tiene_pagina && (
              <>
                <Toggle
                  value={hallazgos.facebook.pagina_activa}
                  onChange={(v) => updateFB("pagina_activa", v)}
                  label="La página está activa (publicaste en los últimos 30 días)"
                />
                <Toggle
                  value={hallazgos.facebook.tiene_resenas_fb}
                  onChange={(v) => updateFB("tiene_resenas_fb", v)}
                  label="Tienes reseñas en Facebook"
                />
                <NumberInput
                  value={hallazgos.facebook.num_likes}
                  onChange={(v) => updateFB("num_likes", v)}
                  label="Likes / Seguidores"
                />
                <Toggle
                  value={hallazgos.facebook.tiene_messenger}
                  onChange={(v) => updateFB("tiene_messenger", v)}
                  label="Messenger activo"
                />
                <Toggle
                  value={hallazgos.facebook.responde_rapido}
                  onChange={(v) => updateFB("responde_rapido", v)}
                  label="Tienes badge de respuesta rápida"
                />
                <Toggle
                  value={hallazgos.facebook.tiene_catalogo}
                  onChange={(v) => updateFB("tiene_catalogo", v)}
                  label="Tienes catálogo de servicios"
                />
              </>
            )}
          </div>
        </SectionCard>

        {/* Sitio Web */}
        <SectionCard title="Sitio Web" icon={Monitor} iconColor="text-green-400">
          <div className="space-y-1 mt-3">
            <Toggle
              value={hallazgos.sitio_web.tiene_sitio}
              onChange={(v) => updateSW("tiene_sitio", v)}
              label="Tienes sitio web"
            />
            {hallazgos.sitio_web.tiene_sitio && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-1.5">
                  <span className="text-sm text-northpeak-text">URL</span>
                  <Input
                    value={hallazgos.sitio_web.url}
                    onChange={(e) => updateSW("url", e.target.value)}
                    placeholder="https://..."
                    className="w-full sm:w-56 bg-northpeak-bg border-northpeak-surface text-northpeak-text h-8 text-sm"
                  />
                </div>
                <Toggle
                  value={hallazgos.sitio_web.es_responsive}
                  onChange={(v) => updateSW("es_responsive", v)}
                  label="Se ve bien en celular"
                />
                <Toggle
                  value={hallazgos.sitio_web.tiene_whatsapp}
                  onChange={(v) => updateSW("tiene_whatsapp", v)}
                  label="Tiene botón de WhatsApp"
                />
                <Toggle
                  value={hallazgos.sitio_web.tiene_booking}
                  onChange={(v) => updateSW("tiene_booking", v)}
                  label="Sistema de reservas online"
                />
                <Toggle
                  value={hallazgos.sitio_web.tiene_precios}
                  onChange={(v) => updateSW("tiene_precios", v)}
                  label="Muestra precios"
                />
                <Toggle
                  value={hallazgos.sitio_web.tiene_ssl}
                  onChange={(v) => updateSW("tiene_ssl", v)}
                  label="HTTPS (candado de seguridad)"
                />
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-northpeak-text">Velocidad de carga</span>
                  <select
                    value={hallazgos.sitio_web.velocidad}
                    onChange={(e) =>
                      updateSW("velocidad", e.target.value as "lenta" | "media" | "rapida" | "n/a")
                    }
                    className="w-28 h-8 rounded-md border border-northpeak-surface bg-northpeak-bg px-2 text-sm text-northpeak-text"
                  >
                    <option value="lenta">Lenta</option>
                    <option value="media">Media</option>
                    <option value="rapida">Rápida</option>
                    <option value="n/a">No sé</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* Publicidad */}
        <SectionCard title="Publicidad Digital" icon={Megaphone} iconColor="text-yellow-400">
          <div className="space-y-1 mt-3">
            <Toggle
              value={hallazgos.publicidad.tiene_meta_ads}
              onChange={(v) => updatePUB("tiene_meta_ads", v)}
              label="Tienes anuncios activos en Facebook/Instagram"
            />
            <Toggle
              value={hallazgos.publicidad.tiene_google_ads}
              onChange={(v) => updatePUB("tiene_google_ads", v)}
              label="Tienes anuncios activos en Google"
            />
          </div>
        </SectionCard>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !datos.nombre || !datos.giro || !datos.zona}
          className="w-full bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 h-12 text-base font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analizando tu negocio...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Ver mi diagnóstico gratis
            </>
          )}
        </Button>

        <p className="text-xs text-northpeak-text-dim text-center pb-8">
          Tu información es privada y no será compartida con terceros.
        </p>
      </main>
    </div>
  );
}

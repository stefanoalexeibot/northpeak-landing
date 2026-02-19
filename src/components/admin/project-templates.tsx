"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  LayoutTemplate, Globe, Palette, ShoppingCart, Megaphone, Loader2,
  Utensils, Scissors, Stethoscope, Wrench, FileText,
} from "lucide-react";

type TemplateType = "proyecto" | "contenido";

interface Template {
  name: string;
  description: string;
  icon: typeof Globe;
  color: string;
  tipo: TemplateType;
  giro?: string;
  deliverables: string[];
}

const projectTemplates: Template[] = [
  {
    name: "Piloto de Validación",
    description: "Landing page + Meta Ads + Google Ads (30 días)",
    icon: Megaphone,
    color: "text-northpeak-green",
    tipo: "proyecto",
    deliverables: [
      "Investigación de mercado",
      "Diseño de landing page",
      "Desarrollo de landing page",
      "Configuración de Meta Ads",
      "Configuración de Google Ads",
      "Pixel y tracking",
      "Optimización semanal",
      "Reporte final",
    ],
  },
  {
    name: "Web Básica",
    description: "Sitio web informativo de 5 páginas",
    icon: Globe,
    color: "text-blue-400",
    tipo: "proyecto",
    deliverables: [
      "Wireframes",
      "Diseño UI (Home)",
      "Diseño UI (Interiores)",
      "Desarrollo frontend",
      "Contenido y copywriting",
      "SEO básico",
      "Hosting y dominio",
      "Capacitación",
    ],
  },
  {
    name: "Branding Completo",
    description: "Identidad visual + manual de marca",
    icon: Palette,
    color: "text-purple-400",
    tipo: "proyecto",
    deliverables: [
      "Investigación y moodboard",
      "Propuestas de logo (3)",
      "Logo final + variantes",
      "Paleta de colores",
      "Tipografía",
      "Papelería corporativa",
      "Templates redes sociales",
      "Manual de marca (PDF)",
    ],
  },
  {
    name: "E-commerce",
    description: "Tienda en línea con carrito y pagos",
    icon: ShoppingCart,
    color: "text-orange-400",
    tipo: "proyecto",
    deliverables: [
      "Diseño UX/UI",
      "Desarrollo frontend",
      "Integración de pagos",
      "Catálogo de productos",
      "Carrito de compras",
      "Checkout y envíos",
      "SEO técnico",
      "Capacitación admin",
    ],
  },
];

const contentTemplates: Template[] = [
  {
    name: "Restaurante / Cafetería",
    description: "Contenido para el primer mes — 4 semanas",
    icon: Utensils,
    color: "text-orange-400",
    tipo: "contenido",
    giro: "restaurante",
    deliverables: [
      // Semana 1
      "S1: Post de presentación del negocio",
      "S1: Story — Menú del día (lunes a viernes)",
      "S1: Reel — Preparación de platillo estrella",
      "S1: Post — Historia del chef / fundador",
      // Semana 2
      "S2: Post — Promoción de fin de semana",
      "S2: Story — Detrás de cámaras en cocina",
      "S2: Post — Reseña de cliente destacada",
      "S2: Reel — Ambiente del lugar (UGC-style)",
      // Semana 3
      "S3: Post — Platillo especial de la semana",
      "S3: Story — Encuesta: ¿qué quieres ver en el menú?",
      "S3: Post — Beneficios / ingredientes frescos",
      "S3: Reel — Time lapse de apertura",
      // Semana 4
      "S4: Post — Resumen del mes / logros",
      "S4: Story — Invitación a dejar reseña en Google",
      "S4: Post — Próximas novedades",
    ],
  },
  {
    name: "Salón / Nail Studio",
    description: "Contenido para el primer mes — 4 semanas",
    icon: Scissors,
    color: "text-pink-400",
    tipo: "contenido",
    giro: "salon",
    deliverables: [
      // Semana 1
      "S1: Post de presentación del salón",
      "S1: Reel — Transformación antes/después (cabello o uñas)",
      "S1: Story — Servicios y precios",
      "S1: Post — Presentación del equipo",
      // Semana 2
      "S2: Post — Tendencia del mes (nails/cabello)",
      "S2: Story — Agenda tu cita (CTA con link)",
      "S2: Reel — Proceso completo de servicio",
      "S2: Post — Testimonio de clienta",
      // Semana 3
      "S3: Post — Productos que usamos y por qué",
      "S3: Story — ¿Cuánto dura tu servicio? FAQ",
      "S3: Reel — Resultado final: nail art o peinado",
      "S3: Post — Promoción entre semana",
      // Semana 4
      "S4: Post — Galería del mes (collage de trabajos)",
      "S4: Story — Invitación a reseña en Google",
      "S4: Post — Próximas tendencias del siguiente mes",
    ],
  },
  {
    name: "Clínica / Consultorio",
    description: "Contenido para el primer mes — 4 semanas",
    icon: Stethoscope,
    color: "text-cyan-400",
    tipo: "contenido",
    giro: "clinica",
    deliverables: [
      // Semana 1
      "S1: Post — Presentación de la clínica / especialidad",
      "S1: Story — ¿Qué tratamos? Servicios principales",
      "S1: Post — Presentación del doctor / especialista",
      "S1: Reel — Recorrido por las instalaciones",
      // Semana 2
      "S2: Post — Tip de salud o prevención (educativo)",
      "S2: Story — Cómo agendar cita (paso a paso)",
      "S2: Post — Mito vs realidad de la especialidad",
      "S2: Reel — Proceso de consulta / tratamiento",
      // Semana 3
      "S3: Post — Testimonio de paciente satisfecho",
      "S3: Story — Pregunta del público (interacción)",
      "S3: Post — Beneficios de atenderse a tiempo",
      "S3: Reel — FAQ: preguntas frecuentes de pacientes",
      // Semana 4
      "S4: Post — Datos del mes / logros de la clínica",
      "S4: Story — Invitación a reseña en Google Maps",
      "S4: Post — Próximos temas / tratamientos del mes",
    ],
  },
  {
    name: "Taller / Servicios",
    description: "Contenido para el primer mes — 4 semanas",
    icon: Wrench,
    color: "text-yellow-400",
    tipo: "contenido",
    giro: "taller",
    deliverables: [
      // Semana 1
      "S1: Post — Presentación del negocio y servicios",
      "S1: Story — ¿Qué problemas resolvemos?",
      "S1: Reel — Trabajo en proceso (antes/después)",
      "S1: Post — Presentación del equipo técnico",
      // Semana 2
      "S2: Post — Caso de éxito / trabajo reciente",
      "S2: Story — Preguntas frecuentes de clientes",
      "S2: Reel — Proceso de trabajo paso a paso",
      "S2: Post — Consejo de mantenimiento preventivo",
      // Semana 3
      "S3: Post — ¿Por qué elegirnos? Diferenciadores",
      "S3: Story — Encuesta: ¿Cuál servicio te interesa?",
      "S3: Reel — Detalle de un trabajo terminado",
      "S3: Post — Testimonio de cliente",
      // Semana 4
      "S4: Post — Resumen de trabajos del mes",
      "S4: Story — Invitación a reseña en Google",
      "S4: Post — Promoción especial siguiente mes",
    ],
  },
  {
    name: "Genérico (cualquier giro)",
    description: "Plantilla de contenido adaptable a cualquier negocio",
    icon: FileText,
    color: "text-northpeak-text-muted",
    tipo: "contenido",
    giro: "generico",
    deliverables: [
      // Semana 1
      "S1: Post de bienvenida / presentación",
      "S1: Story — ¿Qué hacemos? Servicios/productos",
      "S1: Reel — Detrás de cámaras del negocio",
      "S1: Post — Equipo o historia del emprendimiento",
      // Semana 2
      "S2: Post — Caso de uso o beneficio principal",
      "S2: Story — CTA: Contacto o cita",
      "S2: Reel — Proceso o demostración del servicio",
      "S2: Post — Testimonio o reseña de cliente",
      // Semana 3
      "S3: Post — Contenido educativo / consejo útil",
      "S3: Story — Encuesta o interacción con seguidores",
      "S3: Reel — Resultado final / producto terminado",
      "S3: Post — Promoción o oferta especial",
      // Semana 4
      "S4: Post — Resumen del mes",
      "S4: Story — Invitación a dejar reseña",
      "S4: Post — Anticipo del siguiente mes",
    ],
  },
];

interface Props {
  clientId: string;
}

export default function ProjectTemplates({ clientId }: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState<TemplateType>("proyecto");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const router = useRouter();

  function computeScheduledDate(name: string, weekItemCounts: Record<number, number>, startDateStr: string): string | null {
    const match = name.match(/^S([1-4]):/);
    if (!match) return null;
    const week = parseInt(match[1], 10) - 1; // 0-indexed
    const itemIndex = weekItemCounts[week] ?? 0;
    weekItemCounts[week] = itemIndex + 1;

    const base = new Date(startDateStr + "T00:00:00");
    base.setDate(base.getDate() + week * 7 + itemIndex);
    return base.toISOString().split("T")[0];
  }

  async function createFromTemplate(template: Template) {
    setCreating(true);
    const supabase = createClient();

    const { data: project } = await supabase
      .from("projects")
      .insert({
        client_id: clientId,
        name: template.name,
        description: template.description,
        status: "planning",
      })
      .select()
      .single();

    if (project) {
      const weekItemCounts: Record<number, number> = {};
      const deliverables = template.deliverables.map((name, i) => {
        const scheduled_date = template.tipo === "contenido"
          ? computeScheduledDate(name, weekItemCounts, startDate)
          : null;
        return {
          project_id: project.id,
          name,
          order_index: i,
          status: "pending",
          ...(scheduled_date ? { scheduled_date } : {}),
        };
      });

      await supabase.from("deliverables").insert(deliverables);
    }

    setCreating(false);
    setOpen(false);
    setSelectedTemplate(null);
    router.refresh();
  }

  function handleClose() {
    setOpen(false);
    setSelectedTemplate(null);
    setActiveTab("proyecto");
    setStartDate(new Date().toISOString().split("T")[0]);
  }

  const visibleTemplates = activeTab === "proyecto" ? projectTemplates : contentTemplates;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="border-northpeak-surface text-northpeak-text-muted text-xs"
      >
        <LayoutTemplate className="h-3 w-3 mr-1" />
        Usar template
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-northpeak-text">
              {selectedTemplate ? selectedTemplate.name : "Templates de proyecto"}
            </DialogTitle>
          </DialogHeader>

          {!selectedTemplate ? (
            <div className="space-y-4">
              {/* Type tabs */}
              <div className="flex gap-1 p-1 rounded-lg bg-northpeak-bg">
                <button
                  onClick={() => setActiveTab("proyecto")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "proyecto"
                      ? "bg-northpeak-card text-northpeak-text shadow-sm"
                      : "text-northpeak-text-muted hover:text-northpeak-text"
                  }`}
                >
                  Proyectos
                </button>
                <button
                  onClick={() => setActiveTab("contenido")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "contenido"
                      ? "bg-northpeak-card text-northpeak-text shadow-sm"
                      : "text-northpeak-text-muted hover:text-northpeak-text"
                  }`}
                >
                  Contenido por giro
                </button>
              </div>

              {activeTab === "contenido" && (
                <p className="text-xs text-northpeak-text-muted">
                  Plantillas de primer mes con deliverables semanales listos para crear.
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleTemplates.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTemplate(t)}
                    className="flex items-start gap-3 rounded-lg bg-northpeak-bg p-4 text-left hover:bg-northpeak-surface transition-colors"
                  >
                    <t.icon className={`h-6 w-6 ${t.color} shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-sm font-medium text-northpeak-text">{t.name}</p>
                      <p className="text-xs text-northpeak-text-muted mt-0.5">{t.description}</p>
                      <p className="text-[10px] text-northpeak-text-dim mt-1">
                        {t.deliverables.length} entregables
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <selectedTemplate.icon className={`h-6 w-6 ${selectedTemplate.color}`} />
                <div>
                  <p className="text-sm text-northpeak-text-muted">{selectedTemplate.description}</p>
                </div>
              </div>

              {selectedTemplate.tipo === "contenido" && (
                <div className="flex items-center gap-3 px-3 py-2 bg-northpeak-bg rounded-lg">
                  <label className="text-xs text-northpeak-text-muted whitespace-nowrap">
                    Fecha de inicio (S1):
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-xs text-northpeak-text border-0 outline-none cursor-pointer"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-northpeak-text-muted uppercase tracking-wider">
                  Entregables incluidos
                </p>
                {selectedTemplate.deliverables.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-northpeak-text px-3 py-1.5 bg-northpeak-bg rounded"
                  >
                    <span className="text-[10px] text-northpeak-text-dim font-mono w-4 shrink-0">
                      {i + 1}.
                    </span>
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedTemplate ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                  className="border-northpeak-surface text-northpeak-text-muted"
                >
                  Atrás
                </Button>
                <Button
                  onClick={() => createFromTemplate(selectedTemplate)}
                  disabled={creating}
                  className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear proyecto"
                  )}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-northpeak-surface text-northpeak-text-muted"
              >
                Cancelar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

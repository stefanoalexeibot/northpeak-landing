"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LayoutTemplate, Globe, Palette, ShoppingCart, Megaphone, Loader2 } from "lucide-react";

interface Template {
  name: string;
  description: string;
  icon: typeof Globe;
  color: string;
  deliverables: string[];
}

const templates: Template[] = [
  {
    name: "Piloto de Validación",
    description: "Landing page + Meta Ads + Google Ads (30 días)",
    icon: Megaphone,
    color: "text-northpeak-green",
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

interface Props {
  clientId: string;
}

export default function ProjectTemplates({ clientId }: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const router = useRouter();

  async function createFromTemplate(template: Template) {
    setCreating(true);
    const supabase = createClient();

    // Create the project
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
      // Create all deliverables
      const deliverables = template.deliverables.map((name, i) => ({
        project_id: project.id,
        name,
        order_index: i,
        status: "pending",
      }));

      await supabase.from("deliverables").insert(deliverables);
    }

    setCreating(false);
    setOpen(false);
    setSelectedTemplate(null);
    router.refresh();
  }

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-northpeak-card border-northpeak-surface max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-northpeak-text">
              {selectedTemplate ? selectedTemplate.name : "Templates de proyecto"}
            </DialogTitle>
          </DialogHeader>

          {!selectedTemplate ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((t) => (
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
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <selectedTemplate.icon className={`h-6 w-6 ${selectedTemplate.color}`} />
                <div>
                  <p className="text-sm text-northpeak-text-muted">{selectedTemplate.description}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-northpeak-text-muted uppercase tracking-wider">
                  Entregables incluidos
                </p>
                {selectedTemplate.deliverables.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-northpeak-text px-3 py-1.5 bg-northpeak-bg rounded">
                    <span className="text-[10px] text-northpeak-text-dim font-mono w-4">{i + 1}.</span>
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
                onClick={() => setOpen(false)}
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

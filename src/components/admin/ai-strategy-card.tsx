"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Zap, Loader2, Copy, Check } from "lucide-react";

interface AnalisisData {
  id: string;
  nombre_negocio: string;
  giro: string;
  zona?: string;
  score: number;
  nivel: string;
  oportunidades?: { titulo: string; canal: string; impacto: string }[];
}

interface Props {
  clientId: string;
  analisis: AnalisisData | null;
  existingStrategy?: string | null;
}

export default function AIStrategyCard({
  clientId,
  analisis,
  existingStrategy,
}: Props) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<string | null>(
    existingStrategy || null
  );
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!analisis) {
      addToast(
        "Se necesita un análisis digital vinculado para generar la estrategia",
        "error"
      );
      return;
    }

    setLoading(true);
    setStrategy(null);
    try {
      const res = await fetch("/api/ai/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          analisisId: analisis.id,
          nombre: analisis.nombre_negocio,
          giro: analisis.giro,
          zona: analisis.zona || "",
          score: analisis.score,
          nivel: analisis.nivel,
          oportunidades: analisis.oportunidades,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Error al generar estrategia", "error");
      } else {
        setStrategy(data.content);
        addToast("Estrategia generada exitosamente", "success");
      }
    } catch {
      addToast("Error de conexión", "error");
    }
    setLoading(false);
  }

  function copyStrategy() {
    if (strategy) {
      navigator.clipboard.writeText(strategy);
      setCopied(true);
      addToast("Estrategia copiada", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Card className="bg-northpeak-card border-northpeak-surface">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-northpeak-text font-heading text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          Estrategia IA (Playbook 30 días)
        </CardTitle>
        <div className="flex gap-2">
          {strategy && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyStrategy}
              className="border-northpeak-surface text-northpeak-text-muted text-xs"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              Copiar
            </Button>
          )}
          <Button
            size="sm"
            onClick={generate}
            disabled={loading || !analisis}
            className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-1" />
                {strategy ? "Regenerar" : "Generar estrategia"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {strategy && (
        <CardContent className="pt-0">
          <div className="rounded-lg bg-northpeak-bg p-4 max-h-[500px] overflow-y-auto">
            <div
              className="prose prose-invert prose-sm max-w-none text-northpeak-text-muted
                prose-headings:text-northpeak-text prose-headings:font-heading
                prose-strong:text-northpeak-text prose-li:text-northpeak-text-muted"
              dangerouslySetInnerHTML={{
                __html: formatMarkdown(strategy),
              }}
            />
          </div>
        </CardContent>
      )}
      {!strategy && !loading && (
        <CardContent className="pt-0">
          {analisis ? (
            <p className="text-xs text-northpeak-text-dim">
              Genera un plan de acción personalizado de 30 días basado en el
              análisis digital de {analisis.nombre_negocio} (Score:{" "}
              {analisis.score}/100).
            </p>
          ) : (
            <p className="text-xs text-northpeak-text-dim">
              Necesitas vincular un análisis digital al cliente para generar una
              estrategia.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function formatMarkdown(md: string): string {
  return md
    .replace(
      /^### (.+)$/gm,
      '<h3 class="text-sm font-semibold mt-4 mb-2">$1</h3>'
    )
    .replace(
      /^## (.+)$/gm,
      '<h2 class="text-base font-bold mt-5 mb-2">$1</h2>'
    )
    .replace(
      /^# (.+)$/gm,
      '<h1 class="text-lg font-bold mt-5 mb-3">$1</h1>'
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

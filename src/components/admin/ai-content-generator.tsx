"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

interface Props {
  clientName: string;
  company?: string;
  giro: string;
  zona: string;
  score?: number;
  oportunidades?: string[];
}

export default function AIContentGenerator({
  clientName,
  company,
  giro,
  zona,
  score,
  oportunidades,
}: Props) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setContent(null);
    try {
      const res = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          company,
          giro,
          zona,
          score,
          oportunidades,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Error al generar contenido", "error");
      } else {
        setContent(data.content);
        addToast("Ideas de contenido generadas", "success");
      }
    } catch {
      addToast("Error de conexión", "error");
    }
    setLoading(false);
  }

  function copyContent() {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      addToast("Contenido copiado", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Card className="bg-northpeak-card border-northpeak-surface">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-northpeak-text font-heading text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          Generador de Contenido IA
        </CardTitle>
        <div className="flex gap-2">
          {content && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyContent}
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
            disabled={loading || !giro}
            className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Generar ideas
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {content && (
        <CardContent className="pt-0">
          <div className="rounded-lg bg-northpeak-bg p-4 max-h-96 overflow-y-auto">
            <div
              className="prose prose-invert prose-sm max-w-none text-northpeak-text-muted
                prose-headings:text-northpeak-text prose-headings:font-heading
                prose-strong:text-northpeak-text prose-li:text-northpeak-text-muted"
              dangerouslySetInnerHTML={{
                __html: formatMarkdown(content),
              }}
            />
          </div>
        </CardContent>
      )}
      {!content && !loading && (
        <CardContent className="pt-0">
          <p className="text-xs text-northpeak-text-dim">
            Genera ideas de posts para redes sociales basadas en el perfil del
            cliente.
            {!giro && " Necesita un análisis vinculado con giro definido."}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

function formatMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold mt-5 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

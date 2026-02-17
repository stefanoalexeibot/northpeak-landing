"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Pregunta } from "@/lib/analizador/cuestionario";

interface NegocioInfo {
  nombre: string;
  giro: string;
  zona: string;
  score: number;
  nivel: string;
}

interface CuestionarioData {
  status: "pending" | "completed";
  negocio?: NegocioInfo;
  preguntas?: Pregunta[];
  cotizacion_personalizada?: unknown;
  analisis_id?: string;
}

export default function CuestionarioPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CuestionarioData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [analisisId, setAnalisisId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/cuestionario/${token}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Error al cargar cuestionario");
          return;
        }
        setData(json);
        if (json.status === "completed") {
          setCompleted(true);
          setAnalisisId(json.analisis_id);
        }
      } catch {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const visiblePreguntas = useCallback((): Pregunta[] => {
    if (!data?.preguntas) return [];
    return data.preguntas.filter((p) => {
      if (!p.dependeDe) return true;
      return respuestas[p.dependeDe.preguntaId] === p.dependeDe.valor;
    });
  }, [data?.preguntas, respuestas]);

  const preguntas = visiblePreguntas();
  const preguntaActual = preguntas[currentStep];
  const totalSteps = preguntas.length;
  const progress = totalSteps > 0 ? ((currentStep) / totalSteps) * 100 : 0;

  function handleAnswer(valor: unknown) {
    if (!preguntaActual) return;
    const newRespuestas = { ...respuestas, [preguntaActual.id]: valor };
    setRespuestas(newRespuestas);

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep((s) => s + 1);
      }
    }, 300);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cuestionario/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuestas }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Error al enviar respuestas");
        setSubmitting(false);
        return;
      }
      setCompleted(true);
      setAnalisisId(json.analisis_id);
    } catch {
      setError("Error de conexión");
    }
    setSubmitting(false);
  }

  // Loading state
  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-[#00E5A0] border-t-transparent rounded-full animate-spin" />
            <p style={{ color: "#7A7D8A" }}>Cargando cuestionario...</p>
          </div>
        </div>
      </Shell>
    );
  }

  // Error state
  if (error) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-4xl mb-4">:(</div>
            <h2 style={{ color: "#E8E9ED", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Algo salió mal
            </h2>
            <p style={{ color: "#7A7D8A" }}>{error}</p>
          </div>
        </div>
      </Shell>
    );
  }

  // Completed state
  if (completed) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center" style={{ maxWidth: 440 }}>
            <div className="text-5xl mb-6">&#10003;</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", color: "#E8E9ED", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
              ¡Listo!
            </h2>
            <p style={{ color: "#7A7D8A", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
              Tu cotización personalizada ha sido generada. Puedes ver tu reporte actualizado con la propuesta estratégica.
            </p>
            {analisisId && (
              <a
                href={`/api/reporte/${analisisId}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 32px",
                  background: "#00E5A0",
                  color: "#05060A",
                  textDecoration: "none",
                  borderRadius: 100,
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Ver mi reporte actualizado
              </a>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  // Main questionnaire
  const isLastStep = currentStep === totalSteps - 1;
  const currentAnswered = preguntaActual && respuestas[preguntaActual.id] !== undefined;

  return (
    <Shell>
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.06)", zIndex: 200 }}>
        <div
          style={{
            height: "100%",
            background: "#00E5A0",
            width: `${progress}%`,
            transition: "width 0.4s ease",
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      {/* Header */}
      {data?.negocio && currentStep === 0 && (
        <div style={{ padding: "60px 0 20px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            padding: "5px 14px",
            background: "rgba(0,229,160,0.1)",
            border: "1px solid rgba(0,229,160,0.2)",
            borderRadius: 100,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#00E5A0",
            letterSpacing: 1,
            textTransform: "uppercase" as const,
            marginBottom: 20,
          }}>
            Cuestionario
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, color: "#E8E9ED", marginBottom: 8 }}>
            {data.negocio.nombre}
          </h1>
          <p style={{ color: "#7A7D8A", fontSize: 14 }}>
            Contesta estas preguntas para generar tu cotización personalizada
          </p>
        </div>
      )}

      {/* Question area */}
      <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: currentStep === 0 ? "20px 0 40px" : "80px 0 40px" }}>
        {preguntaActual && (
          <div key={preguntaActual.id} style={{ animation: "fadeUp 0.4s ease forwards" }}>
            {/* Step counter */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#4A4D5A", marginBottom: 16 }}>
              {currentStep + 1} / {totalSteps}
            </div>

            {/* Question text */}
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, color: "#E8E9ED", lineHeight: 1.3, marginBottom: 32 }}>
              {preguntaActual.texto}
            </h2>

            {/* Options */}
            {preguntaActual.tipo === "opcion" && preguntaActual.opciones && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {preguntaActual.opciones.map((op) => (
                  <button
                    key={op}
                    onClick={() => handleAnswer(op)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      padding: "16px 20px",
                      background: respuestas[preguntaActual.id] === op ? "rgba(0,229,160,0.1)" : "#0C0D12",
                      border: `1px solid ${respuestas[preguntaActual.id] === op ? "rgba(0,229,160,0.4)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 12,
                      color: respuestas[preguntaActual.id] === op ? "#00E5A0" : "#E8E9ED",
                      fontSize: 15,
                      textAlign: "left" as const,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: `2px solid ${respuestas[preguntaActual.id] === op ? "#00E5A0" : "rgba(255,255,255,0.15)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {respuestas[preguntaActual.id] === op && (
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#00E5A0" }} />
                      )}
                    </span>
                    {op}
                  </button>
                ))}
              </div>
            )}

            {preguntaActual.tipo === "si_no" && (
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "Sí", value: true },
                  { label: "No", value: false },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(opt.value)}
                    style={{
                      flex: 1,
                      padding: "20px",
                      background: respuestas[preguntaActual.id] === opt.value ? "rgba(0,229,160,0.1)" : "#0C0D12",
                      border: `1px solid ${respuestas[preguntaActual.id] === opt.value ? "rgba(0,229,160,0.4)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 12,
                      color: respuestas[preguntaActual.id] === opt.value ? "#00E5A0" : "#E8E9ED",
                      fontSize: 18,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {preguntaActual.tipo === "numero" && (
              <input
                type="number"
                value={(respuestas[preguntaActual.id] as number) || ""}
                onChange={(e) => {
                  setRespuestas({ ...respuestas, [preguntaActual.id]: Number(e.target.value) });
                }}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: "#0C0D12",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  color: "#E8E9ED",
                  fontSize: 18,
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none",
                }}
                min={preguntaActual.rango?.min}
                max={preguntaActual.rango?.max}
                placeholder="Escribe un número..."
              />
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            color: currentStep === 0 ? "#4A4D5A" : "#7A7D8A",
            fontSize: 14,
            cursor: currentStep === 0 ? "default" : "pointer",
          }}
        >
          Anterior
        </button>

        {isLastStep ? (
          <button
            onClick={handleSubmit}
            disabled={!currentAnswered || submitting}
            style={{
              padding: "12px 32px",
              background: !currentAnswered || submitting ? "rgba(0,229,160,0.3)" : "#00E5A0",
              border: "none",
              borderRadius: 100,
              color: "#05060A",
              fontSize: 15,
              fontWeight: 700,
              cursor: !currentAnswered || submitting ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {submitting ? (
              <>
                <span style={{ width: 16, height: 16, border: "2px solid #05060A", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                Generando cotización...
              </>
            ) : (
              "Generar mi cotización"
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentStep((s) => Math.min(totalSteps - 1, s + 1))}
            disabled={!currentAnswered}
            style={{
              padding: "12px 28px",
              background: !currentAnswered ? "rgba(0,229,160,0.3)" : "#00E5A0",
              border: "none",
              borderRadius: 100,
              color: "#05060A",
              fontSize: 15,
              fontWeight: 600,
              cursor: !currentAnswered ? "default" : "pointer",
            }}
          >
            Siguiente
          </button>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#05060A", minHeight: "100vh", color: "#E8E9ED", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #05060A; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        button { font-family: inherit; }
      `}</style>
      <nav style={{ padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>NorthPeak</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: 2,
            textTransform: "uppercase" as const,
            padding: "3px 8px",
            border: "1px solid #00E5A0",
            borderRadius: 4,
            color: "#00E5A0",
          }}>Digital</span>
        </div>
      </nav>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>
        {children}
      </div>
    </div>
  );
}

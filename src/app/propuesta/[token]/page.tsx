"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface PropuestaData {
  id: string;
  token: string;
  nombre_prospecto: string;
  empresa: string | null;
  servicios: string[];
  precio_total: number | null;
  mensaje: string | null;
  vigencia_dias: number;
  status: string;
  created_at: string;
}

function isExpired(created_at: string, vigencia_dias: number): boolean {
  const expiry = new Date(created_at);
  expiry.setDate(expiry.getDate() + vigencia_dias);
  return new Date() > expiry;
}

function diasRestantes(created_at: string, vigencia_dias: number): number {
  const expiry = new Date(created_at);
  expiry.setDate(expiry.getDate() + vigencia_dias);
  const diff = expiry.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function PropuestaPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PropuestaData | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/propuesta/${token}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Propuesta no encontrada");
          return;
        }
        setData(json);
        if (json.status === "aceptada") setAccepted(true);
      } catch {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleAceptar() {
    setAccepting(true);
    try {
      await fetch(`/api/propuesta/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "aceptar" }),
      });
      setAccepted(true);
    } catch {
      // Still show accepted UI
      setAccepted(true);
    }
    setAccepting(false);
  }

  if (loading) {
    return (
      <Shell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 40, height: 40,
              border: "2px solid #00E5A0",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }} />
            <p style={{ color: "#7A7D8A" }}>Cargando propuesta...</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16, color: "#7A7D8A" }}>:/</div>
            <h2 style={{ color: "#E8E9ED", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Propuesta no encontrada
            </h2>
            <p style={{ color: "#7A7D8A" }}>{error}</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (!data) return null;

  if (isExpired(data.created_at, data.vigencia_dias) && data.status !== "aceptada") {
    return (
      <Shell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px", fontSize: 28, color: "#7A7D8A",
            }}>
              ⏱
            </div>
            <h2 style={{ color: "#E8E9ED", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
              Esta propuesta ha expirado
            </h2>
            <p style={{ color: "#7A7D8A", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              El enlace de esta propuesta ya no está activo. Contacta a NorthPeak para obtener una nueva propuesta actualizada.
            </p>
            <a
              href="https://wa.me/5218183000000"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "#00E5A0",
                color: "#05060A",
                borderRadius: 100,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Contactar a NorthPeak
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  if (accepted) {
    return (
      <Shell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(0,229,160,0.1)",
              border: "2px solid rgba(0,229,160,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px", fontSize: 32, color: "#00E5A0",
            }}>
              ✓
            </div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              color: "#E8E9ED", fontSize: 24, fontWeight: 800, marginBottom: 12,
            }}>
              ¡Propuesta aceptada!
            </h2>
            <p style={{ color: "#7A7D8A", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              Gracias {data.nombre_prospecto}. El equipo de NorthPeak te contactará muy pronto para iniciar.
            </p>
            <a
              href={`https://wa.me/5218183000000?text=${encodeURIComponent(`Hola, acabo de aceptar la propuesta de NorthPeak. Soy ${data.nombre_prospecto}${data.empresa ? ` de ${data.empresa}` : ""}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px",
                background: "#25D366",
                color: "#fff",
                borderRadius: 100,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Escribirnos por WhatsApp
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  const dias = diasRestantes(data.created_at, data.vigencia_dias);

  return (
    <Shell>
      {/* Header */}
      <div style={{ padding: "48px 0 8px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", padding: "5px 14px",
          background: "rgba(0,229,160,0.1)",
          border: "1px solid rgba(0,229,160,0.2)",
          borderRadius: 100,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, color: "#00E5A0",
          letterSpacing: 1, textTransform: "uppercase" as const,
          marginBottom: 20,
        }}>
          Propuesta personalizada
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(22px, 5vw, 32px)",
          fontWeight: 800, color: "#E8E9ED", marginBottom: 8,
        }}>
          Hola, {data.nombre_prospecto}
        </h1>
        {data.empresa && (
          <p style={{ color: "#7A7D8A", fontSize: 15, marginBottom: 4 }}>
            {data.empresa}
          </p>
        )}
        <p style={{ color: "#7A7D8A", fontSize: 13 }}>
          Esta propuesta {dias > 0 ? `vence en ${dias} día${dias !== 1 ? "s" : ""}` : "vence hoy"}
        </p>
      </div>

      {/* Services card */}
      <div style={{
        background: "#0C0D12",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "clamp(20px, 4vw, 32px)",
        marginTop: 24,
      }}>
        <p style={{
          color: "#7A7D8A", fontSize: 12, marginBottom: 16,
          textTransform: "uppercase" as const, letterSpacing: 1,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Servicios incluidos
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(data.servicios || []).map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "rgba(0,229,160,0.1)",
                border: "1px solid rgba(0,229,160,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "#00E5A0", fontSize: 11,
              }}>
                ✓
              </div>
              <span style={{ color: "#E8E9ED", fontSize: 15 }}>{s}</span>
            </div>
          ))}
        </div>

        {data.precio_total && (
          <>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "24px 0" }} />
            <div style={{ textAlign: "center" }}>
              <p style={{
                color: "#7A7D8A", fontSize: 12, marginBottom: 4,
                textTransform: "uppercase" as const, letterSpacing: 1,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                Inversión mensual
              </p>
              <p style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(32px, 8vw, 48px)",
                fontWeight: 800, color: "#00E5A0",
              }}>
                ${Number(data.precio_total).toLocaleString("es-MX")}
                <span style={{ fontSize: "0.4em", color: "#7A7D8A", marginLeft: 4 }}>MXN</span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Mensaje personalizado */}
      {data.mensaje && (
        <div style={{
          marginTop: 16, padding: "20px 24px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
        }}>
          <p style={{ color: "#7A7D8A", fontSize: 12, marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
            Mensaje del equipo
          </p>
          <p style={{ color: "#E8E9ED", fontSize: 15, lineHeight: 1.7 }}>{data.mensaje}</p>
        </div>
      )}

      {/* CTA buttons */}
      <div style={{ padding: "32px 0 56px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <button
          onClick={handleAceptar}
          disabled={accepting}
          style={{
            width: "100%", maxWidth: 380,
            padding: "16px 32px",
            background: accepting ? "rgba(0,229,160,0.4)" : "#00E5A0",
            border: "none", borderRadius: 100,
            color: "#05060A", fontSize: 16, fontWeight: 700,
            cursor: accepting ? "default" : "pointer",
            fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s ease",
          }}
        >
          {accepting ? (
            <>
              <span style={{
                width: 16, height: 16,
                border: "2px solid #05060A", borderTopColor: "transparent",
                borderRadius: "50%", display: "inline-block",
                animation: "spin 0.6s linear infinite",
              }} />
              Procesando...
            </>
          ) : (
            "Aceptar propuesta"
          )}
        </button>

        <a
          href={`https://wa.me/5218183000000?text=${encodeURIComponent(`Hola, vi mi propuesta de NorthPeak. Soy ${data.nombre_prospecto}${data.empresa ? ` de ${data.empresa}` : ""} y quiero empezar.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: "100%", maxWidth: 380,
            padding: "14px 32px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 100,
            color: "#E8E9ED", fontSize: 15, fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Quiero empezar por WhatsApp
        </a>

        <p style={{ color: "#7A7D8A", fontSize: 12, marginTop: 4 }}>
          Esta propuesta vence en {dias} día{dias !== 1 ? "s" : ""}
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#05060A", minHeight: "100vh",
      color: "#E8E9ED", fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #05060A; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <nav style={{ padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          maxWidth: 640, margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>
            NorthPeak
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500,
            letterSpacing: 2, textTransform: "uppercase" as const,
            padding: "3px 8px", border: "1px solid #00E5A0", borderRadius: 4, color: "#00E5A0",
          }}>
            Digital
          </span>
        </div>
      </nav>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>
        {children}
      </div>
    </div>
  );
}

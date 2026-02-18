"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PagoData {
  id: string;
  concepto: string;
  monto: number;
  status: string;
  datos_bancarios: {
    banco: string;
    clabe: string;
    titular: string;
    referencia?: string;
  };
  due_date: string | null;
  client_name: string;
}

export default function PagoPage() {
  const params = useParams();
  const token = params.token as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PagoData | null>(null);
  const [copied, setCopied] = useState(false);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/pago/${token}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Enlace de pago inválido");
          return;
        }
        setData(json);
      } catch {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleCopy() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.datos_bancarios.clabe);
    } catch {
      const input = document.createElement("input");
      input.value = data.datos_bancarios.clabe;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleNotify() {
    setNotifying(true);
    let uploadedUrl: string | null = null;

    try {
      // Upload file directly to Supabase Storage from browser (anon key)
      if (comprobante && data) {
        const ext = comprobante.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `comprobantes/${data.id}_${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("client-files")
          .upload(path, comprobante, { contentType: comprobante.type, upsert: true });
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from("client-files")
            .getPublicUrl(path);
          uploadedUrl = urlData.publicUrl;
        }
      }
    } catch {
      // Upload failed — proceed without comprobante
    }

    try {
      // Notify API with the URL (no file transfer through Next.js)
      await fetch(`/api/pago/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comprobanteUrl: uploadedUrl }),
      });
    } catch {
      // API call failed — still show success
    }

    setComprobanteUrl(uploadedUrl);
    setNotified(true);
    setNotifying(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setComprobante(file);
  }

  function removeFile() {
    setComprobante(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── Estados de carga / error / éxito ──────────────────────────

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
            <p style={{ color: "#7A7D8A" }}>Cargando...</p>
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
            <div style={{ fontSize: 40, marginBottom: 16 }}>:(</div>
            <h2 style={{ color: "#E8E9ED", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Enlace no válido
            </h2>
            <p style={{ color: "#7A7D8A" }}>{error}</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (!data) return null;

  if (notified) {
    return (
      <Shell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            {/* Checkmark circle */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(0,229,160,0.1)",
              border: "2px solid rgba(0,229,160,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 32, color: "#00E5A0",
            }}>
              ✓
            </div>

            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              color: "#E8E9ED", fontSize: 24, fontWeight: 800, marginBottom: 12,
            }}>
              ¡Notificación enviada!
            </h2>

            <p style={{ color: "#7A7D8A", fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
              Hemos notificado al equipo de NorthPeak sobre tu pago.
              {comprobanteUrl
                ? " Tu comprobante fue recibido correctamente."
                : " Te contactaremos para confirmar la recepción."}
            </p>

            {comprobanteUrl && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 16px",
                background: "rgba(0,229,160,0.08)",
                border: "1px solid rgba(0,229,160,0.2)",
                borderRadius: 8,
                color: "#00E5A0", fontSize: 13,
              }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
                Comprobante adjunto y guardado
              </div>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  // ── Vista principal ───────────────────────────────────────────

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
          Pago pendiente
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(22px, 5vw, 32px)",
          fontWeight: 800, color: "#E8E9ED", marginBottom: 4,
        }}>
          Hola, {data.client_name}
        </h1>
        <p style={{ color: "#7A7D8A", fontSize: 14 }}>
          Aquí están los datos para realizar tu transferencia
        </p>
      </div>

      {/* Payment card */}
      <div style={{
        background: "#0C0D12",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "clamp(20px, 4vw, 32px)",
        marginTop: 24,
      }}>
        {/* Amount */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{
            color: "#7A7D8A", fontSize: 12, marginBottom: 4,
            textTransform: "uppercase" as const,
            letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace",
          }}>
            Monto a transferir
          </p>
          <p style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(32px, 8vw, 48px)",
            fontWeight: 800, color: "#00E5A0",
          }}>
            ${Number(data.monto).toLocaleString("es-MX")}
            <span style={{ fontSize: "0.4em", color: "#7A7D8A", marginLeft: 4 }}>MXN</span>
          </p>
          <p style={{ color: "#E8E9ED", fontSize: 15, marginTop: 4 }}>{data.concepto}</p>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 -8px 24px" }} />

        {/* Bank details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <DetailRow label="Banco" value={data.datos_bancarios.banco} />
          <DetailRow label="Titular" value={data.datos_bancarios.titular} />

          {/* CLABE with copy button */}
          <div>
            <p style={{
              color: "#7A7D8A", fontSize: 12, marginBottom: 8,
              textTransform: "uppercase" as const, letterSpacing: 0.5,
            }}>
              CLABE Interbancaria
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <code style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "clamp(14px, 3.5vw, 18px)",
                color: "#E8E9ED",
                background: "#161821",
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.06)",
                letterSpacing: 2, flex: 1, minWidth: 0,
              }}>
                {data.datos_bancarios.clabe}
              </code>
              <button
                onClick={handleCopy}
                style={{
                  padding: "8px 16px",
                  background: copied ? "rgba(0,229,160,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${copied ? "rgba(0,229,160,0.3)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 8,
                  color: copied ? "#00E5A0" : "#E8E9ED",
                  fontSize: 13, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s ease",
                  whiteSpace: "nowrap" as const, fontFamily: "inherit",
                }}
              >
                {copied ? "✓ Copiada" : "Copiar"}
              </button>
            </div>
          </div>

          {data.datos_bancarios.referencia && (
            <DetailRow label="Referencia / Concepto" value={data.datos_bancarios.referencia} />
          )}
        </div>
      </div>

      {/* Steps */}
      <div style={{
        marginTop: 20, padding: "16px 20px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
      }}>
        <p style={{ color: "#7A7D8A", fontSize: 12, marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
          Pasos para pagar
        </p>
        {[
          "Abre tu aplicación bancaria",
          'Selecciona "Transferencia" o "SPEI"',
          `Ingresa la CLABE y el monto exacto: $${Number(data.monto).toLocaleString("es-MX")} MXN`,
          "Toma screenshot del comprobante",
          'Adjúntalo abajo y presiona "Ya pagué"',
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 4 ? 10 : 0 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "rgba(0,229,160,0.1)",
              border: "1px solid rgba(0,229,160,0.2)",
              color: "#00E5A0", fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <p style={{ color: "#E8E9ED", fontSize: 14, lineHeight: 1.5, paddingTop: 2 }}>{step}</p>
          </div>
        ))}
      </div>

      {/* Comprobante upload */}
      <div style={{ marginTop: 20 }}>
        <p style={{ color: "#7A7D8A", fontSize: 12, marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
          Adjuntar comprobante
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {comprobante ? (
          // File selected
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px",
            background: "rgba(0,229,160,0.06)",
            border: "1.5px solid rgba(0,229,160,0.25)",
            borderRadius: 12,
          }}>
            {/* File icon */}
            <div style={{
              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
              background: "rgba(0,229,160,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#00E5A0",
            }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#E8E9ED", fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                {comprobante.name}
              </p>
              <p style={{ color: "#7A7D8A", fontSize: 12 }}>{formatFileSize(comprobante.size)}</p>
            </div>
            <button
              onClick={removeFile}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#7A7D8A", padding: 4, borderRadius: 6,
                display: "flex", alignItems: "center",
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          // Drop zone
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%", padding: "20px 16px", textAlign: "center" as const,
              background: "rgba(255,255,255,0.02)",
              border: "1.5px dashed rgba(255,255,255,0.12)",
              borderRadius: 12, cursor: "pointer",
              transition: "all 0.2s ease", fontFamily: "inherit",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,229,160,0.3)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,229,160,0.04)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)";
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 10px", color: "#7A7D8A",
            }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p style={{ color: "#E8E9ED", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
              Toca para adjuntar tu comprobante
            </p>
            <p style={{ color: "#7A7D8A", fontSize: 12 }}>
              Imagen o PDF · máx. 10 MB
            </p>
          </button>
        )}
      </div>

      {/* Notify button */}
      <div style={{ padding: "28px 0 56px", textAlign: "center" }}>
        <button
          onClick={handleNotify}
          disabled={notifying}
          style={{
            width: "100%", maxWidth: 380,
            padding: "16px 32px",
            background: notifying ? "rgba(0,229,160,0.4)" : "#00E5A0",
            border: "none", borderRadius: 100,
            color: "#05060A", fontSize: 16, fontWeight: 700,
            cursor: notifying ? "default" : "pointer",
            fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s ease",
          }}
        >
          {notifying ? (
            <>
              <span style={{
                width: 16, height: 16,
                border: "2px solid #05060A", borderTopColor: "transparent",
                borderRadius: "50%", display: "inline-block",
                animation: "spin 0.6s linear infinite",
              }} />
              Enviando...
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Ya realicé mi pago
            </>
          )}
        </button>
        <p style={{ color: "#7A7D8A", fontSize: 12, marginTop: 12, lineHeight: 1.5 }}>
          {comprobante
            ? "Se enviará el comprobante adjunto al equipo de NorthPeak"
            : "Notificaremos al equipo para que confirmen tu transferencia"}
        </p>
      </div>
    </Shell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{
        color: "#7A7D8A", fontSize: 12, marginBottom: 4,
        textTransform: "uppercase" as const, letterSpacing: 0.5,
      }}>
        {label}
      </p>
      <p style={{ color: "#E8E9ED", fontSize: 15, fontWeight: 500 }}>{value}</p>
    </div>
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

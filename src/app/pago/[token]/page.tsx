"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PagoData | null>(null);
  const [copied, setCopied] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/pago/${token}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Enlace de pago invalido");
          return;
        }
        setData(json);
      } catch {
        setError("Error de conexion");
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = data.datos_bancarios.clabe;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleNotify() {
    setNotifying(true);
    try {
      const res = await fetch(`/api/pago/${token}`, { method: "POST" });
      if (res.ok) {
        setNotified(true);
      }
    } catch {
      // silent fail
    }
    setNotifying(false);
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-[#00E5A0] border-t-transparent rounded-full animate-spin" />
            <p style={{ color: "#7A7D8A" }}>Cargando informacion de pago...</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-4xl mb-4">:(</div>
            <h2
              style={{
                color: "#E8E9ED",
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Enlace no valido
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center" style={{ maxWidth: 440 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(0,229,160,0.1)",
                border: "2px solid rgba(0,229,160,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 28,
                color: "#00E5A0",
              }}
            >
              &#10003;
            </div>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                color: "#E8E9ED",
                fontSize: 24,
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              Notificacion enviada
            </h2>
            <p
              style={{
                color: "#7A7D8A",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              Hemos notificado al equipo de NorthPeak sobre tu pago. Te
              contactaremos para confirmar la recepcion.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div
        style={{
          padding: "48px 0 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
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
          }}
        >
          Pago pendiente
        </div>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(22px, 5vw, 32px)",
            fontWeight: 800,
            color: "#E8E9ED",
            marginBottom: 4,
          }}
        >
          Hola, {data.client_name}
        </h1>
        <p style={{ color: "#7A7D8A", fontSize: 14 }}>
          Aqui estan los datos para realizar tu pago
        </p>
      </div>

      {/* Payment card */}
      <div
        style={{
          background: "#0C0D12",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "clamp(20px, 4vw, 32px)",
          marginTop: 24,
        }}
      >
        {/* Amount */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p
            style={{
              color: "#7A7D8A",
              fontSize: 13,
              marginBottom: 4,
              textTransform: "uppercase" as const,
              letterSpacing: 1,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Monto a pagar
          </p>
          <p
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(32px, 8vw, 48px)",
              fontWeight: 800,
              color: "#00E5A0",
            }}
          >
            ${Number(data.monto).toLocaleString("es-MX")}
            <span
              style={{ fontSize: "0.4em", color: "#7A7D8A", marginLeft: 4 }}
            >
              MXN
            </span>
          </p>
          <p style={{ color: "#E8E9ED", fontSize: 15, marginTop: 4 }}>
            {data.concepto}
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.06)",
            margin: "0 -8px 24px",
          }}
        />

        {/* Bank details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DetailRow label="Banco" value={data.datos_bancarios.banco} />
          <DetailRow label="Titular" value={data.datos_bancarios.titular} />
          <div>
            <p
              style={{
                color: "#7A7D8A",
                fontSize: 12,
                marginBottom: 6,
                textTransform: "uppercase" as const,
                letterSpacing: 0.5,
              }}
            >
              CLABE Interbancaria
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <code
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "clamp(14px, 3.5vw, 18px)",
                  color: "#E8E9ED",
                  background: "#161821",
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.06)",
                  letterSpacing: 2,
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {data.datos_bancarios.clabe}
              </code>
              <button
                onClick={handleCopy}
                style={{
                  padding: "8px 16px",
                  background: copied
                    ? "rgba(0,229,160,0.15)"
                    : "rgba(255,255,255,0.06)",
                  border: `1px solid ${copied ? "rgba(0,229,160,0.3)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 8,
                  color: copied ? "#00E5A0" : "#E8E9ED",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap" as const,
                  fontFamily: "inherit",
                }}
              >
                {copied ? "Copiada" : "Copiar"}
              </button>
            </div>
          </div>
          {data.datos_bancarios.referencia && (
            <DetailRow
              label="Referencia"
              value={data.datos_bancarios.referencia}
            />
          )}
        </div>
      </div>

      {/* Notify button */}
      <div style={{ padding: "32px 0 48px", textAlign: "center" }}>
        <button
          onClick={handleNotify}
          disabled={notifying}
          style={{
            width: "100%",
            maxWidth: 360,
            padding: "16px 32px",
            background: notifying ? "rgba(0,229,160,0.3)" : "#00E5A0",
            border: "none",
            borderRadius: 100,
            color: "#05060A",
            fontSize: 16,
            fontWeight: 700,
            cursor: notifying ? "default" : "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s ease",
          }}
        >
          {notifying ? (
            <>
              <span
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid #05060A",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.6s linear infinite",
                }}
              />
              Notificando...
            </>
          ) : (
            "Ya pague"
          )}
        </button>
        <p
          style={{
            color: "#7A7D8A",
            fontSize: 12,
            marginTop: 12,
            lineHeight: 1.5,
          }}
        >
          Al presionar este boton, notificaremos al equipo para que confirmen tu
          pago
        </p>
      </div>
    </Shell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        style={{
          color: "#7A7D8A",
          fontSize: 12,
          marginBottom: 2,
          textTransform: "uppercase" as const,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </p>
      <p style={{ color: "#E8E9ED", fontSize: 15 }}>{value}</p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#05060A",
        minHeight: "100vh",
        color: "#E8E9ED",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #05060A; }
        @keyframes spin { to { transform: rotate(360deg); } }
        button { font-family: inherit; }
      `}</style>
      <nav
        style={{
          padding: "16px 0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              color: "#fff",
            }}
          >
            NorthPeak
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              padding: "3px 8px",
              border: "1px solid #00E5A0",
              borderRadius: 4,
              color: "#00E5A0",
            }}
          >
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

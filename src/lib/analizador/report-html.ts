import type { DatosNegocio, Hallazgos, Oportunidad } from "./scoring";

export function generarReporteHTML(
  datos: DatosNegocio,
  hallazgos: Hallazgos,
  score: number,
  ops: Oportunidad[],
  prioridad: { nivel: string; color: string; desc: string }
): string {
  const { nivel, color: colorNivel, desc: descNivel } = prioridad;

  const fecha = new Date().toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const criticas = ops.filter((o) => o.impacto === "critico").length;
  const altas = ops.filter((o) => o.impacto === "alto").length;
  const medias = ops.filter((o) => o.impacto === "medio").length;

  const impactoColor: Record<string, string> = { critico: "#EF4444", alto: "#F59E0B", medio: "#3B82F6" };
  const impactoLabel: Record<string, string> = { critico: "CRÍTICO", alto: "ALTO", medio: "MEDIO" };
  const difLabel: Record<string, string> = { facil: "Fácil de implementar", medio: "Requiere apoyo técnico" };

  const opsHtml = ops
    .map(
      (op, i) => `
        <div class="op-card" style="animation-delay: ${(i * 0.08).toFixed(2)}s">
            <div class="op-header">
                <span class="op-icon">${op.icono}</span>
                <div class="op-meta">
                    <span class="op-canal">${op.canal}</span>
                    <span class="op-impacto" style="background: ${impactoColor[op.impacto]}15; color: ${impactoColor[op.impacto]}; border: 1px solid ${impactoColor[op.impacto]}30">
                        ${impactoLabel[op.impacto]}
                    </span>
                </div>
            </div>
            <h3 class="op-titulo">${op.titulo}</h3>
            <p class="op-desc">${op.desc}</p>
            <span class="op-dificultad">${difLabel[op.dificultad]}</span>
        </div>`
    )
    .join("");

  function canalStatus(activo: boolean, label: string) {
    return activo
      ? `<div class="canal-item canal-activo"><span class="canal-dot activo"></span>${label}</div>`
      : `<div class="canal-item canal-inactivo"><span class="canal-dot inactivo"></span>${label}</div>`;
  }

  const h = hallazgos;
  const canalesHtml = [
    canalStatus(h.google_maps.tiene_perfil, "Google Maps"),
    canalStatus(h.google_search.aparece_busqueda, "Google Search"),
    canalStatus(h.instagram.tiene_cuenta, "Instagram"),
    canalStatus(h.facebook.tiene_pagina, "Facebook"),
    canalStatus(h.sitio_web.tiene_sitio, "Sitio Web"),
    canalStatus(h.publicidad.tiene_meta_ads, "Meta Ads"),
    canalStatus(h.publicidad.tiene_google_ads, "Google Ads"),
  ].join("");

  const encodedName = encodeURIComponent(datos.nombre);
  const waText = `Hola%2C%20vi%20mi%20an%C3%A1lisis%20digital%20de%20${encodedName}%20y%20me%20gustar%C3%ADa%20saber%20c%C3%B3mo%20pueden%20ayudarme`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análisis Digital — ${datos.nombre} | NorthPeak Digital</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #05060A;
            --bg-card: #0C0D12;
            --bg-card-hover: #12131A;
            --surface: #161821;
            --border: rgba(255,255,255,0.06);
            --border-hover: rgba(255,255,255,0.12);
            --text: #E8E9ED;
            --text-muted: #7A7D8A;
            --text-dim: #4A4D5A;
            --accent: #00E5A0;
            --accent-dim: rgba(0,229,160,0.1);
            --accent-glow: rgba(0,229,160,0.15);
            --blue: #3B82F6;
            --red: #EF4444;
            --yellow: #F59E0B;
            --white: #FFFFFF;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
            font-family: 'DM Sans', sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            overflow-x: hidden;
        }
        body::after {
            content: '';
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
            pointer-events: none;
            z-index: 9999;
        }
        .container { max-width: 800px; margin: 0 auto; padding: 0 24px; }
        nav { padding: 20px 0; border-bottom: 1px solid var(--border); background: rgba(5,6,10,0.9); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100; }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; max-width: 800px; margin: 0 auto; padding: 0 24px; }
        .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: var(--white); display: flex; align-items: center; gap: 8px; }
        .nav-logo span { color: var(--accent); font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; padding: 3px 8px; border: 1px solid var(--accent); border-radius: 4px; }
        .header { padding: 60px 0 40px; position: relative; }
        .header::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 600px; height: 400px; background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 60%); filter: blur(80px); pointer-events: none; }
        .report-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: var(--accent-dim); border: 1px solid rgba(0,229,160,0.2); border-radius: 100px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; color: var(--accent); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px; }
        .report-badge::before { content: ''; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }
        .biz-name { font-family: 'Syne', sans-serif; font-size: clamp(28px, 5vw, 40px); font-weight: 800; color: var(--white); line-height: 1.15; margin-bottom: 12px; }
        .biz-meta { font-size: 14px; color: var(--text-muted); }
        .biz-meta strong { color: var(--text); }
        .score-section { padding: 48px 0; display: flex; gap: 32px; align-items: center; flex-wrap: wrap; }
        .score-ring { position: relative; width: 160px; height: 160px; flex-shrink: 0; }
        .score-ring svg { width: 160px; height: 160px; transform: rotate(-90deg); }
        .score-bg { fill: none; stroke: var(--surface); stroke-width: 10; }
        .score-fill { fill: none; stroke: ${colorNivel}; stroke-width: 10; stroke-linecap: round; stroke-dasharray: ${(score * 4.08).toFixed(2)} 408; transition: stroke-dasharray 1.5s ease; }
        .score-number { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: 'Syne', sans-serif; font-size: 42px; font-weight: 800; color: ${colorNivel}; }
        .score-info { flex: 1; min-width: 240px; }
        .score-level { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600; color: ${colorNivel}; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
        .score-desc { font-size: 15px; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px; }
        .score-stats { display: flex; gap: 24px; }
        .score-stat-num { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; }
        .score-stat-label { font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
        .canales { padding: 32px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .canales-title { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; color: var(--text-dim); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; }
        .canales-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .canal-item { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 100px; font-size: 13px; font-weight: 500; }
        .canal-dot { width: 8px; height: 8px; border-radius: 50%; }
        .canal-dot.activo { background: var(--accent); box-shadow: 0 0 8px var(--accent-glow); }
        .canal-dot.inactivo { background: var(--red); }
        .canal-activo { color: var(--text); }
        .canal-inactivo { color: var(--text-muted); }
        .ops-section { padding: 48px 0; }
        .ops-header { margin-bottom: 32px; }
        .ops-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
        .ops-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--white); margin-bottom: 8px; }
        .ops-sub { font-size: 15px; color: var(--text-muted); }
        .op-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 12px; transition: all 0.3s ease; opacity: 0; animation: fadeUp 0.5s ease forwards; }
        .op-card:hover { background: var(--bg-card-hover); border-color: var(--border-hover); transform: translateY(-2px); }
        .op-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .op-icon { font-size: 24px; }
        .op-meta { display: flex; align-items: center; gap: 8px; }
        .op-canal { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase; }
        .op-impacto { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 3px 10px; border-radius: 100px; }
        .op-titulo { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--white); margin-bottom: 8px; }
        .op-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 10px; }
        .op-dificultad { font-size: 12px; color: var(--text-dim); font-style: italic; }
        .cta-section { padding: 60px 0; text-align: center; position: relative; }
        .cta-section::before { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 500px; height: 300px; background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 60%); filter: blur(60px); pointer-events: none; }
        .cta-title { font-family: 'Syne', sans-serif; font-size: clamp(22px, 4vw, 32px); font-weight: 800; color: var(--white); margin-bottom: 16px; }
        .cta-desc { font-size: 15px; color: var(--text-muted); max-width: 480px; margin: 0 auto 32px; line-height: 1.7; }
        .cta-btn { display: inline-flex; align-items: center; gap: 10px; padding: 16px 36px; background: var(--accent); color: var(--bg); text-decoration: none; border-radius: 100px; font-weight: 700; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 30px var(--accent-glow); }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(0,229,160,0.25); }
        .cta-note { margin-top: 16px; font-size: 13px; color: var(--text-dim); }
        footer { padding: 40px 0; border-top: 1px solid var(--border); text-align: center; }
        .footer-text { font-size: 13px; color: var(--text-dim); }
        .footer-text a { color: var(--accent); text-decoration: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) { .score-section { flex-direction: column; align-items: flex-start; } .score-ring { width: 130px; height: 130px; } .score-ring svg { width: 130px; height: 130px; } .score-number { font-size: 34px; } }
    </style>
</head>
<body>
    <nav>
        <div class="nav-inner">
            <div class="nav-logo">NorthPeak <span>Digital</span></div>
        </div>
    </nav>
    <div class="container">
        <section class="header">
            <div class="report-badge">Análisis de Presencia Digital</div>
            <h1 class="biz-name">${datos.nombre}</h1>
            <p class="biz-meta">
                <strong>${datos.giro}</strong> · ${datos.zona}<br>
                Analizado el ${fecha}
            </p>
        </section>
        <section class="score-section">
            <div class="score-ring">
                <svg viewBox="0 0 140 140">
                    <circle class="score-bg" cx="70" cy="70" r="65"/>
                    <circle class="score-fill" cx="70" cy="70" r="65"/>
                </svg>
                <div class="score-number">${score}</div>
            </div>
            <div class="score-info">
                <div class="score-level">NIVEL: ${nivel}</div>
                <p class="score-desc">${descNivel}</p>
                <div class="score-stats">
                    <div>
                        <div class="score-stat-num" style="color: #EF4444">${criticas}</div>
                        <div class="score-stat-label">Críticas</div>
                    </div>
                    <div>
                        <div class="score-stat-num" style="color: #F59E0B">${altas}</div>
                        <div class="score-stat-label">Altas</div>
                    </div>
                    <div>
                        <div class="score-stat-num" style="color: #3B82F6">${medias}</div>
                        <div class="score-stat-label">Medias</div>
                    </div>
                </div>
            </div>
        </section>
        <section class="canales">
            <div class="canales-title">Canales Digitales</div>
            <div class="canales-grid">
                ${canalesHtml}
            </div>
        </section>
        <section class="ops-section">
            <div class="ops-header">
                <div class="ops-label">Áreas de Oportunidad</div>
                <h2 class="ops-title">Encontramos ${ops.length} oportunidades para crecer.</h2>
                <p class="ops-sub">Estas son las acciones que mayor impacto tendrían en la captación de clientes de ${datos.nombre}.</p>
            </div>
            ${opsHtml}
        </section>
        <section class="cta-section">
            <h2 class="cta-title">¿Quieres resolver todo esto en 48 horas?</h2>
            <p class="cta-desc">
                En NorthPeak Digital construimos sistemas de IA que resuelven cada uno de estos problemas automáticamente. Agenda una consulta gratuita y te mostramos cómo.
            </p>
            <a href="https://wa.me/528121980008?text=${waText}" class="cta-btn" target="_blank">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.214l-.252-.149-2.868.852.852-2.868-.149-.252A8 8 0 1112 20z"/></svg>
                Agendar Consulta Gratuita
            </a>
            <p class="cta-note">✓ 100% gratuita · ✓ Sin compromiso · ✓ Respuesta en menos de 1 hora</p>
        </section>
    </div>
    <footer>
        <div class="container">
            <p class="footer-text">
                Análisis generado por <a href="https://www.northpeakdigital.com.mx" target="_blank">NorthPeak Digital</a> · Infraestructura de IA para Negocios · Monterrey, NL
            </p>
        </div>
    </footer>
</body>
</html>`;
}

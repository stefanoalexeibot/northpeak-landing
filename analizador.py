"""
🏔️ NORTHPEAK DIGITAL — ANALIZADOR DE PRESENCIA DIGITAL
=========================================================
Analiza la presencia digital de cualquier negocio y genera
un reporte HTML premium con áreas de oportunidad.

Analiza:
- Instagram (seguidores, frecuencia de posts, engagement)
- Google Search (¿aparece en resultados?)
- Google Maps (perfil reclamado, reseñas, fotos, horarios)
- Facebook (página activa, frecuencia, seguidores)
- Sitio Web (existe, responsive, WhatsApp visible, booking)

Genera:
- Score de 0-100
- Reporte HTML premium con colores NorthPeak
- Áreas de oportunidad detalladas
- CTA directo a WhatsApp de NorthPeak

INSTRUCCIONES:
1. Llena los datos del negocio en la sección DATOS_NEGOCIO
2. Llena los hallazgos de cada canal manualmente después de investigar
3. Ejecuta el script: python3 analizador.py
4. Se genera un HTML en /reportes/ listo para subir a Vercel
"""

import os
import json
from datetime import datetime

# ============================================================
# DATOS DEL NEGOCIO A ANALIZAR
# ============================================================
DATOS_NEGOCIO = {
    "nombre": "EJEMPLO Nail Studio",        # Nombre del negocio
    "giro": "Salón de Uñas",                # Tipo de negocio
    "zona": "San Pedro Garza García, NL",    # Ubicación
    "contacto": "Ana García",                # Nombre del dueño/a
    "telefono": "+52 81 1234 5678",          # Teléfono del negocio
}

# ============================================================
# HALLAZGOS POR CANAL (LLENAR MANUALMENTE)
# ============================================================
# Después de investigar el negocio en cada plataforma,
# cambia los valores a True/False y llena los números.
# ============================================================

HALLAZGOS = {
    "google_maps": {
        "tiene_perfil": True,           # ¿Aparece en Google Maps?
        "perfil_reclamado": False,       # ¿El perfil está verificado/reclamado?
        "num_resenas": 12,               # Número de reseñas
        "rating": 4.2,                   # Calificación promedio (0-5)
        "tiene_fotos": True,             # ¿Tiene fotos?
        "num_fotos": 5,                  # Cantidad de fotos
        "tiene_horarios": False,         # ¿Tiene horarios actualizados?
        "tiene_sitio_web": False,        # ¿Tiene link a sitio web?
        "tiene_telefono": True,          # ¿Tiene teléfono visible?
        "responde_resenas": False,       # ¿Responde a las reseñas?
    },
    "google_search": {
        "aparece_busqueda": False,       # ¿Aparece al buscar "[nombre] [zona]"?
        "posicion_aprox": 0,             # Posición aproximada (0 = no aparece)
        "tiene_seo_basico": False,       # ¿Tiene presencia SEO básica?
    },
    "instagram": {
        "tiene_cuenta": True,            # ¿Tiene cuenta de Instagram?
        "username": "@ejemplo_nails",    # @ del perfil
        "seguidores": 340,               # Número de seguidores
        "posts_ultimo_mes": 3,           # Posts publicados en el último mes
        "tiene_highlights": False,       # ¿Tiene highlights organizados?
        "tiene_link_bio": False,         # ¿Tiene link en bio (Linktree, web, WhatsApp)?
        "tiene_whatsapp_bio": False,     # ¿Tiene WhatsApp en la bio?
        "usa_reels": False,              # ¿Publica Reels?
        "calidad_contenido": "media",    # baja / media / alta
        "tiene_precios": False,          # ¿Publica precios?
    },
    "facebook": {
        "tiene_pagina": True,            # ¿Tiene página de Facebook?
        "pagina_activa": False,          # ¿Ha publicado en los últimos 30 días?
        "tiene_resenas_fb": True,        # ¿Tiene reseñas en Facebook?
        "num_likes": 180,                # Likes/seguidores de la página
        "tiene_messenger": True,         # ¿Tiene Messenger activo?
        "responde_rapido": False,        # ¿Tiene badge de respuesta rápida?
        "tiene_catalogo": False,         # ¿Tiene catálogo de servicios?
    },
    "sitio_web": {
        "tiene_sitio": False,            # ¿Tiene sitio web?
        "url": "",                       # URL del sitio
        "es_responsive": False,          # ¿Se ve bien en celular?
        "tiene_whatsapp": False,         # ¿Tiene botón de WhatsApp?
        "tiene_booking": False,          # ¿Tiene sistema de reservas?
        "tiene_precios": False,          # ¿Muestra precios?
        "tiene_ssl": False,              # ¿Tiene HTTPS?
        "velocidad": "n/a",              # lenta / media / rapida / n/a
    },
    "publicidad": {
        "tiene_meta_ads": False,         # ¿Corre anuncios en Facebook/Instagram?
        "tiene_google_ads": False,       # ¿Corre anuncios en Google?
    }
}


# ============================================================
# MOTOR DE ANÁLISIS
# ============================================================
def calcular_score(h):
    """Calcula el score de presencia digital de 0-100"""
    score = 0
    max_score = 0
    
    # GOOGLE MAPS (25 puntos)
    gm = h["google_maps"]
    max_score += 25
    if gm["tiene_perfil"]: score += 3
    if gm["perfil_reclamado"]: score += 5
    if gm["num_resenas"] >= 50: score += 5
    elif gm["num_resenas"] >= 20: score += 3
    elif gm["num_resenas"] >= 5: score += 1
    if gm["rating"] >= 4.5: score += 3
    elif gm["rating"] >= 4.0: score += 2
    elif gm["rating"] >= 3.5: score += 1
    if gm["num_fotos"] >= 20: score += 3
    elif gm["num_fotos"] >= 10: score += 2
    elif gm["num_fotos"] >= 5: score += 1
    if gm["tiene_horarios"]: score += 2
    if gm["tiene_sitio_web"]: score += 2
    if gm["responde_resenas"]: score += 2
    
    # GOOGLE SEARCH (10 puntos)
    gs = h["google_search"]
    max_score += 10
    if gs["aparece_busqueda"]: score += 5
    if gs["posicion_aprox"] > 0 and gs["posicion_aprox"] <= 3: score += 3
    elif gs["posicion_aprox"] > 0 and gs["posicion_aprox"] <= 10: score += 1
    if gs["tiene_seo_basico"]: score += 2
    
    # INSTAGRAM (25 puntos)
    ig = h["instagram"]
    max_score += 25
    if ig["tiene_cuenta"]: score += 2
    if ig["seguidores"] >= 5000: score += 5
    elif ig["seguidores"] >= 1000: score += 3
    elif ig["seguidores"] >= 300: score += 1
    if ig["posts_ultimo_mes"] >= 12: score += 5
    elif ig["posts_ultimo_mes"] >= 8: score += 3
    elif ig["posts_ultimo_mes"] >= 4: score += 2
    elif ig["posts_ultimo_mes"] >= 1: score += 1
    if ig["tiene_highlights"]: score += 2
    if ig["tiene_link_bio"]: score += 2
    if ig["tiene_whatsapp_bio"]: score += 2
    if ig["usa_reels"]: score += 3
    if ig["calidad_contenido"] == "alta": score += 3
    elif ig["calidad_contenido"] == "media": score += 1
    if ig["tiene_precios"]: score += 1
    
    # FACEBOOK (15 puntos)
    fb = h["facebook"]
    max_score += 15
    if fb["tiene_pagina"]: score += 2
    if fb["pagina_activa"]: score += 3
    if fb["num_likes"] >= 1000: score += 3
    elif fb["num_likes"] >= 500: score += 2
    elif fb["num_likes"] >= 100: score += 1
    if fb["responde_rapido"]: score += 3
    if fb["tiene_catalogo"]: score += 2
    if fb["tiene_resenas_fb"]: score += 2
    
    # SITIO WEB (15 puntos)
    sw = h["sitio_web"]
    max_score += 15
    if sw["tiene_sitio"]: score += 3
    if sw["es_responsive"]: score += 3
    if sw["tiene_whatsapp"]: score += 3
    if sw["tiene_booking"]: score += 3
    if sw["tiene_precios"]: score += 1
    if sw["tiene_ssl"]: score += 1
    if sw["velocidad"] == "rapida": score += 1
    
    # PUBLICIDAD (10 puntos)
    pub = h["publicidad"]
    max_score += 10
    if pub["tiene_meta_ads"]: score += 6
    if pub["tiene_google_ads"]: score += 4
    
    return int((score / max_score) * 100)


def generar_oportunidades(h):
    """Genera lista de áreas de oportunidad basada en los hallazgos"""
    ops = []
    
    gm = h["google_maps"]
    if not gm["perfil_reclamado"]:
        ops.append({
            "canal": "Google Maps",
            "icono": "📍",
            "titulo": "Reclamar y verificar el perfil de Google Maps",
            "desc": "Tu perfil de Google no está verificado. Esto significa que cualquier persona puede sugerir cambios a tu información. Reclamarlo te da control total y mejora tu posición en búsquedas locales.",
            "impacto": "alto",
            "dificultad": "facil"
        })
    if gm["num_resenas"] < 20:
        ops.append({
            "canal": "Google Maps",
            "icono": "⭐",
            "titulo": f"Aumentar reseñas (actualmente {gm['num_resenas']})",
            "desc": "Los negocios con más de 20 reseñas reciben hasta 3x más clicks. Implementar un sistema automático que pida reseñas después de cada servicio puede transformar tu visibilidad.",
            "impacto": "alto",
            "dificultad": "facil"
        })
    if not gm["tiene_horarios"]:
        ops.append({
            "canal": "Google Maps",
            "icono": "🕐",
            "titulo": "Agregar horarios de atención",
            "desc": "Sin horarios visibles, los clientes no saben si estás abierto y buscan otra opción. Google también penaliza perfiles incompletos.",
            "impacto": "medio",
            "dificultad": "facil"
        })
    if not gm["responde_resenas"]:
        ops.append({
            "canal": "Google Maps",
            "icono": "💬",
            "titulo": "Responder a todas las reseñas",
            "desc": "Responder reseñas (positivas y negativas) mejora tu posicionamiento y muestra que te importan tus clientes. Google premia perfiles activos.",
            "impacto": "medio",
            "dificultad": "facil"
        })
    if gm["num_fotos"] < 15:
        ops.append({
            "canal": "Google Maps",
            "icono": "📸",
            "titulo": f"Subir más fotos ({gm['num_fotos']} actuales, mínimo 15)",
            "desc": "Los perfiles con 15+ fotos reciben 2x más interacciones. Sube fotos del local, de tus trabajos, del equipo y del ambiente.",
            "impacto": "medio",
            "dificultad": "facil"
        })
    
    gs = h["google_search"]
    if not gs["aparece_busqueda"]:
        ops.append({
            "canal": "Google",
            "icono": "🔍",
            "titulo": "No apareces en búsquedas de Google",
            "desc": "Cuando alguien busca tu tipo de negocio en tu zona, no te encuentra. Esto es una fuga masiva de clientes potenciales que están activamente buscando tus servicios.",
            "impacto": "critico",
            "dificultad": "medio"
        })
    
    ig = h["instagram"]
    if ig["tiene_cuenta"] and ig["posts_ultimo_mes"] < 8:
        ops.append({
            "canal": "Instagram",
            "icono": "📱",
            "titulo": f"Aumentar frecuencia de publicación ({ig['posts_ultimo_mes']} posts/mes)",
            "desc": "El algoritmo de Instagram favorece cuentas activas. Se recomiendan mínimo 3 posts por semana. Tu competencia está publicando más que tú.",
            "impacto": "alto",
            "dificultad": "medio"
        })
    if ig["tiene_cuenta"] and not ig["usa_reels"]:
        ops.append({
            "canal": "Instagram",
            "icono": "🎬",
            "titulo": "Empezar a usar Reels",
            "desc": "Los Reels tienen hasta 10x más alcance que las publicaciones normales. Son la mejor forma de llegar a audiencia nueva sin pagar publicidad.",
            "impacto": "alto",
            "dificultad": "medio"
        })
    if ig["tiene_cuenta"] and not ig["tiene_link_bio"]:
        ops.append({
            "canal": "Instagram",
            "icono": "🔗",
            "titulo": "Agregar link funcional en la bio",
            "desc": "Sin link en bio, los clientes interesados no tienen a dónde ir. Un link a WhatsApp o a una landing page de reservas convierte visitantes en clientes.",
            "impacto": "alto",
            "dificultad": "facil"
        })
    if ig["tiene_cuenta"] and not ig["tiene_whatsapp_bio"]:
        ops.append({
            "canal": "Instagram",
            "icono": "💚",
            "titulo": "Poner WhatsApp visible en el perfil",
            "desc": "El 70% de los clientes en México prefieren contactar por WhatsApp. Si no está visible en tu perfil, pierdes conversiones.",
            "impacto": "alto",
            "dificultad": "facil"
        })
    if ig["tiene_cuenta"] and not ig["tiene_highlights"]:
        ops.append({
            "canal": "Instagram",
            "icono": "✨",
            "titulo": "Organizar Highlights (historias destacadas)",
            "desc": "Los Highlights funcionan como menú de tu negocio: Servicios, Precios, Ubicación, Antes/Después, Reseñas. Un perfil sin highlights se ve descuidado.",
            "impacto": "medio",
            "dificultad": "facil"
        })
    if not ig["tiene_cuenta"]:
        ops.append({
            "canal": "Instagram",
            "icono": "📱",
            "titulo": "Crear cuenta de Instagram",
            "desc": "No tienes presencia en la red social más importante para negocios locales en México. Estás invisible para miles de clientes potenciales en tu zona.",
            "impacto": "critico",
            "dificultad": "medio"
        })
    
    fb = h["facebook"]
    if fb["tiene_pagina"] and not fb["pagina_activa"]:
        ops.append({
            "canal": "Facebook",
            "icono": "👻",
            "titulo": "Reactivar página de Facebook",
            "desc": "Tu página existe pero está inactiva. Una página abandonada genera desconfianza. Peor que no tener página es tener una muerta.",
            "impacto": "medio",
            "dificultad": "facil"
        })
    if fb["tiene_pagina"] and not fb["responde_rapido"]:
        ops.append({
            "canal": "Facebook",
            "icono": "⚡",
            "titulo": "Mejorar tiempo de respuesta en Messenger",
            "desc": "No tienes el badge de respuesta rápida. Los clientes ven esto y eligen negocios que responden más rápido. Un agente de IA resuelve esto al instante.",
            "impacto": "medio",
            "dificultad": "facil"
        })
    if not fb["tiene_pagina"]:
        ops.append({
            "canal": "Facebook",
            "icono": "📘",
            "titulo": "Crear página de Facebook",
            "desc": "Sin página de Facebook no puedes correr anuncios en Meta. Esto te bloquea de la plataforma publicitaria más poderosa para negocios locales.",
            "impacto": "critico",
            "dificultad": "facil"
        })
    
    sw = h["sitio_web"]
    if not sw["tiene_sitio"]:
        ops.append({
            "canal": "Sitio Web",
            "icono": "🌐",
            "titulo": "No tienes sitio web",
            "desc": "El 75% de los consumidores juzgan la credibilidad de un negocio por su sitio web. Sin uno, pierdes confianza y posicionamiento en Google.",
            "impacto": "critico",
            "dificultad": "medio"
        })
    if sw["tiene_sitio"] and not sw["tiene_whatsapp"]:
        ops.append({
            "canal": "Sitio Web",
            "icono": "💚",
            "titulo": "Agregar botón de WhatsApp al sitio",
            "desc": "Tu sitio web no tiene forma fácil de contactarte por WhatsApp. Estás perdiendo conversiones de personas que ya están interesadas.",
            "impacto": "alto",
            "dificultad": "facil"
        })
    if sw["tiene_sitio"] and not sw["es_responsive"]:
        ops.append({
            "canal": "Sitio Web",
            "icono": "📱",
            "titulo": "Tu sitio no se ve bien en celular",
            "desc": "El 80% del tráfico viene de celulares. Si tu sitio no es responsive, la mayoría de tus visitantes se van inmediatamente.",
            "impacto": "critico",
            "dificultad": "medio"
        })
    
    pub = h["publicidad"]
    if not pub["tiene_meta_ads"]:
        ops.append({
            "canal": "Publicidad",
            "icono": "🎯",
            "titulo": "No inviertes en publicidad digital",
            "desc": "Sin publicidad pagada, solo te ven tus seguidores actuales. Con $100-200 MXN/día puedes alcanzar a miles de clientes potenciales en tu zona que están buscando exactamente tus servicios.",
            "impacto": "critico",
            "dificultad": "medio"
        })
    
    return ops


def clasificar_prioridad(score):
    if score <= 25: return ("CRÍTICO", "#EF4444", "Tu presencia digital es casi inexistente. Estás perdiendo clientes todos los días.")
    elif score <= 50: return ("BAJO", "#F59E0B", "Tienes lo básico pero hay muchas áreas sin cubrir. Tu competencia te está superando.")
    elif score <= 75: return ("MEDIO", "#3B82F6", "Buena base pero faltan elementos clave para maximizar resultados.")
    else: return ("ALTO", "#10B981", "Buena presencia digital. Hay oportunidades para optimizar y escalar.")


# ============================================================
# GENERADOR DE REPORTE HTML
# ============================================================
def generar_reporte_html(datos, hallazgos, score, ops, prioridad):
    """Genera el reporte HTML premium con branding NorthPeak"""
    
    nivel, color_nivel, desc_nivel = prioridad
    fecha = datetime.now().strftime("%d de %B de %Y").replace("January","enero").replace("February","febrero").replace("March","marzo").replace("April","abril").replace("May","mayo").replace("June","junio").replace("July","julio").replace("August","agosto").replace("September","septiembre").replace("October","octubre").replace("November","noviembre").replace("December","diciembre")
    
    # Contar oportunidades por impacto
    criticas = len([o for o in ops if o["impacto"] == "critico"])
    altas = len([o for o in ops if o["impacto"] == "alto"])
    medias = len([o for o in ops if o["impacto"] == "medio"])
    
    # Score por canal
    def canal_score(canal_data, max_pts, calc_fn):
        return calc_fn(canal_data)
    
    # Generar HTML de oportunidades
    ops_html = ""
    for i, op in enumerate(ops):
        impacto_color = {"critico": "#EF4444", "alto": "#F59E0B", "medio": "#3B82F6"}.get(op["impacto"], "#6B7280")
        impacto_label = {"critico": "CRÍTICO", "alto": "ALTO", "medio": "MEDIO"}.get(op["impacto"], "")
        dif_label = {"facil": "Fácil de implementar", "medio": "Requiere apoyo técnico"}.get(op["dificultad"], "")
        
        ops_html += f'''
        <div class="op-card" style="animation-delay: {i * 0.08}s">
            <div class="op-header">
                <span class="op-icon">{op["icono"]}</span>
                <div class="op-meta">
                    <span class="op-canal">{op["canal"]}</span>
                    <span class="op-impacto" style="background: {impacto_color}15; color: {impacto_color}; border: 1px solid {impacto_color}30">
                        {impacto_label}
                    </span>
                </div>
            </div>
            <h3 class="op-titulo">{op["titulo"]}</h3>
            <p class="op-desc">{op["desc"]}</p>
            <span class="op-dificultad">{dif_label}</span>
        </div>'''
    
    # Canal status indicators
    def canal_status(activo, label):
        if activo:
            return f'<div class="canal-item canal-activo"><span class="canal-dot activo"></span>{label}</div>'
        else:
            return f'<div class="canal-item canal-inactivo"><span class="canal-dot inactivo"></span>{label}</div>'
    
    h = hallazgos
    canales_html = ""
    canales_html += canal_status(h["google_maps"]["tiene_perfil"], "Google Maps")
    canales_html += canal_status(h["google_search"]["aparece_busqueda"], "Google Search")
    canales_html += canal_status(h["instagram"]["tiene_cuenta"], "Instagram")
    canales_html += canal_status(h["facebook"]["tiene_pagina"], "Facebook")
    canales_html += canal_status(h["sitio_web"]["tiene_sitio"], "Sitio Web")
    canales_html += canal_status(h["publicidad"]["tiene_meta_ads"], "Meta Ads")
    canales_html += canal_status(h["publicidad"]["tiene_google_ads"], "Google Ads")

    html = f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análisis Digital — {datos["nombre"]} | NorthPeak Digital</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {{
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
        }}

        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        html {{ scroll-behavior: smooth; }}

        body {{
            font-family: 'DM Sans', sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            overflow-x: hidden;
        }}

        body::after {{
            content: '';
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
            pointer-events: none;
            z-index: 9999;
        }}

        .container {{ max-width: 800px; margin: 0 auto; padding: 0 24px; }}

        /* NAV */
        nav {{
            padding: 20px 0;
            border-bottom: 1px solid var(--border);
            background: rgba(5,6,10,0.9);
            backdrop-filter: blur(20px);
            position: sticky; top: 0; z-index: 100;
        }}
        .nav-inner {{
            display: flex; align-items: center; justify-content: space-between;
            max-width: 800px; margin: 0 auto; padding: 0 24px;
        }}
        .nav-logo {{
            font-family: 'Syne', sans-serif; font-weight: 800;
            font-size: 16px; color: var(--white);
            display: flex; align-items: center; gap: 8px;
        }}
        .nav-logo span {{
            color: var(--accent);
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px; font-weight: 500;
            letter-spacing: 2px; text-transform: uppercase;
            padding: 3px 8px; border: 1px solid var(--accent);
            border-radius: 4px;
        }}

        /* HEADER */
        .header {{
            padding: 60px 0 40px;
            position: relative;
        }}
        .header::before {{
            content: '';
            position: absolute; top: 0; left: 50%;
            transform: translateX(-50%);
            width: 600px; height: 400px;
            background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 60%);
            filter: blur(80px);
            pointer-events: none;
        }}
        .report-badge {{
            display: inline-flex; align-items: center; gap: 8px;
            padding: 6px 14px;
            background: var(--accent-dim);
            border: 1px solid rgba(0,229,160,0.2);
            border-radius: 100px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px; font-weight: 500;
            color: var(--accent); letter-spacing: 1px;
            text-transform: uppercase; margin-bottom: 24px;
        }}
        .report-badge::before {{
            content: ''; width: 6px; height: 6px;
            background: var(--accent); border-radius: 50%;
        }}
        .biz-name {{
            font-family: 'Syne', sans-serif;
            font-size: clamp(28px, 5vw, 40px);
            font-weight: 800; color: var(--white);
            line-height: 1.15; margin-bottom: 12px;
        }}
        .biz-meta {{
            font-size: 14px; color: var(--text-muted);
        }}
        .biz-meta strong {{ color: var(--text); }}

        /* SCORE */
        .score-section {{
            padding: 48px 0;
            display: flex; gap: 32px; align-items: center;
            flex-wrap: wrap;
        }}
        .score-ring {{
            position: relative;
            width: 160px; height: 160px;
            flex-shrink: 0;
        }}
        .score-ring svg {{ width: 160px; height: 160px; transform: rotate(-90deg); }}
        .score-bg {{ fill: none; stroke: var(--surface); stroke-width: 10; }}
        .score-fill {{
            fill: none; stroke: {color_nivel}; stroke-width: 10;
            stroke-linecap: round;
            stroke-dasharray: {score * 4.08} 408;
            transition: stroke-dasharray 1.5s ease;
        }}
        .score-number {{
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Syne', sans-serif;
            font-size: 42px; font-weight: 800;
            color: {color_nivel};
        }}
        .score-info {{ flex: 1; min-width: 240px; }}
        .score-level {{
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px; font-weight: 600;
            color: {color_nivel}; letter-spacing: 2px;
            text-transform: uppercase; margin-bottom: 8px;
        }}
        .score-desc {{
            font-size: 15px; color: var(--text-muted);
            line-height: 1.6; margin-bottom: 16px;
        }}
        .score-stats {{
            display: flex; gap: 24px;
        }}
        .score-stat-num {{
            font-family: 'Syne', sans-serif;
            font-size: 24px; font-weight: 800;
        }}
        .score-stat-label {{
            font-size: 11px; color: var(--text-dim);
            text-transform: uppercase; letter-spacing: 1px;
        }}

        /* CANALES */
        .canales {{
            padding: 32px 0;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
        }}
        .canales-title {{
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px; font-weight: 600;
            color: var(--text-dim); letter-spacing: 2px;
            text-transform: uppercase; margin-bottom: 16px;
        }}
        .canales-grid {{
            display: flex; flex-wrap: wrap; gap: 10px;
        }}
        .canal-item {{
            display: flex; align-items: center; gap: 8px;
            padding: 8px 16px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 100px;
            font-size: 13px; font-weight: 500;
        }}
        .canal-dot {{
            width: 8px; height: 8px; border-radius: 50%;
        }}
        .canal-dot.activo {{ background: var(--accent); box-shadow: 0 0 8px var(--accent-glow); }}
        .canal-dot.inactivo {{ background: var(--red); }}
        .canal-activo {{ color: var(--text); }}
        .canal-inactivo {{ color: var(--text-muted); }}

        /* OPORTUNIDADES */
        .ops-section {{
            padding: 48px 0;
        }}
        .ops-header {{
            margin-bottom: 32px;
        }}
        .ops-label {{
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px; font-weight: 600;
            color: var(--accent); letter-spacing: 2px;
            text-transform: uppercase; margin-bottom: 12px;
        }}
        .ops-title {{
            font-family: 'Syne', sans-serif;
            font-size: 28px; font-weight: 800;
            color: var(--white); margin-bottom: 8px;
        }}
        .ops-sub {{
            font-size: 15px; color: var(--text-muted);
        }}

        .op-card {{
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 28px;
            margin-bottom: 12px;
            transition: all 0.3s ease;
            opacity: 0;
            animation: fadeUp 0.5s ease forwards;
        }}
        .op-card:hover {{
            background: var(--bg-card-hover);
            border-color: var(--border-hover);
            transform: translateY(-2px);
        }}
        .op-header {{
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 12px;
        }}
        .op-icon {{ font-size: 24px; }}
        .op-meta {{ display: flex; align-items: center; gap: 8px; }}
        .op-canal {{
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px; font-weight: 500;
            color: var(--text-dim); letter-spacing: 1px;
            text-transform: uppercase;
        }}
        .op-impacto {{
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px; font-weight: 700;
            letter-spacing: 1px; padding: 3px 10px;
            border-radius: 100px;
        }}
        .op-titulo {{
            font-family: 'Syne', sans-serif;
            font-size: 16px; font-weight: 700;
            color: var(--white); margin-bottom: 8px;
        }}
        .op-desc {{
            font-size: 14px; color: var(--text-muted);
            line-height: 1.6; margin-bottom: 10px;
        }}
        .op-dificultad {{
            font-size: 12px; color: var(--text-dim);
            font-style: italic;
        }}

        /* CTA */
        .cta-section {{
            padding: 60px 0;
            text-align: center;
            position: relative;
        }}
        .cta-section::before {{
            content: '';
            position: absolute; bottom: 0; left: 50%;
            transform: translateX(-50%);
            width: 500px; height: 300px;
            background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 60%);
            filter: blur(60px);
            pointer-events: none;
        }}
        .cta-title {{
            font-family: 'Syne', sans-serif;
            font-size: clamp(22px, 4vw, 32px);
            font-weight: 800; color: var(--white);
            margin-bottom: 16px;
        }}
        .cta-desc {{
            font-size: 15px; color: var(--text-muted);
            max-width: 480px; margin: 0 auto 32px;
            line-height: 1.7;
        }}
        .cta-btn {{
            display: inline-flex; align-items: center; gap: 10px;
            padding: 16px 36px;
            background: var(--accent); color: var(--bg);
            text-decoration: none; border-radius: 100px;
            font-weight: 700; font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 30px var(--accent-glow);
        }}
        .cta-btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 8px 40px rgba(0,229,160,0.25);
        }}
        .cta-note {{
            margin-top: 16px;
            font-size: 13px; color: var(--text-dim);
        }}

        /* FOOTER */
        footer {{
            padding: 40px 0;
            border-top: 1px solid var(--border);
            text-align: center;
        }}
        .footer-text {{
            font-size: 13px; color: var(--text-dim);
        }}
        .footer-text a {{
            color: var(--accent); text-decoration: none;
        }}

        @keyframes fadeUp {{
            from {{ opacity: 0; transform: translateY(20px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}

        @media (max-width: 640px) {{
            .score-section {{ flex-direction: column; align-items: flex-start; }}
            .score-ring {{ width: 130px; height: 130px; }}
            .score-ring svg {{ width: 130px; height: 130px; }}
            .score-number {{ font-size: 34px; }}
        }}
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
            <h1 class="biz-name">{datos["nombre"]}</h1>
            <p class="biz-meta">
                <strong>{datos["giro"]}</strong> · {datos["zona"]}<br>
                Analizado el {fecha}
            </p>
        </section>

        <section class="score-section">
            <div class="score-ring">
                <svg viewBox="0 0 140 140">
                    <circle class="score-bg" cx="70" cy="70" r="65"/>
                    <circle class="score-fill" cx="70" cy="70" r="65"/>
                </svg>
                <div class="score-number">{score}</div>
            </div>
            <div class="score-info">
                <div class="score-level">NIVEL: {nivel}</div>
                <p class="score-desc">{desc_nivel}</p>
                <div class="score-stats">
                    <div>
                        <div class="score-stat-num" style="color: #EF4444">{criticas}</div>
                        <div class="score-stat-label">Críticas</div>
                    </div>
                    <div>
                        <div class="score-stat-num" style="color: #F59E0B">{altas}</div>
                        <div class="score-stat-label">Altas</div>
                    </div>
                    <div>
                        <div class="score-stat-num" style="color: #3B82F6">{medias}</div>
                        <div class="score-stat-label">Medias</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="canales">
            <div class="canales-title">Canales Digitales</div>
            <div class="canales-grid">
                {canales_html}
            </div>
        </section>

        <section class="ops-section">
            <div class="ops-header">
                <div class="ops-label">Áreas de Oportunidad</div>
                <h2 class="ops-title">Encontramos {len(ops)} oportunidades para crecer.</h2>
                <p class="ops-sub">Estas son las acciones que mayor impacto tendrían en la captación de clientes de {datos["nombre"]}.</p>
            </div>
            {ops_html}
        </section>

        <section class="cta-section">
            <h2 class="cta-title">¿Quieres resolver todo esto en 48 horas?</h2>
            <p class="cta-desc">
                En NorthPeak Digital construimos sistemas de IA que resuelven cada uno de estos problemas automáticamente. Agenda una consulta gratuita y te mostramos cómo.
            </p>
            <a href="https://wa.me/528121980008?text=Hola%2C%20vi%20mi%20an%C3%A1lisis%20digital%20de%20{datos['nombre'].replace(' ', '%20')}%20y%20me%20gustar%C3%ADa%20saber%20c%C3%B3mo%20pueden%20ayudarme" class="cta-btn" target="_blank">
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
</html>'''
    
    return html


# ============================================================
# MAIN
# ============================================================
if __name__ == "__main__":
    output_dir = "/home/claude/reportes"
    os.makedirs(output_dir, exist_ok=True)
    
    print("🏔️ NORTHPEAK DIGITAL — Analizador de Presencia Digital")
    print("=" * 55)
    
    # Calcular score
    score = calcular_score(HALLAZGOS)
    print(f"  📊 Score: {score}/100")
    
    # Generar oportunidades
    ops = generar_oportunidades(HALLAZGOS)
    print(f"  🔍 Oportunidades encontradas: {len(ops)}")
    
    # Clasificar
    prioridad = clasificar_prioridad(score)
    print(f"  🎯 Nivel: {prioridad[0]}")
    
    # Generar HTML
    html = generar_reporte_html(DATOS_NEGOCIO, HALLAZGOS, score, ops, prioridad)
    
    # Guardar
    filename = DATOS_NEGOCIO["nombre"].lower().replace(" ", "_").replace(".", "")
    filepath = f"{output_dir}/analisis_{filename}.html"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html)
    
    print(f"  ✅ Reporte generado: {filepath}")
    print("=" * 55)
    
    # También guardar datos estructurados
    data = {
        "negocio": DATOS_NEGOCIO,
        "score": score,
        "nivel": prioridad[0],
        "oportunidades": len(ops),
        "hallazgos": HALLAZGOS,
        "fecha": datetime.now().isoformat()
    }
    json_path = f"{output_dir}/analisis_{filename}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"  📄 Datos JSON: {json_path}")

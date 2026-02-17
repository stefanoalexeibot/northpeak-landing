# Guia Completa para Replicar el Sistema NorthPeak

> Este documento describe ABSOLUTAMENTE TODO lo que se construyo en el portal de NorthPeak Digital. El objetivo es que puedas enviar este archivo a Claude y replicar (o mejorar) el sistema completo para tu agencia inmobiliaria.

---

## 1. RESUMEN EJECUTIVO

**Que es:** Un sistema SaaS dual (Admin Panel + Portal de Cliente) para gestionar clientes de una agencia de marketing digital. Incluye: CRM, gestion de proyectos, documentos, pagos, mensajeria, analisis con IA, cuestionario dinamico con cotizacion personalizada por IA, pipeline Kanban de prospectos, integracion WhatsApp, y automatizaciones.

**Stack tecnologico:**
- **Frontend/Backend:** Next.js 14.2 (App Router) + TypeScript + Tailwind CSS
- **Base de datos + Auth + Storage:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI Components:** shadcn/ui (Radix UI + Tailwind)
- **PDF Generation:** jsPDF + jspdf-autotable + JSZip
- **Charts:** Recharts
- **Email:** Resend (transaccional)
- **IA:** Anthropic Claude SDK (@anthropic-ai/sdk)
- **Firmas digitales:** react-signature-canvas
- **Deploy:** Vercel (auto-deploy en push a master)

**Estructura del proyecto:**
```
src/
  app/              → Paginas y API routes (Next.js App Router)
    admin/          → Panel de administracion
      analizador/   → Analizador digital + cuestionario inline
      pipeline/     → Pipeline Kanban de prospectos
    portal/         → Portal del cliente
    cuestionario/   → Pagina publica de cuestionario (sin auth)
    api/            → Endpoints del backend
      cuestionario/ → API publica del cuestionario (token-based)
      ai/           → Endpoints de IA (analyze, content, strategy, pricing)
  components/       → Componentes React
    admin/          → Componentes del admin (sidebar, tabs, charts, etc.)
    portal/         → Componentes del portal (nav, efectos visuales, etc.)
    ui/             → shadcn/ui (button, card, dialog, input, etc.)
  lib/              → Utilidades y helpers
    supabase/       → Clientes de Supabase (server + client)
    ai/             → Integracion con Claude (helper askClaude)
    email/          → Templates y envio de emails
    pdf/            → Generacion de documentos PDF
    analizador/     → Logica del analizador digital + cuestionario + pricing
    theme/          → Provider de tema dark/light
  hooks/            → Custom hooks (media query, realtime notifications)
  middleware.ts     → Auth middleware (protege /admin y /portal)
```

---

## 2. BASE DE DATOS (Supabase PostgreSQL)

### 2.1 Tablas

#### `profiles`
Se crea automaticamente al registrar usuario en Supabase Auth.
```sql
id          uuid PRIMARY KEY (references auth.users)
role        text NOT NULL DEFAULT 'client'  -- 'admin' | 'client'
theme       text DEFAULT 'dark'
created_at  timestamptz DEFAULT now()
```

#### `clients`
Registro principal del cliente. Se vincula a un usuario de auth.
```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id               uuid REFERENCES auth.users ON DELETE CASCADE
name                  text NOT NULL
email                 text NOT NULL
company               text
phone                 text
photo_url             text
cover_url             text
status                text DEFAULT 'active'  -- 'active' | 'paused'
admin_notes           text
welcome_email_sent_at timestamptz
created_at            timestamptz DEFAULT now()
```

#### `documents`
Contratos, notas de venta, documentos de bienvenida.
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
client_id       uuid REFERENCES clients ON DELETE CASCADE
type            text NOT NULL  -- 'contract' | 'welcome' | 'invoice'
title           text NOT NULL
file_url        text
content         jsonb          -- Para invoices: {items, discount, notes}
seen_by_client  boolean DEFAULT false
signed          boolean DEFAULT false
signature_data  text           -- Base64 de la firma
signed_at       timestamptz
created_at      timestamptz DEFAULT now()
```

#### `projects`
Proyectos asignados a clientes.
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
client_id   uuid REFERENCES clients ON DELETE CASCADE
name        text NOT NULL
description text
status      text DEFAULT 'planning'  -- planning|in_progress|review|completed|paused
start_date  date
end_date    date
created_at  timestamptz DEFAULT now()
```

#### `deliverables`
Entregables dentro de un proyecto.
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
project_id  uuid REFERENCES projects ON DELETE CASCADE
name        text NOT NULL
description text
status      text DEFAULT 'pending'  -- pending|in_progress|review|completed
order_index integer DEFAULT 0
created_at  timestamptz DEFAULT now()
```

#### `project_milestones`
Hitos del proyecto (usados en calendario).
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
project_id  uuid REFERENCES projects ON DELETE CASCADE
title       text NOT NULL
due_date    date
completed   boolean DEFAULT false
created_at  timestamptz DEFAULT now()
```

#### `media`
Archivos compartidos (imagenes, PDFs, videos).
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
client_id      uuid REFERENCES clients ON DELETE CASCADE
name           text NOT NULL
file_url       text NOT NULL
file_type      text NOT NULL
file_size      bigint NOT NULL
seen_by_client boolean DEFAULT false
uploaded_by    text  -- 'admin' | 'client'
created_at     timestamptz DEFAULT now()
```

#### `messages`
Chat entre admin y cliente.
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
client_id       uuid REFERENCES clients ON DELETE CASCADE
sender_id       uuid REFERENCES auth.users
sender_role     text NOT NULL  -- 'admin' | 'client'
content         text NOT NULL
attachment_url  text
attachment_name text
read            boolean DEFAULT false
created_at      timestamptz DEFAULT now()
```

#### `payments`
Registro de pagos y cobros.
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
client_id        uuid REFERENCES clients ON DELETE CASCADE
amount           decimal NOT NULL
concept          text NOT NULL
payment_method   text DEFAULT 'transfer'  -- transfer|card|cash|other
status           text DEFAULT 'pending'   -- pending|completed|failed|refunded
reference_number text
notes            text
due_date         date
paid_at          timestamptz
created_at       timestamptz DEFAULT now()
```

#### `referrals`
Referidos enviados por clientes.
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
client_id        uuid REFERENCES clients ON DELETE CASCADE
referred_name    text NOT NULL
referred_email   text
referred_phone   text
referred_company text
notes            text
status           text DEFAULT 'pending'  -- pending|contacted|converted|rejected
created_at       timestamptz DEFAULT now()
```

#### `testimonials`
Resenas/testimonios de clientes.
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
client_id    uuid REFERENCES clients ON DELETE CASCADE
rating       integer NOT NULL  -- 1-5
title        text
content      text NOT NULL
is_approved  boolean DEFAULT false
is_published boolean DEFAULT false
submitted_at timestamptz DEFAULT now()
```

#### `notifications`
Notificaciones del sistema.
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
type        text NOT NULL  -- contract_signed|message_received|referral_submitted|testimonial_submitted|payment_overdue|file_uploaded|cuestionario_completed
title       text NOT NULL
description text
client_id   uuid REFERENCES clients ON DELETE SET NULL
read        boolean DEFAULT false
link        text
created_at  timestamptz DEFAULT now()
```

#### `analisis_digital`
Resultados del analizador de presencia digital.
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
nombre_negocio  text NOT NULL
giro            text NOT NULL
zona            text
contacto        text
telefono        text
hallazgos       jsonb NOT NULL
score           integer NOT NULL
nivel           text NOT NULL  -- CRITICO|BAJO|MEDIO|ALTO
oportunidades   jsonb
cotizacion      jsonb          -- Cotizacion generica automatica
report_url      text
client_id       uuid REFERENCES clients ON DELETE SET NULL
etapa           text DEFAULT 'nuevo'  -- nuevo|cuestionario_enviado|cuestionario_completado|en_negociacion|cerrado_ganado|cerrado_perdido
created_at      timestamptz DEFAULT now()
```

#### `cuestionarios`
Cuestionarios dinamicos para cotizacion personalizada. Vinculados a un analisis digital.
```sql
id                        uuid PRIMARY KEY DEFAULT gen_random_uuid()
analisis_id               uuid NOT NULL REFERENCES analisis_digital(id)
token                     text UNIQUE NOT NULL    -- Token publico para acceso sin auth
status                    text NOT NULL DEFAULT 'pending'  -- pending|completed
respuestas                jsonb                   -- Respuestas del prospecto
cotizacion_personalizada  jsonb                   -- Paquetes generados por IA
created_at                timestamptz DEFAULT now()
completed_at              timestamptz
```
> Sin RLS — acceso solo via service role desde API routes publicas.

#### `ai_strategies`
Estrategias generadas por IA.
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
client_id   uuid REFERENCES clients ON DELETE CASCADE
analisis_id uuid REFERENCES analisis_digital ON DELETE SET NULL
content     text NOT NULL
created_at  timestamptz DEFAULT now()
```

### 2.2 Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Patron general:
- **Admin:** acceso completo (SELECT, INSERT, UPDATE, DELETE) verificando `profiles.role = 'admin'`
- **Client:** solo ve sus propios registros (`client_id = auth.uid()` o `user_id = auth.uid()`)

### 2.3 Storage Buckets

- **`client-files`** — Archivos subidos (documentos, media). Estructura: `{client_id}/docs/` y `{client_id}/media/`
- **`reportes`** — Reportes HTML del analizador digital

### 2.4 Realtime

Habilitado en la tabla `notifications` para push en tiempo real al portal del cliente.

---

## 3. AUTENTICACION Y MIDDLEWARE

### 3.1 Flujo de auth
1. Usuario visita `/portal/login`
2. Ingresa email + password
3. Supabase Auth valida credenciales y devuelve JWT
4. Se verifica el rol en tabla `profiles`
5. Admin → redirect a `/admin`, Client → redirect a `/portal/dashboard`
6. Middleware valida JWT en cada request a rutas protegidas

### 3.2 Middleware (`src/middleware.ts`)
- Aplica a: `/portal/*` y `/admin/*`
- Excluye: `/portal/login` (publica)
- `/admin/*` requiere rol admin
- `/portal/*` requiere usuario autenticado
- Redirige a `/portal/login` si no hay sesion

### 3.3 Helpers de Supabase
- **Server** (`src/lib/supabase/server.ts`): Usa `createServerClient` de `@supabase/ssr` con manejo de cookies. Para Server Components y API routes.
- **Client** (`src/lib/supabase/client.ts`): Usa `createBrowserClient`. Para Client Components ("use client").

---

## 4. PANEL DE ADMINISTRACION

### 4.1 Layout
- Sidebar fijo a la izquierda (64px de ancho)
- Links: Dashboard, Clientes, Documentos, Mensajes, Referidos, Testimonios, Analizador, Pipeline, Reportes
- Boton de cerrar sesion
- Logo de la marca arriba
- Contenido principal con padding izquierdo de 64px

### 4.2 Dashboard (`/admin`)
**Server component** que obtiene datos y los pasa a componentes cliente.

KPIs mostrados:
- Ingreso del mes actual (suma de pagos completados)
- Pagos pendientes (count)
- Contratos sin firmar (count)
- Mensajes sin leer (count)
- Pagos vencidos (count)
- Clientes activos / total

Secciones:
- 4 graficas (Recharts): Ingresos por mes, Clientes por mes, Proyectos por status, Referidos
- Card de pagos vencidos (muestra dias de atraso)
- Card de pagos proximos (proximos 7 dias)
- Activity feed (ultimas acciones)
- Ultimos 5 clientes creados

### 4.3 Clientes (`/admin/clients`)
- Lista con avatar, nombre, empresa, email, fecha de creacion
- Filtro por status (activo/pausado/todos)
- Boton exportar CSV
- Boton crear nuevo cliente
- Click en cliente lleva a detalle

### 4.4 Crear Cliente (`/admin/clients/new`)
Formulario con onboarding automatizado:
- Campos: nombre, email, empresa, telefono, password temporal
- Checkboxes de onboarding:
  - Auto-crear contrato
  - Auto-crear nota de venta (con monto y concepto)
  - Auto-crear proyecto (con nombre)
- Al guardar:
  1. Crea usuario en Supabase Auth (con service role key)
  2. Crea registro en tabla `clients`
  3. Crea profile con role 'client'
  4. Auto-genera documentos/proyectos segun checkboxes
  5. Envia email de bienvenida con credenciales temporales
  6. Redirige al detalle del cliente

### 4.5 Detalle del Cliente (`/admin/clients/[id]`)
**Server component** que carga: client, documents, projects+deliverables, media, payments, analyses.

Secciones superiores:
- Nombre + badge de status (editable)
- Empresa + email
- Boton eliminar cliente
- Card de onboarding checklist (email enviado, contrato, nota de venta, bienvenida, proyecto)
- Card de notas del admin (textarea editable, se guarda en `admin_notes`)

Tabs (componente `client-detail-tabs.tsx`):
1. **Info** — Editar nombre, empresa, telefono. Boton reenviar email de bienvenida.
2. **Documentos** — Lista de docs, subir nuevo, editor de nota de venta (items + descuento + notas).
3. **Proyectos** — CRUD de proyectos + entregables. Templates de proyecto. Duplicar proyecto. Cambiar status.
4. **Archivos** — Subir y ver archivos compartidos con el cliente.
5. **Pagos** — Registrar pagos (monto, concepto, metodo, status, referencia, fecha vencimiento, notas).
6. **Actividad** — Timeline de actividad del cliente.
7. **Analisis** — Analisis digitales vinculados. Link para crear nuevo analisis.
8. **IA** — Generador de contenido para redes + Estrategia IA (playbook 30 dias).

### 4.6 Documentos (`/admin/documents`)
Generador de PDFs con jsPDF:
- 4 tipos: Bienvenida, Contrato, Propuesta, Cotizacion
- Selector de cliente (auto-llena datos)
- Campos editables: nombre, empresa, telefono, email, giro, zona, fecha inicio
- Genera PDFs y descarga como ZIP
- Guarda docs en tabla media

### 4.7 Mensajes (`/admin/messages`)
Centro de mensajeria:
- Lista de clientes con ultimo mensaje y count de no leidos
- Al seleccionar cliente, abre hilo de chat
- Envio de texto + archivos adjuntos
- Marca mensajes como leidos

### 4.8 Referidos (`/admin/referrals`)
- Lista de referidos con datos del referidor
- Status updater inline: pendiente → contactado → convertido → rechazado

### 4.9 Testimonios (`/admin/testimonials`)
- Lista con rating de 5 estrellas
- Botones para aprobar/publicar/rechazar
- Muestra cliente y empresa

### 4.10 Reportes (`/admin/reports`)
Dashboard de metricas:
- Ingresos: este mes, mes pasado, total, % crecimiento
- Pagos pendientes: count y monto
- Clientes: total, activos, pausados
- Referidos: total, convertidos, tasa de conversion
- Testimonios: total, aprobados, rating promedio
- Proyectos: activos, completados
- Tiempo de respuesta: promedio minutos entre mensaje de cliente y respuesta admin
- Grafica de ingresos 12 meses

### 4.11 Analizador Digital (`/admin/analizador`)
Herramienta para analizar la presencia digital de prospectos:
- Form de datos: nombre, giro (dropdown con ~23 opciones), zona, contacto, telefono
- Boton "Llenar con IA" — llama a Claude para estimar hallazgos
- 6 secciones colapsables con toggles y inputs:
  - Google Maps (25 pts): perfil, resenas, rating, fotos, horarios, etc.
  - Google Search (10 pts): aparece en busqueda, posicion, SEO
  - Instagram (25 pts): cuenta, seguidores, posts, highlights, reels, calidad
  - Facebook (15 pts): pagina, actividad, resenas, likes, messenger
  - Sitio Web (15 pts): tiene sitio, responsive, WhatsApp, booking, SSL
  - Publicidad (10 pts): Meta Ads, Google Ads
- Genera score 0-100, nivel (CRITICO/BAJO/MEDIO/ALTO), oportunidades
- Genera cotizacion automatica basada en oportunidades detectadas
- Genera reporte HTML y lo sube a Supabase Storage
- Historial de analisis previos con badge de etapa (pipeline status)
- Se puede vincular a un cliente existente

**Cuestionario y cotizacion personalizada:**
- Al generar analisis, se crea automaticamente un token de cuestionario
- Boton "Enviar por WhatsApp" — abre wa.me con mensaje pre-armado incluyendo nombre del negocio, contacto y link al cuestionario
- Boton "Copiar link" — copia URL del cuestionario al clipboard
- Boton "Llenar aqui" — abre cuestionario inline (paso a paso) dentro del admin
- Si el prospecto completa el cuestionario, la IA genera una cotizacion personalizada con paquetes estrategicos
- Boton "Copiar cotizacion" — formatea la cotizacion personalizada como texto para pegar en WhatsApp/email

### 4.12 Pipeline de Prospectos (`/admin/pipeline`)
Tablero Kanban para gestionar el embudo de ventas de prospectos analizados:
- 6 columnas: Nuevos → Cuestionario enviado → Cotizacion lista → En negociacion → Ganados → Perdidos
- Drag-and-drop nativo (HTML5) para mover prospectos entre columnas
- Actualizacion optimista — la UI se actualiza inmediatamente y revierte si falla
- Fila de estadisticas con conteo por columna
- Cada tarjeta muestra: nombre del negocio, score, giro, zona, fecha
- Acciones rapidas por tarjeta: enviar cuestionario por WhatsApp, copiar link de reporte, ver reporte
- Scroll horizontal para las columnas
- Sin dependencias externas de drag-and-drop (usa API nativa del navegador)

### 4.13 Busqueda Rapida (Command Search)
Componente `command-search.tsx` — paleta de comandos tipo Cmd+K para buscar clientes y navegar rapido.

---

## 5. PORTAL DEL CLIENTE

### 5.1 Layout
- Navbar superior con: logo, links de navegacion, notificaciones en tiempo real, menu de usuario
- Efectos visuales (solo desktop): animated background, cursor glow, dot grid, tilt cards
- Hook `useDesktop()` para activar/desactivar efectos segun viewport
- Theme toggle (dark/light)

### 5.2 Login (`/portal/login`)
- Email + password
- Validacion contra Supabase Auth
- Redirect segun rol (admin/client)
- Diseno con branding de la marca

### 5.3 Dashboard (`/portal/dashboard`)
- Saludo personalizado con nombre del cliente
- Quick links en grid: Contratos, Facturas, Propuestas, Proyectos, Archivos, Referidos, Soporte
- Badge counts en cada link (proyectos activos, archivos nuevos, mensajes sin leer)

### 5.4 Proyectos (`/portal/projects`)
- Lista de proyectos con status badge y barra de progreso
- Porcentaje basado en deliverables completados
- Click lleva a detalle del proyecto

### 5.5 Detalle Proyecto (`/portal/projects/[id]`)
- Info del proyecto
- Lista de entregables con status
- Workflow de aprobacion: el cliente puede aprobar entregables en status "review"

### 5.6 Archivos (`/portal/files`)
- Grid de archivos compartidos
- Preview de imagenes (thumbnails)
- Descarga directa
- Subida de archivos por el cliente
- Marca como visto automaticamente

### 5.7 Soporte/Chat (`/portal/support`)
- Hilo de mensajes con el admin
- Envio de texto + archivos adjuntos
- Auto-scroll al ultimo mensaje
- Marca mensajes del admin como leidos

### 5.8 Contrato (`/portal/contract`)
- Visualizacion del contrato
- Firma digital con canvas (react-signature-canvas)
- Guarda firma como base64 en `signature_data`
- Actualiza `signed = true` y `signed_at`

### 5.9 Bienvenida (`/portal/welcome`)
- Muestra documento de bienvenida

### 5.10 Factura/Nota de Venta (`/portal/invoice`)
- Visualizacion de la nota de venta
- Boton para descargar PDF (invoice-pdf-button.tsx)

### 5.11 Pagos (`/portal/payments`)
- Historial de pagos del cliente
- Status de cada pago, fecha de vencimiento

### 5.12 Calendario (`/portal/calendar`)
- Vista de calendario con hitos del proyecto y fechas importantes

### 5.13 Referidos (`/portal/referrals`)
- Formulario para enviar referidos (nombre, email, telefono, empresa, notas)
- Historial de referidos enviados con status

### 5.14 Testimonial (`/portal/testimonial`)
- Formulario de resena: rating 1-5 estrellas, titulo, contenido
- Envio y confirmacion

### 5.15 Settings (`/portal/settings`)
- Toggle de tema (dark/light)
- Edicion de perfil

---

## 5B. PAGINA PUBLICA: CUESTIONARIO (`/cuestionario/[token]`)

Pagina publica (sin autenticacion) para que el prospecto conteste un cuestionario dinamico:
- **Multi-step typeform-style** — una pregunta por pantalla, avance automatico al seleccionar
- **Diseno oscuro** consistente con el reporte (paleta: #05060A, #00E5A0)
- **Progress bar** en la parte superior
- **Mobile-first** — optimizado para que el prospecto conteste desde su celular
- **Tipos de pregunta**: opcion multiple, si/no, numero
- Al completar: muestra link al reporte actualizado con cotizacion personalizada
- Si ya fue completado: muestra estado completado con link al reporte

**Motor de preguntas dinamicas** (`src/lib/analizador/cuestionario.ts`):
- 5 preguntas base (todos los giros): facturacion mensual, inversion en marketing, objetivo principal, plazo de resultados, tiene equipo de marketing
- Preguntas por giro (~15 giros soportados): Restaurante, Cafeteria, Salon de Belleza, Barberia, Consultorio, Tienda, Gimnasio, Spa, Veterinaria, Inmobiliaria, etc.
- Preguntas condicionales basadas en oportunidades detectadas (ej: si no tiene sitio web, pregunta si necesita citas online)
- Funcion `generarPreguntas(giro, oportunidades)` genera el set completo
- Funcion `filtrarPreguntasVisibles(preguntas, respuestas)` filtra por dependencias

---

## 6. API ROUTES (Backend)

### Admin
| Ruta | Metodo | Funcion |
|------|--------|---------|
| `/api/admin/create-client` | POST | Crea usuario + cliente + onboarding automatizado |
| `/api/admin/resend-welcome` | POST | Reenvia email de bienvenida |
| `/api/admin/notifications` | GET | Obtiene notificaciones del admin |
| `/api/admin/payments` | POST | Gestiona pagos |
| `/api/admin/analisis` | POST/GET/PATCH | Genera/lista analisis digitales + actualiza etapa (pipeline) |

### IA
| Ruta | Metodo | Funcion |
|------|--------|---------|
| `/api/ai/analyze` | POST | Estima hallazgos de presencia digital con Claude |
| `/api/ai/content` | POST | Genera ideas de contenido para redes sociales |
| `/api/ai/strategy` | POST | Genera playbook de 30 dias personalizado |
| `/api/ai/pricing-personalizado` | POST | Genera cotizacion personalizada con IA basada en respuestas del cuestionario |

### Cuestionario (publico, sin auth)
| Ruta | Metodo | Funcion |
|------|--------|---------|
| `/api/cuestionario/[token]` | GET | Retorna preguntas + datos del negocio para un token valido |
| `/api/cuestionario/[token]` | POST | Recibe respuestas, genera cotizacion IA, actualiza reporte HTML, envia notificacion |

### Portal
| Ruta | Metodo | Funcion |
|------|--------|---------|
| `/api/portal/sign-contract` | POST | Guarda firma digital del contrato |
| `/api/portal/notify` | POST | Envia notificacion |
| `/api/portal/deliverables/[id]/approve` | POST | Cliente aprueba entregable |
| `/api/testimonials` | POST | Envia testimonio |

### Cron
| Ruta | Schedule | Funcion |
|------|----------|---------|
| `/api/cron/payment-reminders` | Diario 14:00 UTC | Envia recordatorios de pago por email |

Patron de autenticacion en TODAS las API routes:
```typescript
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
// Para admin: verificar profile.role === 'admin'
```

---

## 7. EMAILS (Resend)

3 tipos de email configurados:
1. **Bienvenida** (`send-welcome.ts`): Saludo + credenciales temporales + link al portal
2. **Recordatorio de pago** (`send-payment-reminder.ts`): Concepto, monto, fecha vencimiento, si esta vencido o proximo
3. **Notificacion al admin** (`notify-admin.ts`): Eventos importantes

Configuracion:
- Proveedor: Resend
- Remitente: `hola@[tudominio]`
- Emails HTML con branding

---

## 8. GENERACION DE PDFs

4 tipos de documento (`src/lib/pdf/`):
1. **Bienvenida** — Documento de bienvenida personalizado
2. **Contrato** — Contrato de servicios
3. **Propuesta** — Propuesta comercial
4. **Cotizacion** — Cotizacion de servicios

Se generan con jsPDF, se pueden descargar individuales o en ZIP (JSZip).
Todos en espanol con branding de la marca.

---

## 9. INTEGRACION CON IA

### Helper compartido (`src/lib/ai/claude.ts`)
```typescript
// Inicializa cliente Anthropic (singleton)
// Funcion askClaude(systemPrompt, userMessage, options?)
// Usa modelo: claude-sonnet-4-5-20250929
// Requiere: ANTHROPIC_API_KEY
```

### Feature 1: Auto-fill del Analizador
- Endpoint: `/api/ai/analyze`
- Input: nombre, giro, zona del negocio
- Claude estima la presencia digital completa
- Admin revisa y ajusta antes de generar reporte

### Feature 2: Generador de Contenido
- Endpoint: `/api/ai/content`
- Input: datos del cliente + analisis
- Output: 5 ideas de posts con formato, copy, hashtags
- Componente: `ai-content-generator.tsx`

### Feature 3: Estrategia IA (Playbook)
- Endpoint: `/api/ai/strategy`
- Input: hallazgos + oportunidades + datos del negocio
- Output: Plan de 30 dias semana por semana con KPIs
- Se guarda en tabla `ai_strategies`
- Componente: `ai-strategy-card.tsx`

### Feature 4: Cotizacion Personalizada con IA
- Se activa cuando un prospecto completa el cuestionario dinamico
- Input: oportunidades detectadas + respuestas del cuestionario + giro + zona
- Funcion `buildPersonalizedPricingContext()` en `src/lib/analizador/pricing.ts` arma el contexto
- Claude genera 2-3 paquetes estrategicos con:
  - Nombres creativos relevantes al giro (no genericos como "Starter/Premium")
  - Precios ajustados por facturacion, inversion actual, urgencia
  - Servicios priorizados segun objetivo del prospecto
  - ROI estimado realista por paquete
  - Nivel de prioridad (inmediata, corto plazo, mediano plazo)
- Se guarda en tabla `cuestionarios.cotizacion_personalizada`
- Se muestra en el reporte HTML (reemplaza la cotizacion generica)
- El admin puede copiar la cotizacion como texto formateado

### Feature 5: Cotizacion Automatica (generica)
- Se genera automaticamente al crear un analisis
- Funcion `generarCotizacion()` en `src/lib/analizador/pricing.ts`
- Basada en oportunidades detectadas con precios fijos por servicio
- Sirve como cotizacion inicial antes de que el prospecto conteste el cuestionario
- Se incluye en el reporte HTML

---

## 10. DISENO Y TEMA

### Colores (Tailwind custom)
```
northpeak-bg:         #05060A   (fondo principal)
northpeak-card:       #0C0D12   (cards)
northpeak-card-hover: #12131A   (hover de cards)
northpeak-surface:    #161821   (bordes, inputs)
northpeak-text:       #E8E9ED   (texto principal)
northpeak-text-muted: #7A7D8A   (texto secundario)
northpeak-text-dim:   #4A4D5A   (texto terciario)
northpeak-green:      #00E5A0   (accent/CTA principal)
northpeak-blue:       #3B82F6   (accent secundario)
```

### Fuentes
- Sans: DM Sans (texto general)
- Heading: Syne (titulos)
- Mono: JetBrains Mono (codigo)

### Componentes shadcn/ui instalados
avatar, badge, button, card, dialog, input, label, select, separator, tabs, textarea, toast

### Efectos visuales del portal (desktop only)
- `animated-background.tsx` — Gradientes animados de fondo
- `cursor-glow.tsx` — Resplandor que sigue al cursor
- `dot-grid.tsx` — Grid de puntos de fondo
- `tilt-card.tsx` — Efecto 3D en hover de cards

---

## 11. VARIABLES DE ENTORNO

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Email
RESEND_API_KEY=re_xxx

# IA
ANTHROPIC_API_KEY=sk-ant-xxx

# Cron (Vercel)
CRON_SECRET=xxx  (opcional, para proteger cron endpoint)

# Sitio
NEXT_PUBLIC_SITE_URL=https://tudominio.com  (opcional, para links en emails)
```

---

## 12. DEPLOY Y CONFIGURACION

### Vercel
1. Conectar repo de GitHub
2. Branch de produccion: `master`
3. Framework: Next.js (auto-detectado)
4. Agregar TODAS las variables de entorno
5. Deploy automatico en cada push

### Vercel Cron (`vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/cron/payment-reminders",
      "schedule": "0 14 * * *"
    }
  ]
}
```

### Supabase
1. Crear proyecto en supabase.com
2. Ejecutar todos los CREATE TABLE (seccion 2.1)
3. Habilitar RLS en TODAS las tablas
4. Crear policies de RLS (admin full access, client solo sus datos)
5. Crear buckets de storage: `client-files` y `reportes`
6. Habilitar Realtime en tabla `notifications`
7. Copiar URL + anon key + service role key

---

## 13. PASO A PASO PARA REPLICAR

### Fase 1: Setup Inicial
1. Crear proyecto Next.js 14 con App Router + TypeScript + Tailwind
2. Instalar dependencias: `@supabase/ssr`, `@supabase/supabase-js`, shadcn/ui
3. Configurar Tailwind con colores custom de tu marca
4. Configurar fuentes
5. Crear estructura de carpetas (app/admin, app/portal, components/admin, etc.)
6. Setup de Supabase: proyecto + tablas + RLS + storage
7. Configurar middleware de auth

### Fase 2: Auth y Layout
1. Pagina de login (`/portal/login`)
2. Middleware que protege rutas
3. Layout admin con sidebar
4. Layout portal con navbar + efectos visuales
5. Theme provider (dark/light)

### Fase 3: CRUD Basico
1. Dashboard admin con KPIs
2. CRUD de clientes (lista, crear, detalle)
3. Sistema de documentos (subir, listar, eliminar)
4. Sistema de proyectos + entregables
5. Sistema de archivos/media
6. Sistema de pagos

### Fase 4: Comunicacion
1. Sistema de mensajeria (chat admin-cliente)
2. Emails transaccionales (bienvenida, recordatorios)
3. Notificaciones en tiempo real (Supabase Realtime)
4. Referidos
5. Testimonios

### Fase 5: Automatizaciones
1. Onboarding automatizado (crear cliente + docs + proyecto en 1 click)
2. Cron de recordatorios de pago
3. Generacion de PDFs (contratos, propuestas, cotizaciones)

### Fase 6: IA
1. Helper de Claude (`src/lib/ai/claude.ts`)
2. Analizador con auto-fill IA
3. Generador de contenido
4. Estrategia IA (playbook)
5. Cotizacion automatica (generica basada en oportunidades)
6. Cotizacion personalizada con IA (basada en cuestionario)

### Fase 7: Cuestionario y Pipeline
1. Tabla `cuestionarios` en Supabase
2. Motor de preguntas dinamicas (`src/lib/analizador/cuestionario.ts`)
3. Pagina publica del cuestionario (`/cuestionario/[token]`) — multi-step, mobile-first
4. API publica del cuestionario (`/api/cuestionario/[token]`) — GET preguntas, POST respuestas
5. Generacion de cotizacion personalizada con IA al completar cuestionario
6. Regeneracion del reporte HTML con cotizacion personalizada
7. Notificacion al admin cuando se completa el cuestionario
8. Integracion WhatsApp: envio de cuestionario con mensaje pre-armado
9. Pipeline Kanban (`/admin/pipeline`) con drag-and-drop nativo
10. Campo `etapa` en `analisis_digital` para rastrear el embudo de ventas

### Fase 8: Reportes y Metricas
1. Dashboard de reportes con graficas
2. Export CSV de clientes
3. Metricas de negocio (ingresos, conversion, tiempo de respuesta)

---

## 14. ADAPTACIONES PARA AGENCIA INMOBILIARIA

Al replicar, considera cambiar:

### Terminologia
- "Cliente" → "Cliente" o "Comprador/Vendedor"
- "Proyecto" → "Propiedad" o "Operacion"
- "Entregable" → "Documento legal" / "Tramite"
- "Analisis digital" → "Valuacion" o "Analisis de mercado"
- "Contenido para redes" → "Listing descriptions" / "Copy de propiedades"

### Tablas adicionales sugeridas
- `properties` — Propiedades en cartera (direccion, precio, fotos, status, tipo)
- `showings` — Citas de visita a propiedades
- `offers` — Ofertas recibidas por propiedad
- `commissions` — Control de comisiones

### Features especificas inmobiliarias
- Catalogo de propiedades con filtros (zona, precio, tipo, recamaras)
- Galeria de fotos por propiedad
- Calendario de visitas/showings
- Calculadora de hipoteca
- **Pipeline Kanban ya existe** — solo cambiar etapas: Prospecto → Visita → Oferta → Negociacion → Cierre → Perdido
- **Cuestionario dinamico ya existe** — adaptar preguntas: presupuesto, tipo de propiedad, zona deseada, financiamiento, urgencia
- Generador de listings con IA
- Analisis comparativo de mercado con IA
- Portal del comprador con documentos, avance de tramites, timeline
- **WhatsApp integration ya existe** — adaptar mensajes para envio de cuestionario/propiedades

### Branding
- Cambiar colores de northpeak-* a los de tu agencia
- Cambiar fuentes
- Cambiar logo y favicon
- Cambiar textos y copy a terminologia inmobiliaria
- Cambiar remitente de emails

---

## 15. DEPENDENCIAS COMPLETAS (package.json)

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.74.0",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-tabs": "^1.1.12",
    "@supabase/ssr": "^0.6.1",
    "@supabase/supabase-js": "^2.49.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "jspdf": "^3.0.1",
    "jspdf-autotable": "^5.0.2",
    "jszip": "^3.10.1",
    "lucide-react": "^0.479.0",
    "next": "14.2.35",
    "react": "^18",
    "react-dom": "^18",
    "react-signature-canvas": "^1.0.7",
    "recharts": "^2.15.3",
    "resend": "^4.5.2",
    "tailwind-merge": "^3.0.2",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/react-signature-canvas": "^1.0.7",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.35",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

---

---

## 16. FLUJO COMPLETO DEL ANALIZADOR + CUESTIONARIO + PIPELINE

```
1. Admin abre /admin/analizador
2. Llena datos del negocio (o usa "Llenar con IA")
3. Ajusta hallazgos manualmente → genera analisis
4. Sistema crea: score, oportunidades, cotizacion generica, reporte HTML, token de cuestionario
5. Admin envia cuestionario por WhatsApp (boton directo) o copia link
   → Prospecto aparece en Pipeline columna "Nuevos"

6. Prospecto abre /cuestionario/{token} en su celular
7. Contesta 8-12 preguntas dinamicas segun su giro
8. IA genera cotizacion personalizada (paquetes estrategicos + precios ajustados + ROI)
9. Reporte HTML se regenera con la cotizacion personalizada
   → Prospecto se mueve automaticamente a "Cotizacion lista"
   → Admin recibe notificacion

10. Admin revisa cotizacion personalizada en el panel
11. Admin mueve prospecto en Pipeline: En negociacion → Ganado/Perdido
12. Si gana → puede crear cliente desde el analisis y continuar con el CRM completo
```

> **Nota:** Este documento cubre el 100% de lo construido hasta febrero 2026. Envialo a Claude junto con la instruccion de replicar para tu agencia inmobiliaria, y tendra todo el contexto necesario para construirlo desde cero o adaptarlo.

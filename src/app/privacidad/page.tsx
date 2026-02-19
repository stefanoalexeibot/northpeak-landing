import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Aviso de Privacidad | NorthPeak Digital",
  description:
    "Aviso de privacidad de NorthPeak Digital conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).",
};

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-northpeak-bg text-northpeak-text">
      {/* Nav back */}
      <div className="border-b border-northpeak-surface">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-northpeak-text-muted hover:text-northpeak-green transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.15em] text-northpeak-green uppercase mb-3">
            Legal
          </p>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-northpeak-text leading-tight tracking-tight mb-4">
            Aviso de Privacidad
          </h1>
          <p className="text-northpeak-text-muted text-sm">
            Última actualización: febrero de 2026
          </p>
        </div>

        <div className="space-y-10 text-northpeak-text-muted leading-relaxed">

          {/* Responsable */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-northpeak-text">
              1. Identidad y domicilio del Responsable
            </h2>
            <p>
              <strong className="text-northpeak-text">NorthPeak Digital</strong> (en adelante
              &ldquo;NorthPeak&rdquo;), con domicilio en Monterrey, Nuevo León, México, es el
              responsable del tratamiento de sus datos personales conforme a lo establecido en la{" "}
              <em>
                Ley Federal de Protección de Datos Personales en Posesión de los Particulares
              </em>{" "}
              (LFPDPPP) y su Reglamento.
            </p>
            <p>
              Para ejercer cualquier derecho relacionado con sus datos personales puede
              contactarnos a través de:{" "}
              <a
                href="mailto:hola@northpeak.mx"
                className="text-northpeak-green hover:underline"
              >
                hola@northpeak.mx
              </a>
            </p>
          </section>

          {/* Datos recabados */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-northpeak-text">
              2. Datos personales recabados
            </h2>
            <p>
              NorthPeak puede recabar las siguientes categorías de datos personales:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Datos de identificación: nombre, apellidos, empresa.</li>
              <li>Datos de contacto: correo electrónico, número de teléfono/WhatsApp.</li>
              <li>Datos comerciales: giro del negocio, presupuesto estimado, objetivos de marketing.</li>
              <li>Datos de navegación: dirección IP, páginas visitadas, tiempo de sesión (vía cookies analíticas).</li>
            </ul>
            <p>
              No recabamos datos personales sensibles en el sentido de la LFPDPPP (salud, ideología
              política, religión, etc.).
            </p>
          </section>

          {/* Finalidades */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-northpeak-text">
              3. Finalidades del tratamiento
            </h2>
            <p>
              <strong className="text-northpeak-text">Finalidades primarias</strong> (necesarias
              para la relación comercial):
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Brindar los servicios de marketing digital contratados.</li>
              <li>Gestionar el portal de cliente, entregables y comunicación del proyecto.</li>
              <li>Emitir cotizaciones, propuestas comerciales y facturas.</li>
              <li>Dar seguimiento a solicitudes de información o soporte.</li>
            </ul>
            <p className="mt-2">
              <strong className="text-northpeak-text">Finalidades secundarias</strong> (puede
              oponerse en cualquier momento):
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Envío de contenido educativo, casos de éxito y actualizaciones del sector.</li>
              <li>Invitaciones a webinars o eventos organizados por NorthPeak.</li>
            </ul>
          </section>

          {/* Transferencias */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-northpeak-text">
              4. Transferencia de datos
            </h2>
            <p>
              NorthPeak no comercializa ni vende sus datos personales a terceros. Únicamente los
              comparte con proveedores de tecnología que apoyan la operación del servicio
              (infraestructura en nube, herramientas de comunicación), bajo estrictos acuerdos de
              confidencialidad y en cumplimiento de la LFPDPPP.
            </p>
            <p>
              Dichos encargados están obligados a tratar sus datos exclusivamente conforme a las
              instrucciones de NorthPeak y a no revelarlos a terceros.
            </p>
          </section>

          {/* Derechos ARCO */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-northpeak-text">
              5. Derechos ARCO
            </h2>
            <p>
              Usted tiene derecho a <strong className="text-northpeak-text">Acceder</strong>,{" "}
              <strong className="text-northpeak-text">Rectificar</strong>,{" "}
              <strong className="text-northpeak-text">Cancelar</strong> u{" "}
              <strong className="text-northpeak-text">Oponerse</strong> al tratamiento de sus
              datos personales (derechos ARCO), así como a revocar el consentimiento otorgado.
            </p>
            <p>
              Para ejercer estos derechos envíe una solicitud a{" "}
              <a
                href="mailto:hola@northpeak.mx"
                className="text-northpeak-green hover:underline"
              >
                hola@northpeak.mx
              </a>{" "}
              indicando:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Su nombre completo y datos de contacto.</li>
              <li>La descripción clara del derecho que desea ejercer.</li>
              <li>Copia de identificación oficial vigente.</li>
            </ul>
            <p>
              Daremos respuesta en un plazo máximo de 20 días hábiles conforme a la LFPDPPP.
            </p>
          </section>

          {/* Cookies */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-northpeak-text">
              6. Uso de cookies y tecnologías similares
            </h2>
            <p>
              Nuestro sitio utiliza cookies propias y de terceros con fines analíticos para
              mejorar la experiencia de navegación. Puede deshabilitar las cookies en la
              configuración de su navegador; sin embargo, esto puede afectar la funcionalidad
              del sitio.
            </p>
          </section>

          {/* Cambios */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-northpeak-text">
              7. Cambios al aviso de privacidad
            </h2>
            <p>
              NorthPeak se reserva el derecho de actualizar este aviso en cualquier momento. Los
              cambios serán notificados mediante publicación en esta página con la fecha de la
              última modificación. Le recomendamos revisarlo periódicamente.
            </p>
          </section>

          {/* Contacto */}
          <section className="rounded-xl border border-northpeak-surface bg-northpeak-card p-6 space-y-2">
            <p className="font-semibold text-northpeak-text">¿Tienes preguntas sobre tu privacidad?</p>
            <p className="text-sm">
              Escríbenos a{" "}
              <a
                href="mailto:hola@northpeak.mx"
                className="text-northpeak-green hover:underline font-medium"
              >
                hola@northpeak.mx
              </a>{" "}
              y te responderemos a la brevedad.
            </p>
          </section>

        </div>
      </div>

      {/* Footer minimal */}
      <footer className="border-t border-northpeak-surface mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between gap-4 text-xs text-northpeak-text-dim">
          <span>© 2026 NorthPeak Digital</span>
          <Link href="/" className="hover:text-northpeak-green transition-colors">
            northpeak.mx
          </Link>
        </div>
      </footer>
    </main>
  );
}

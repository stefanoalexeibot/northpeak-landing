import Link from "next/link";
import { ArrowRight, Zap, MessageSquare } from "lucide-react";

export default function FinalCtaSection() {
    return (
        <section className="relative py-32 px-5 sm:px-8 border-t border-northpeak-surface overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-[700px] rounded-full bg-northpeak-green/10 blur-[80px]" />
                <div className="absolute inset-0 border-t border-northpeak-green/5" />
            </div>

            <div className="relative max-w-3xl mx-auto text-center">
                <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-6">— Empieza hoy</p>
                <h2 className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl text-northpeak-text tracking-tight leading-tight mb-6">
                    ¿Listo para <span className="text-northpeak-green">automatizar?</span>
                </h2>
                <p className="text-xl text-northpeak-text-muted mb-10 max-w-xl mx-auto leading-relaxed">
                    Diagnóstico gratuito en 5 minutos. Analizamos tu proceso de ventas actual y te decimos exactamente dónde la IA puede multiplicar tus resultados.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/analizar"
                        className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl bg-northpeak-green text-northpeak-bg text-lg font-bold hover:bg-northpeak-green/90 transition-all hover:scale-[1.02] shadow-[0_12px_40px_rgba(0,229,160,0.3)]"
                    >
                        <Zap className="h-5 w-5" />
                        Analizar mi negocio gratis
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <a
                        href="https://wa.me/528121980008"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-northpeak-surface text-northpeak-text-muted font-medium text-base hover:border-northpeak-green/30 hover:text-northpeak-text transition-all"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Hablar por WhatsApp
                    </a>
                </div>
            </div>
        </section>
    );
}

import Link from "next/link";
import { MapPin, Phone, Mail, Zap } from "lucide-react";
import { footerNavLinks } from "@/lib/data/landing-data";

export default function FooterSection() {
    return (
        <>
            <footer className="border-t border-northpeak-surface bg-northpeak-card py-14 px-5 sm:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
                        {/* Brand */}
                        <div className="space-y-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.png" alt="NorthPeak Digital" className="h-10" />
                            <p className="text-sm text-northpeak-text-muted leading-relaxed max-w-xs">
                                Infraestructura de IA para incrementar ventas. Negocios en Monterrey que venden en piloto automático.
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-northpeak-text-dim font-mono">
                                <MapPin className="h-3 w-3" />
                                Monterrey, Nuevo León — México
                            </div>
                        </div>

                        {/* Links */}
                        <div>
                            <p className="font-mono text-[10px] tracking-[0.15em] text-northpeak-text-dim uppercase mb-4">Navegación</p>
                            <div className="space-y-2.5">
                                {footerNavLinks.map((l) => (
                                    <a key={l.label} href={l.href} className="block text-sm text-northpeak-text-muted hover:text-northpeak-text transition-colors">
                                        {l.label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <p className="font-mono text-[10px] tracking-[0.15em] text-northpeak-text-dim uppercase mb-4">Contacto</p>
                            <div className="space-y-3">
                                <a href="https://wa.me/528121980008" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-sm text-northpeak-text-muted hover:text-northpeak-green transition-colors">
                                    <Phone className="h-4 w-4" />
                                    WhatsApp
                                </a>
                                <a href="mailto:hola@northpeak.mx" className="flex items-center gap-2.5 text-sm text-northpeak-text-muted hover:text-northpeak-green transition-colors">
                                    <Mail className="h-4 w-4" />
                                    hola@northpeak.mx
                                </a>
                                <div className="pt-2">
                                    <Link
                                        href="/analizar"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-colors"
                                    >
                                        <Zap className="h-3.5 w-3.5" />
                                        Diagnóstico gratis
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-northpeak-surface flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-northpeak-text-dim">
                            © {new Date().getFullYear()} NorthPeak Digital. Todos los derechos reservados.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-northpeak-text-dim">
                            <Link href="/privacidad" className="hover:text-northpeak-text-muted transition-colors">
                                Aviso de Privacidad
                            </Link>
                            <span className="font-mono">MTY · NL · MX</span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

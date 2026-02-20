import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import FadeIn from "@/components/landing/fade-in";
import TiltCard from "@/components/portal/tilt-card";
import { services } from "@/lib/data/landing-data";

export default function ServicesSection() {
    return (
        <section id="servicios" className="py-24 px-5 sm:px-8 border-t border-northpeak-surface">
            <div className="max-w-6xl mx-auto">
                <FadeIn className="mb-14">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Soluciones y precios</p>
                    <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text mb-3 tracking-tight">
                        Sin letras chiquitas.
                    </h2>
                    <p className="text-northpeak-text-muted max-w-lg">
                        Mostramos rangos reales para que sepas qué esperar antes de hablar con nosotros.
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {services.map((svc) => (
                        <TiltCard key={svc.num} intensity={8} className={`rounded-2xl border ${svc.border} bg-northpeak-card flex flex-col gap-5 p-5 ${svc.featured ? "ring-1 ring-northpeak-green/30 bg-northpeak-green/5" : ""}`}>
                            {svc.featured && (
                                <div className="absolute -top-3 left-4">
                                    <span className="font-mono text-[10px] font-bold tracking-wider px-3 py-1 rounded-full bg-northpeak-green text-northpeak-bg">
                                        MÁS POPULAR
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start justify-between">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${svc.bg}`}>
                                    <svc.Icon className={`h-5 w-5 ${svc.color}`} />
                                </div>
                                <span className={`font-mono text-xs font-bold tracking-widest ${svc.color} opacity-60`}>{svc.num}</span>
                            </div>

                            <div>
                                <h3 className="font-heading font-bold text-lg text-northpeak-text leading-snug mb-1">{svc.name}</h3>
                                <p className={`font-mono font-bold text-xl ${svc.color}`}>
                                    {svc.price}<span className="text-northpeak-text-dim text-sm font-normal">{svc.period}</span>
                                </p>
                            </div>

                            <p className="text-sm text-northpeak-text-muted leading-relaxed">{svc.description}</p>

                            <ul className="space-y-1.5 flex-1">
                                {svc.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-northpeak-text-muted">
                                        <Check className={`h-3.5 w-3.5 shrink-0 ${svc.color}`} />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/analizar"
                                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${svc.featured
                                        ? "bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
                                        : "border border-northpeak-surface text-northpeak-text-muted hover:border-northpeak-green/30 hover:text-northpeak-text"
                                    }`}
                            >
                                Empezar
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </TiltCard>
                    ))}
                </div>
            </div>
        </section>
    );
}

import Link from "next/link";
import { ArrowRight, Check, Zap, Sparkles, Timer } from "lucide-react";
import FadeIn from "@/components/landing/fade-in";
import TiltCard from "@/components/portal/tilt-card";
import { oneTimeServices, superOffer } from "@/lib/data/landing-data";

export default function OneTimeServicesSection() {
    return (
        <section id="pago-unico" className="py-24 px-5 sm:px-8 border-t border-northpeak-surface bg-northpeak-card/40">
            <div className="max-w-6xl mx-auto">

                {/* Super Offer — top banner */}
                <FadeIn className="mb-16">
                    <div className="relative rounded-3xl overflow-hidden border border-northpeak-green/40 bg-gradient-to-br from-northpeak-green/10 via-northpeak-card to-northpeak-bg p-8 sm:p-10">
                        {/* Glow */}
                        <div className="pointer-events-none absolute -top-20 -left-10 h-64 w-64 rounded-full bg-northpeak-green/20 blur-[80px]" />
                        <div className="pointer-events-none absolute -bottom-10 right-0 h-48 w-48 rounded-full bg-northpeak-green/10 blur-[60px]" />

                        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            {/* Left: info */}
                            <div>
                                <div className="flex items-center gap-3 mb-5">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-northpeak-green text-northpeak-bg text-[11px] font-bold font-mono tracking-wider">
                                        <Sparkles className="h-3 w-3" />
                                        {superOffer.badge}
                                    </span>
                                    <span className="text-xs text-northpeak-text-dim font-mono flex items-center gap-1">
                                        <Timer className="h-3 w-3 text-yellow-400" />
                                        {superOffer.deadline}
                                    </span>
                                </div>

                                <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-northpeak-text tracking-tight leading-tight mb-3">
                                    {superOffer.name}
                                </h2>
                                <p className="text-northpeak-text-muted leading-relaxed mb-6 max-w-md">
                                    {superOffer.tagline}
                                </p>

                                <div className="flex items-end gap-4 mb-8">
                                    <p className="font-heading font-extrabold text-5xl text-northpeak-green leading-none">
                                        {superOffer.price}
                                    </p>
                                    <div>
                                        <p className="font-mono text-northpeak-text-dim line-through text-lg">{superOffer.originalPrice}</p>
                                        <p className="text-northpeak-green text-sm font-bold font-mono">{superOffer.savings}</p>
                                    </div>
                                </div>

                                <Link
                                    href="/analizar"
                                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-base hover:bg-northpeak-green/90 transition-all hover:scale-[1.02] shadow-[0_8px_40px_rgba(0,229,160,0.35)]"
                                >
                                    <Zap className="h-4 w-4" />
                                    Quiero este paquete
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <p className="mt-3 text-xs text-northpeak-text-dim">
                                    Pago único. Sin mensualidades. Sin contratos.
                                </p>
                            </div>

                            {/* Right: what's included */}
                            <div className="rounded-2xl border border-northpeak-surface bg-northpeak-bg/60 backdrop-blur-sm p-6">
                                <p className="font-mono text-[10px] tracking-[0.15em] text-northpeak-green uppercase mb-5">Incluye todo esto</p>
                                <ul className="space-y-3.5">
                                    {superOffer.includes.map((item) => (
                                        <li key={item.label} className="flex items-center gap-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-northpeak-green/15 border border-northpeak-green/20">
                                                <item.Icon className="h-3.5 w-3.5 text-northpeak-green" />
                                            </div>
                                            <span className="text-sm text-northpeak-text">{item.label}</span>
                                            <Check className="h-4 w-4 text-northpeak-green ml-auto shrink-0" />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* One-time services grid */}
                <FadeIn>
                    <div className="mb-10">
                        <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-3">— Servicios sueltos · Pago único</p>
                        <h3 className="font-heading font-bold text-3xl sm:text-4xl text-northpeak-text tracking-tight">
                            O elige solo lo que necesitas.
                        </h3>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {oneTimeServices.map((svc, i) => (
                        <FadeIn key={svc.name} delay={i * 0.07}>
                            <TiltCard intensity={8} className={`rounded-2xl border ${svc.border} bg-northpeak-card flex flex-col gap-4 p-5 h-full`}>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${svc.bg}`}>
                                    <svc.Icon className={`h-5 w-5 ${svc.color}`} />
                                </div>
                                <div>
                                    <h4 className="font-heading font-bold text-base text-northpeak-text leading-snug mb-1">{svc.name}</h4>
                                    <p className={`font-mono font-bold text-xl ${svc.color}`}>
                                        {svc.price}
                                        <span className="text-northpeak-text-dim text-xs font-normal ml-1">pago único</span>
                                    </p>
                                </div>
                                <p className="text-sm text-northpeak-text-muted leading-relaxed">{svc.description}</p>
                                <ul className="space-y-1.5 flex-1">
                                    {svc.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-xs text-northpeak-text-muted">
                                            <Check className={`h-3 w-3 shrink-0 ${svc.color}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/analizar"
                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all border border-northpeak-surface text-northpeak-text-muted hover:border-northpeak-green/30 hover:text-northpeak-text"
                                >
                                    Cotizar
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </TiltCard>
                        </FadeIn>
                    ))}
                </div>

            </div>
        </section>
    );
}

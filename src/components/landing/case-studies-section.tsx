import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FadeIn from "@/components/landing/fade-in";
import AnimatedCounter from "@/components/landing/animated-counter";
import TiltCard from "@/components/portal/tilt-card";
import { caseStudies } from "@/lib/data/landing-data";
import GradientText from "@/components/reactbits/GradientText";

export default function CaseStudiesSection() {
    return (
        <section id="casos" className="py-24 px-5 sm:px-8 border-t border-northpeak-surface bg-northpeak-card/40">
            <div className="max-w-6xl mx-auto">
                <FadeIn className="mb-14">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Resultados reales</p>
                    <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight mb-3">
                        <GradientText colors={["#ffffff", "#00d4ff", "#ffffff"]} animationSpeed={6}>
                            No prometemos, demostramos.
                        </GradientText>
                    </h2>
                    <p className="text-northpeak-text-muted max-w-lg">
                        Negocios en Monterrey que ya venden en piloto automático con NorthPeak.
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {caseStudies.map((cs) => (
                        <div
                            key={cs.industry}
                            className="rounded-2xl h-full"
                            style={{
                                background: `linear-gradient(135deg, ${cs.borderFrom}, transparent 40%)`,
                                padding: "1px",
                            }}
                        >
                            <TiltCard intensity={6} className="rounded-2xl h-full">
                                <div
                                    className="rounded-2xl h-full flex flex-col gap-5 p-6"
                                    style={{ background: `linear-gradient(145deg, ${cs.glow}, #0C0D12 60%)` }}
                                >
                                    <p className={`font-mono text-[10px] tracking-[0.15em] uppercase ${cs.accent}`}>{cs.industry}</p>

                                    <div>
                                        <p className={`font-heading font-extrabold text-5xl leading-none ${cs.accent} mb-1`}>
                                            <AnimatedCounter to={cs.bigStat} prefix={cs.bigStatPrefix} duration={1.5} />
                                        </p>
                                        <p className="text-northpeak-text font-semibold text-lg leading-tight">{cs.bigLabel}</p>
                                        <p className="text-northpeak-text-muted text-sm">{cs.timeframe}</p>
                                    </div>

                                    <p className="text-sm text-northpeak-text-muted leading-relaxed flex-1">{cs.description}</p>

                                    <div className="flex flex-wrap gap-1.5">
                                        {cs.tags.map((t) => (
                                            <span key={t} className="px-2.5 py-1 rounded-full bg-northpeak-surface text-northpeak-text-dim text-[10px] font-medium tracking-wide">
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                                        {cs.metrics.map((m) => (
                                            <div key={m.label}>
                                                <p className={`font-mono font-bold text-lg ${cs.accent} leading-none mb-0.5`}>{m.value}</p>
                                                <p className="text-[10px] text-northpeak-text-dim leading-snug">{m.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TiltCard>
                        </div>
                    ))}
                </div>

                <p className="text-center mt-10">
                    <Link href="/analizar" className="group inline-flex items-center gap-2 text-northpeak-green text-sm font-medium hover:gap-3 transition-all">
                        ¿Puede funcionar para tu negocio? Averígualo gratis
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </p>
            </div>
        </section>
    );
}

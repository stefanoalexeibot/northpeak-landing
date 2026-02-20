import FadeIn from "@/components/landing/fade-in";
import BlurTitle from "@/components/landing/blur-title";
import TiltCard from "@/components/portal/tilt-card";
import { steps } from "@/lib/data/landing-data";

export default function ProcessSection() {
    return (
        <section className="py-24 px-5 sm:px-8 border-t border-northpeak-surface">
            <div className="max-w-6xl mx-auto">
                <FadeIn className="text-center mb-16">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Proceso</p>
                    <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight">
                        <BlurTitle text="De cero a ventas automáticas" />
                    </h2>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    <div className="hidden md:block absolute top-12 left-[calc(16.5%+2rem)] right-[calc(16.5%+2rem)] h-px bg-gradient-to-r from-northpeak-green/40 via-northpeak-green/15 to-northpeak-green/40" />

                    {steps.map((step) => (
                        <TiltCard key={step.num} intensity={6} className="rounded-2xl border border-northpeak-surface bg-northpeak-card p-6 flex flex-col gap-4">
                            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-northpeak-green/10 border border-northpeak-green/20">
                                <step.Icon className="h-6 w-6 text-northpeak-green" />
                                <span className="absolute -top-2 -right-2 font-mono text-[10px] font-bold text-northpeak-green bg-northpeak-bg border border-northpeak-green/30 rounded-full px-1.5 py-0.5">
                                    {step.num}
                                </span>
                            </div>
                            <h3 className="font-heading font-bold text-xl text-northpeak-text">{step.title}</h3>
                            <p className="text-sm text-northpeak-text-muted leading-relaxed">{step.description}</p>
                        </TiltCard>
                    ))}
                </div>
            </div>
        </section>
    );
}

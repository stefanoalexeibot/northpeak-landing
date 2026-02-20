import FadeIn from "@/components/landing/fade-in";
import BlurTitle from "@/components/landing/blur-title";
import TiltCard from "@/components/portal/tilt-card";
import { differentiators } from "@/lib/data/landing-data";

export default function DifferentiatorsSection() {
    return (
        <section className="py-24 px-5 sm:px-8 border-t border-northpeak-surface bg-northpeak-card/40">
            <div className="max-w-6xl mx-auto">
                <FadeIn className="mb-14">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Por qué nosotros</p>
                    <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight mb-3">
                        <BlurTitle text="Lo que nos diferencia." />
                    </h2>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {differentiators.map((d) => (
                        <TiltCard key={d.title} intensity={8} className="rounded-2xl border border-northpeak-surface bg-northpeak-card p-5 flex flex-col gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${d.bg}`}>
                                <d.Icon className={`h-5 w-5 ${d.color}`} />
                            </div>
                            <h3 className="font-heading font-bold text-lg text-northpeak-text leading-snug">{d.title}</h3>
                            <p className="text-sm text-northpeak-text-muted leading-relaxed">{d.description}</p>
                        </TiltCard>
                    ))}
                </div>
            </div>
        </section>
    );
}

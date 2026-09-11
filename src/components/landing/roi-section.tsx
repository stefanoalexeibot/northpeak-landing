import FadeIn from "@/components/landing/fade-in";
import RoiCalculator from "@/components/landing/roi-calculator";
import GradientText from "@/components/reactbits/GradientText";

export default function RoiSection() {
    return (
        <section className="py-24 px-5 sm:px-8 border-t border-northpeak-surface bg-northpeak-card/40">
            <div className="max-w-5xl mx-auto">
                <FadeIn className="text-center mb-14">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Calculadora de ROI</p>
                    <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight mb-3">
                        <GradientText colors={["#ffffff", "#FFD700", "#ffffff"]} animationSpeed={5}>
                            ¿Cuánto podrías ganar?
                        </GradientText>
                    </h2>
                    <p className="text-northpeak-text-muted max-w-lg mx-auto">
                        Ajusta los números de tu negocio y ve el retorno proyectado al automatizar tu proceso de ventas.
                    </p>
                </FadeIn>
                <div className="rounded-2xl border border-northpeak-surface bg-northpeak-card p-6 sm:p-10">
                    <RoiCalculator />
                </div>
            </div>
        </section>
    );
}

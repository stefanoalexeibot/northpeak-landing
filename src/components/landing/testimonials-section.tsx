import { Star } from "lucide-react";
import TiltCard from "@/components/portal/tilt-card";

interface Testimonial {
    id: string;
    rating: number;
    title: string;
    content: string;
    clients: unknown;
}

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className="py-24 px-5 sm:px-8 border-t border-northpeak-surface">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Clientes</p>
                    <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight">
                        Lo que dicen.
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {testimonials.map((t) => {
                        const client = t.clients as unknown as { name: string; company: string } | null;
                        return (
                            <TiltCard key={t.id} intensity={5} className="rounded-2xl border border-northpeak-surface bg-northpeak-card p-6 flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-northpeak-surface fill-northpeak-surface"}`} />
                                        ))}
                                    </div>
                                    <span className="font-heading text-5xl text-northpeak-surface leading-none select-none">&ldquo;</span>
                                </div>

                                {t.title && (
                                    <p className="font-heading font-bold text-northpeak-text">&ldquo;{t.title}&rdquo;</p>
                                )}
                                <p className="text-sm text-northpeak-text-muted leading-relaxed flex-1">{t.content}</p>

                                {client && (
                                    <div className="pt-3 border-t border-northpeak-surface">
                                        <p className="text-sm font-semibold text-northpeak-text">{client.name}</p>
                                        {client.company && <p className="text-xs text-northpeak-text-dim mt-0.5">{client.company}</p>}
                                    </div>
                                )}
                            </TiltCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

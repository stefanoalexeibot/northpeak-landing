"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TiltCard from "@/components/portal/tilt-card";

interface Testimonial {
    id: string;
    rating: number;
    title: string;
    content: string;
    clients: unknown;
}

export default function TestimonialsSection({
    testimonials,
}: {
    testimonials: Testimonial[];
}) {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

    const count = testimonials.length;

    const next = useCallback(() => {
        setDirection(1);
        setCurrent((i) => (i + 1) % count);
    }, [count]);

    const prev = useCallback(() => {
        setDirection(-1);
        setCurrent((i) => (i - 1 + count) % count);
    }, [count]);

    // Auto-advance every 5s
    useEffect(() => {
        if (paused || count <= 1) return;
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [paused, count, next]);

    if (!testimonials || count === 0) return null;

    // Show up to 3 cards at a time on desktop, 1 on mobile
    const getVisibleIndices = () => {
        if (count <= 3) return testimonials.map((_, i) => i);
        const indices: number[] = [];
        for (let offset = 0; offset < Math.min(3, count); offset++) {
            indices.push((current + offset) % count);
        }
        return indices;
    };

    const visible = getVisibleIndices();

    return (
        <section className="py-24 px-5 sm:px-8 border-t border-northpeak-surface">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">
                        — Clientes
                    </p>
                    <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight">
                        Lo que dicen.
                    </h2>
                </div>

                {/* Carousel container */}
                <div
                    className="relative"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    {/* Navigation arrows */}
                    {count > 3 && (
                        <>
                            <button
                                onClick={prev}
                                className="absolute -left-3 lg:-left-12 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-northpeak-surface bg-northpeak-card/90 backdrop-blur-sm text-northpeak-text-muted hover:text-northpeak-green hover:border-northpeak-green/30 transition-all"
                                aria-label="Anterior"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={next}
                                className="absolute -right-3 lg:-right-12 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-northpeak-surface bg-northpeak-card/90 backdrop-blur-sm text-northpeak-text-muted hover:text-northpeak-green hover:border-northpeak-green/30 transition-all"
                                aria-label="Siguiente"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </>
                    )}

                    {/* Cards grid */}
                    <AnimatePresence mode="popLayout" custom={direction}>
                        <motion.div
                            key={current}
                            custom={direction}
                            initial={{ opacity: 0, x: direction * 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: direction * -60 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {visible.map((idx) => {
                                const t = testimonials[idx];
                                const client = t.clients as unknown as {
                                    name: string;
                                    company: string;
                                } | null;
                                return (
                                    <TiltCard
                                        key={t.id}
                                        intensity={5}
                                        className="rounded-2xl border border-northpeak-surface bg-northpeak-card p-6 flex flex-col gap-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3.5 w-3.5 ${i < t.rating
                                                                ? "text-yellow-400 fill-yellow-400"
                                                                : "text-northpeak-surface fill-northpeak-surface"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-heading text-5xl text-northpeak-surface leading-none select-none">
                                                &ldquo;
                                            </span>
                                        </div>

                                        {t.title && (
                                            <p className="font-heading font-bold text-northpeak-text">
                                                &ldquo;{t.title}&rdquo;
                                            </p>
                                        )}
                                        <p className="text-sm text-northpeak-text-muted leading-relaxed flex-1">
                                            {t.content}
                                        </p>

                                        {client && (
                                            <div className="pt-3 border-t border-northpeak-surface">
                                                <p className="text-sm font-semibold text-northpeak-text">
                                                    {client.name}
                                                </p>
                                                {client.company && (
                                                    <p className="text-xs text-northpeak-text-dim mt-0.5">
                                                        {client.company}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </TiltCard>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {/* Dot indicators */}
                    {count > 3 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            {Array.from({ length: Math.ceil(count / 3) }).map((_, i) => {
                                const groupStart = i * 3;
                                const isActive =
                                    current >= groupStart && current < groupStart + 3;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setDirection(i * 3 > current ? 1 : -1);
                                            setCurrent(i * 3);
                                        }}
                                        className={`h-2 rounded-full transition-all duration-300 ${isActive
                                                ? "w-6 bg-northpeak-green"
                                                : "w-2 bg-northpeak-surface hover:bg-northpeak-text-dim"
                                            }`}
                                        aria-label={`Grupo ${i + 1}`}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

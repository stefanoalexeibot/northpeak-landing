"use client";

import React, { useRef, useEffect } from "react";
import { useInView } from "framer-motion";

interface SectionWrapperProps {
    children: React.ReactNode;
    index: number;
    onVisible: (index: number) => void;
}

export function SectionWrapper({ children, index, onVisible }: SectionWrapperProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.5 });

    useEffect(() => {
        if (isInView) {
            onVisible(index);
        }
    }, [isInView, index, onVisible]);

    return (
        <section ref={ref} className="min-h-screen flex items-center justify-center p-8 relative">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {children}
            </div>
        </section>
    );
}

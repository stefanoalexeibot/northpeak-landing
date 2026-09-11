"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface DockItem {
    icon: LucideIcon;
    label: string;
    href?: string;
    onClick?: () => void;
}

interface DockProps {
    items: DockItem[];
    className?: string;
    baseSize?: number;
    hoverScale?: number;
}

export default function Dock({
    items,
    className = "",
    baseSize = 48,
    hoverScale = 1.5,
}: DockProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const getScale = (i: number) => {
        if (hoveredIndex === null) return 1;
        const diff = Math.abs(hoveredIndex - i);
        if (diff === 0) return hoverScale;
        if (diff === 1) return 1 + (hoverScale - 1) * 0.5;
        if (diff === 2) return 1 + (hoverScale - 1) * 0.15;
        return 1;
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-end gap-1.5 px-3 py-2 rounded-2xl bg-northpeak-card/80 border border-northpeak-surface backdrop-blur-xl shadow-2xl">
                {items.map((item, i) => {
                    const Icon = item.icon;
                    const scale = getScale(i);
                    const isHovered = hoveredIndex === i;

                    const content = (
                        <motion.div
                            key={item.label}
                            className="relative flex items-center justify-center rounded-xl bg-northpeak-surface/60 hover:bg-northpeak-green/10 cursor-pointer transition-colors"
                            style={{ width: baseSize, height: baseSize }}
                            animate={{ scale, y: isHovered ? -8 : 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={item.onClick}
                        >
                            <Icon className="w-5 h-5 text-northpeak-text-muted" />

                            <AnimatePresence>
                                {isHovered && (
                                    <motion.div
                                        className="absolute -top-9 left-1/2 px-2.5 py-1 rounded-lg bg-northpeak-bg border border-northpeak-surface text-northpeak-text text-xs font-medium whitespace-nowrap"
                                        initial={{ opacity: 0, y: 4, x: "-50%" }}
                                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                                        exit={{ opacity: 0, y: 4, x: "-50%" }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {item.label}
                                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-northpeak-bg border-r border-b border-northpeak-surface" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );

                    if (item.href) {
                        return (
                            <a key={item.label} href={item.href}>
                                {content}
                            </a>
                        );
                    }
                    return content;
                })}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StackProps {
    children: React.ReactNode[];
    className?: string;
    offset?: number;
    scaleFactor?: number;
}

export default function Stack({
    children,
    className = "",
    offset = 8,
    scaleFactor = 0.05,
}: StackProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={`relative cursor-pointer ${className}`}
            onClick={() => setExpanded(!expanded)}
        >
            <AnimatePresence mode="popLayout">
                {children.map((child, i) => {
                    const stackIndex = children.length - 1 - i;

                    return (
                        <motion.div
                            key={i}
                            className={`${i !== children.length - 1 ? "absolute inset-x-0 top-0" : "relative"}`}
                            initial={false}
                            animate={{
                                y: expanded ? i * (offset * 12) : stackIndex * -offset,
                                scale: expanded ? 1 : 1 - stackIndex * scaleFactor,
                                opacity: expanded ? 1 : Math.max(1 - stackIndex * 0.25, 0.2),
                                zIndex: expanded ? i : i,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                                mass: 0.8,
                            }}
                            style={{ originY: 0 }}
                        >
                            {child}
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Expand indicator */}
            {!expanded && children.length > 1 && (
                <motion.div
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                >
                    {children.map((_, i) => (
                        <div
                            key={i}
                            className="w-1 h-1 rounded-full bg-northpeak-text-muted"
                        />
                    ))}
                </motion.div>
            )}
        </div>
    );
}

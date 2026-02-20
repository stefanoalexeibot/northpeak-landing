"use client";

import { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";

interface MagnetProps {
    children: ReactNode;
    className?: string;
    strength?: number;
    range?: number;
    disabled?: boolean;
}

export default function Magnet({
    children,
    className = "",
    strength = 0.3,
    range = 100,
    disabled = false,
}: MagnetProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (disabled || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < range) {
            setPosition({
                x: distX * strength,
                y: distY * strength,
            });
        }
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 300, damping: 15, mass: 0.2 }}
        >
            {children}
        </motion.div>
    );
}

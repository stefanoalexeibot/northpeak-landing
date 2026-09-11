"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StickyMobileCta() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 600);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden"
                >
                    <Link
                        href="/analizar"
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-sm shadow-[0_-4px_30px_rgba(0,229,160,0.3)] hover:bg-northpeak-green/90 transition-all"
                    >
                        <Zap className="h-4 w-4" />
                        Analizar mi negocio gratis
                    </Link>
                    <div className="h-[env(safe-area-inset-bottom)]" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

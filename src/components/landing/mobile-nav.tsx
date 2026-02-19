"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Zap } from "lucide-react";

const links = [
  { label: "Soluciones", href: "#servicios" },
  { label: "Pago único", href: "#pago-unico" },
  { label: "Resultados", href: "#casos" },
  { label: "FAQ", href: "#preguntas" },
  { label: "Portal", href: "/portal/dashboard" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-northpeak-surface text-northpeak-text-muted hover:text-northpeak-text transition-colors"
        aria-label="Menú"
      >
        {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 bg-northpeak-bg/80 backdrop-blur-sm z-40"
              onClick={close}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-0 right-0 top-16 z-50 bg-northpeak-bg border-b border-northpeak-surface px-5 py-5"
            >
              <nav className="space-y-1 mb-5">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={close}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-northpeak-text-muted hover:text-northpeak-text hover:bg-northpeak-card transition-all text-base font-medium"
                  >
                    {l.label}
                    <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                  </a>
                ))}
              </nav>

              <Link
                href="/analizar"
                onClick={close}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-sm"
              >
                <Zap className="h-4 w-4" />
                Analizar mi negocio gratis
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
